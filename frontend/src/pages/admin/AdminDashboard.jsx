import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Calendar, BarChart, Loader2 } from "lucide-react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalParents: 0, totalChildren: 0, todaySessions: 0 });
  const [todaySessions, setTodaySessions] = useState([]);
  const [recentParents, setRecentParents] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- 통계 및 최근 회원 데이터 로드 ---
    const unsubParents = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, totalParents: snap.size }));
      // 최근 가입한 5명 (parent 역할만)
      const recentQuery = query(
        collection(db, 'users'),
        where('role', '==', 'parent'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      onSnapshot(recentQuery, (recentSnap) => {
        setRecentParents(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    });

    // --- 학생 데이터 로드 (통계 및 차트용) ---
    const unsubChildren = onSnapshot(collection(db, 'children'), (snap) => {
      setStats(prev => ({ ...prev, totalChildren: snap.size }));

      // 이번 달 등록 학생 수 차트 데이터 가공
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const dailyCounts = Array(daysInMonth).fill(0);
      const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);
      
      snap.docs.forEach(doc => {
        const child = doc.data();
        if (child.createdAt && child.createdAt.toDate() >= startOfMonth) {
          const day = child.createdAt.toDate().getDate() - 1;
          dailyCounts[day]++;
        }
      });

      setMonthlyChartData({
        labels,
        datasets: [{
          label: '일별 등록 학생 수',
          data: dailyCounts,
          backgroundColor: 'rgba(0, 98, 65, 0.6)',
          borderColor: 'rgba(0, 98, 65, 1)',
          borderWidth: 1,
        }]
      });
    });

    // --- 오늘의 훈련 세션 데이터 로드 ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('date', '>=', Timestamp.fromDate(todayStart)),
      where('date', '<=', Timestamp.fromDate(todayEnd)),
      orderBy('date'),
      orderBy('startTime')
    );
    const unsubSessions = onSnapshot(sessionsQuery, (snap) => {
      setTodaySessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats(prev => ({ ...prev, todaySessions: snap.size }));
    });

    // 모든 리스너가 설정된 후 로딩 완료
    Promise.all([unsubParents, unsubChildren, unsubSessions]).then(() => setLoading(false));
    
    return () => {
      unsubParents();
      unsubChildren();
      unsubSessions();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">관리자 대시보드</h1>
      
      {/* 핵심 통계 카드 */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학부모 회원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalParents} 명</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학생 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalChildren} 명</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘의 훈련 세션</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.todaySessions} 건</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 오늘의 훈련 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>오늘의 훈련 목록</CardTitle>
            <CardDescription>{new Date().toLocaleDateString('ko-KR')} 진행 예정인 훈련입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {todaySessions.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>시간</TableHead><TableHead>훈련명</TableHead><TableHead>대상</TableHead></TableRow></TableHeader>
                <TableBody>
                  {todaySessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono">{session.startTime}</TableCell>
                      <TableCell className="font-medium">{session.title}</TableCell>
                      <TableCell>{session.targetTeam}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p className="text-center text-gray-500 py-8">오늘 예정된 훈련이 없습니다.</p>}
          </CardContent>
        </Card>

        {/* 최근 등록 회원 */}
        <Card>
          <CardHeader><CardTitle>최근 등록 회원 (학부모)</CardTitle></CardHeader>
          <CardContent>
            {recentParents.length > 0 ? (
              <div className="space-y-4">
                {recentParents.map(parent => (
                  <div key={parent.id} className="flex items-center">
                    <img src={parent.profileImageUrl} alt={parent.displayName} className="w-10 h-10 rounded-full mr-4"/>
                    <div>
                      <p className="font-semibold">{parent.displayName}</p>
                      <p className="text-sm text-gray-500">{parent.email}</p>
                    </div>
                    <p className="ml-auto text-xs text-gray-400">{format(parent.createdAt.toDate(), 'yyyy.MM.dd')}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 py-8">최근 등록한 회원이 없습니다.</p>}
          </CardContent>
        </Card>
      </div>

      {/* 월간 등록 현황 차트 */}
      <Card>
          <CardHeader><CardTitle>이번 달 학생 등록 현황</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </CardContent>
      </Card>

    </div>
  );
}