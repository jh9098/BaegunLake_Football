import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, getDoc, doc, orderBy, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Loader2 } from 'lucide-react';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 자녀 정보를 표시하는 컴포넌트
const ChildDashboard = ({ childId }) => {
  const [childData, setChildData] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 자녀 기본 정보 실시간 구독
    const childDocRef = doc(db, 'children', childId);
    const unsubscribeChild = onSnapshot(childDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setChildData({ id: docSnap.id, ...docSnap.data() });
      }
    });

    // 가장 최신 성취 리포트 1개 가져오기 (실시간)
    const reportsQuery = query(
      collection(db, 'progressReports'),
      where('childId', '==', childId),
      orderBy('date', 'desc'),
      limit(1)
    );
    const unsubscribeReport = onSnapshot(reportsQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        setLatestReport(querySnapshot.docs[0].data());
      }
      setLoading(false);
    });

    return () => {
      unsubscribeChild();
      unsubscribeReport();
    };
  }, [childId]);

  if (loading) {
    return <Card className="p-4"><Loader2 className="animate-spin text-brand-green" /></Card>;
  }
  
  if (!childData) {
    return <Card className="p-4"><p>자녀 정보를 불러올 수 없습니다.</p></Card>;
  }

  const progressData = {
    labels: ['슈팅', '드리블', '패스', '체력', '팀워크'],
    datasets: [{
      label: '성취도',
      data: [
        latestReport?.stats?.shooting || 0,
        latestReport?.stats?.dribbling || 0,
        latestReport?.stats?.passing || 0,
        latestReport?.stats?.stamina || 0,
        latestReport?.stats?.teamwork || 0,
      ],
      backgroundColor: 'rgba(0, 98, 65, 0.6)', // brand-green 헥스코드에 맞춰 RGBA 값 사용
      borderColor: 'rgba(0, 98, 65, 1)',
      borderWidth: 1,
    }]
  };
  
  const options = { responsive: true, scales: { y: { beginAtZero: true, max: 10 } } };

  return (
    <div className="space-y-6 border p-6 rounded-lg bg-slate-50">
      <h2 className="text-2xl font-bold">{childData.name} ({childData.team})</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>실시간 출결</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold text-center text-brand-green">{childData.attendanceStatus || '미등원'}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>최신 훈련 영상</CardTitle></CardHeader>
          <CardContent>
            {latestReport?.videoUrl ? (
              <video src={latestReport.videoUrl} controls className="w-full rounded-md"></video>
            ) : <p>업로드된 영상이 없습니다.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>코치 코멘트</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{latestReport?.notes || '작성된 코멘트가 없습니다.'}</p></CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader><CardTitle>{childData.name} 학생 최신 성취 그래프</CardTitle></CardHeader>
          <CardContent><Bar data={progressData} options={options} /></CardContent>
        </Card>
      </div>
    </div>
  );
};


export default function DashboardPage() {
  const { userData } = useAuth();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">학부모 대시보드</h1>
      {userData && userData.children && userData.children.length > 0 ? (
        <div className="space-y-10">
          {userData.children.map(childId => (
            <ChildDashboard key={childId} childId={childId} />
          ))}
        </div>
      ) : (
        <p>등록된 자녀 정보가 없습니다. 학원에 문의해주세요.</p>
      )}
    </div>
  );
}