// src/pages/Home.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ChatsCircle, ChartLineUp, ShieldCheck } from "@phosphor-icons/react";

export default function Home() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:py-20">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary tracking-tight">
          데이터로 증명하는 우리 아이의 성장
        </h1>
        <p className="mb-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          백운호수 FC는 체계적인 훈련과 AI 퍼포먼스 리포트를 통해<br />
          모든 아이들의 잠재력을 최대로 이끌어냅니다.
        </p>
        <Button size="lg" className="text-base font-bold group shadow-lg">
          카카오로 3초 만에 시작하기 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </section>

      {/* 주요 가치 제안 */}
      <section className="mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
              <ChatsCircle size={32} weight="duotone" />
            </div>
            <h3 className="text-xl font-bold">실시간 소통</h3>
            <p className="text-muted-foreground">훈련 일정, 출석, 평가 알림을 카카오톡으로 바로 받아보세요.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600">
              <ChartLineUp size={32} weight="duotone" />
            </div>
            <h3 className="text-xl font-bold">성장 리포트</h3>
            <p className="text-muted-foreground">AI가 분석한 자녀의 성취도를 그래프와 코멘트로 한눈에 확인하세요.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600">
              <ShieldCheck size={32} weight="duotone" />
            </div>
            <h3 className="text-xl font-bold">안전한 환경</h3>
            <p className="text-muted-foreground">검증된 코치진과 체계적인 시스템으로 아이의 안전을 최우선으로 합니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
}