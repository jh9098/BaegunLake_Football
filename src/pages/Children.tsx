// src/pages/Children.tsx
import { useState } from "react";
import { useClub, Child, AttendanceStatus } from "../app/store";
import dayjs from "dayjs";

// CardDescription을 import 목록에 추가합니다.
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription as DialogDesc } from "@/components/ui/dialog"; // DialogDescription과 이름 충돌을 피하기 위해 별칭 사용
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ChartPieSlice, UserSwitch } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

export default function ChildrenPage() {
  const { currentUser, children, login } = useClub();

  const pageTitle = currentUser?.role === 'coach' ? "원생 관리" : "내 아이 정보";
  const pageDescription = currentUser?.role === 'coach' 
    ? "훈련 세션별 출석을 관리하고 훈련 성과를 기록하세요."
    : "자녀의 프로필과 훈련 성과를 확인하세요.";

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
        {/* 임시 역할 전환 버튼 (데모용) */}
        <Button variant="outline" size="sm" onClick={() => login(currentUser?.role === 'parent' ? 'coach' : 'parent')}>
            <UserSwitch className="mr-2 h-4 w-4" />
            {currentUser?.role === 'parent' ? "코치 모드로 전환" : "학부모 모드로 전환"}
        </Button>
      </div>

      {currentUser?.role === 'coach' 
        ? <CoachView />
        : <ParentView />
      }
    </div>
  );
}

// --- 보호자 뷰 ---
function ParentView() {
    const { children } = useClub();
    return (
         <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {children.map(c => <ChildCard key={c.id} child={c} />)}
        </div>
    )
}

function ChildCard({ child }: { child: Child }) {
  const { getMetricsByChild } = useClub();
  const metrics = getMetricsByChild(child.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <Avatar className="h-16 w-16 border">
          <AvatarImage src={child.avatar} alt={child.name} />
          <AvatarFallback>{child.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-2xl">{child.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{child.grade} / {child.position}</p>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2 text-sm">최근 훈련 성과</h4>
        {metrics.length > 0 ? (
          <div className="space-y-2">
            {metrics.slice(-1).map(m => (
                <div key={m.id} className="text-sm bg-muted/50 p-3 rounded-md">
                   <p className="font-semibold mb-2">"{m.comment}"</p>
                   <p className="text-xs text-right text-muted-foreground">- 손흥민 코치</p>
                </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">기록된 훈련 성과가 없습니다.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
            <ChartPieSlice className="mr-2 h-4 w-4" /> 상세 성취도 리포트 보기
        </Button>
      </CardFooter>
    </Card>
  );
}


// --- 코치 뷰 ---
function CoachView() {
    const { sessions, children } = useClub();
    return (
        <Tabs defaultValue={sessions[0]?.id || "none"}>
            <TabsList className="mb-6">
                {sessions.map(s => (
                    <TabsTrigger key={s.id} value={s.id}>
                        {dayjs(s.start).format("M/D")} {s.title}
                    </TabsTrigger>
                ))}
            </TabsList>
            {sessions.map(s => (
                <TabsContent key={s.id} value={s.id}>
                    <AttendanceManager sessionId={s.id} children={children} />
                </TabsContent>
            ))}
        </Tabs>
    );
}

function AttendanceManager({ sessionId, children }: { sessionId: string; children: Child[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>출석 및 성과 기록</CardTitle>
                <CardDescription>원생의 출석 상태를 변경하고 훈련 성과를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                {children.map(child => (
                    <ChildAttendanceRow key={child.id} sessionId={sessionId} child={child} />
                ))}
            </CardContent>
        </Card>
    );
}

function ChildAttendanceRow({ sessionId, child }: { sessionId: string, child: Child }) {
    const { attendance, updateAttendance } = useClub();
    const currentStatus = attendance.find(a => a.sessionId === sessionId && a.childId === child.id)?.status || 'pending';

    const statusMap: Record<AttendanceStatus, string> = {
        present: 'bg-green-500',
        late: 'bg-yellow-500',
        absent: 'bg-red-500',
        pending: 'bg-gray-400',
    }

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={child.avatar} />
                    <AvatarFallback>{child.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{child.grade}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Select value={currentStatus} onValueChange={(v: AttendanceStatus) => updateAttendance(sessionId, child.id, v)}>
                    <SelectTrigger className="w-[100px] h-9">
                        <div className="flex items-center gap-2">
                           <span className={`inline-block h-2 w-2 rounded-full ${statusMap[currentStatus]}`}></span>
                           <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="present">출석</SelectItem>
                        <SelectItem value="late">지각</SelectItem>
                        <SelectItem value="absent">결석</SelectItem>
                        <SelectItem value="pending">대기</SelectItem>
                    </SelectContent>
                </Select>
                <AddMetricDialog sessionId={sessionId} child={child} />
            </div>
        </div>
    )
}


function AddMetricDialog({ sessionId, child }: { sessionId: string; child: Child }) {
    // ... 상세 훈련 성과(Metric) 입력 다이얼로그 (생략, 기존 코드 활용 가능)
    // 이 버튼을 누르면 패스, 드리블, 스피드 등 점수와 코멘트를 입력하는 모달이 열립니다.
    return (
         <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" disabled={false}><PlusCircle /></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{child.name} - 훈련 성과 기록</DialogTitle>
                </DialogHeader>
                 {/* 폼 UI ... */}
                 <p className="text-center py-8 text-muted-foreground">(상세 점수 입력 폼 구현 영역)</p>
                 <DialogFooter>
                    <Button>저장</Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}