// src/pages/Dashboard.tsx
import { useClub } from '../app/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, DribbbleLogo, PersonSimpleRun, ShieldCheckered, FirstAidKit, Lightning } from '@phosphor-icons/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const metricIcons: { [key: string]: React.ReactNode } = {
  pass: <Target />,
  dribble: <DribbbleLogo />,
  speed: <Lightning />,
  shooting: <ShieldCheckered />,
  stamina: <FirstAidKit />,
};

export default function Dashboard() {
  const { currentUser, getChildrenByParent, getMetricsByChild } = useClub();
  
  if (!currentUser) return <div>로그인이 필요합니다.</div>;
  
  const children = getChildrenByParent(currentUser.id);

  return (
    <main className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">우리 아이의 성장 기록을 한눈에 확인하세요.</p>
      </div>

      <div className="grid gap-8">
        {children.map(child => {
          const latestMetric = getMetricsByChild(child.id).slice(-1)[0];
          return (
            <Card key={child.id}>
              <CardHeader>
                  <div className='flex items-center gap-4'>
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage src={child.avatar} />
                        <AvatarFallback>{child.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className='text-2xl'>{child.name}</CardTitle>
                        <CardDescription>{child.grade} / {child.position}</CardDescription>
                    </div>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {latestMetric ? (
                  <>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-semibold text-blue-800">" {latestMetric.comment} "</p>
                        <p className="text-xs text-right mt-2 text-blue-600">- 손흥민 코치</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
                      {Object.entries(metricIcons).map(([key, icon]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <div className="flex items-center text-sm font-medium text-muted-foreground gap-1">
                            {icon} {key.charAt(0).toUpperCase() + key.slice(1)}
                          </div>
                          <Progress value={latestMetric[key as keyof typeof latestMetric] as number} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">아직 기록된 훈련 성과가 없습니다.</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  );
}