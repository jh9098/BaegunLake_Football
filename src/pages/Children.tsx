import { useState } from "react";
import { useClub, Child } from "../app/store";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import dayjs from "dayjs";

export default function Children() {
  const { children, addChild } = useClub();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", position: "" });

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* 상단 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">자녀 프로필</h2>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>+ 새 자녀</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <h3 className="font-medium text-lg mb-4">자녀 정보 등록</h3>
            <div className="space-y-3">
              {["name:이름", "grade:학년", "position:포지션"].map(row => {
                const [field, label] = row.split(":");
                return (
                  <input
                    key={field}
                    className="w-full rounded border p-2"
                    placeholder={label}
                    value={(form as any)[field]}
                    onChange={e =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                  />
                );
              })}
              <Button
                className="w-full"
                onClick={() => {
                  addChild(form);
                  setForm({ name: "", grade: "", position: "" });
                  setAddOpen(false);
                }}
              >
                저장
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs by position */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">전체 ({children.length})</TabsTrigger>
          <TabsTrigger value="FW">공격</TabsTrigger>
          <TabsTrigger value="DF">수비</TabsTrigger>
        </TabsList>

        {["all", "FW", "DF"].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="grid gap-4 sm:grid-cols-2">
              {children
                .filter(c => tab === "all" || c.position === tab)
                .map(c => (
                  <ChildCard key={c.id} child={c} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/* ---------- ChildCard 컴포넌트 ---------- */
function ChildCard({ child }: { child: Child }) {
  const trainings = useClub(s => s.getTrainingsByChild(child.id));
  const { addTraining } = useClub();
  const [modal, setModal] = useState(false);
  const [input, setInput] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    skill: "드리블",
    score: 70,
    note: ""
  });

  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={child.avatar} />
          <AvatarFallback>{child.name[0]}</AvatarFallback>
        </Avatar>
        <CardTitle>{child.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">학년: {child.grade}</p>
        <p className="text-sm">포지션: {child.position}</p>

        <Button size="sm" onClick={() => setModal(true)}>
          훈련 기록 +
        </Button>

        <ul className="mt-2 space-y-1 text-xs">
          {trainings.slice(-3).reverse().map(t => (
            <li key={t.id} className="flex justify-between">
              <span>
                {t.date} {t.skill}
              </span>
              <span>{t.score}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {/* 모달 */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-4 w-80 space-y-3">
            <h3 className="font-semibold text-lg">
              {child.name} 훈련 기록
            </h3>
            <input
              type="date"
              className="w-full border rounded p-2 text-sm"
              value={input.date}
              onChange={e => setInput({ ...input, date: e.target.value })}
            />
            <input
              className="w-full border rounded p-2 text-sm"
              placeholder="종목 (드리블)"
              value={input.skill}
              onChange={e => setInput({ ...input, skill: e.target.value })}
            />
            <input
              type="number"
              className="w-full border rounded p-2 text-sm"
              placeholder="점수(0~100)"
              value={input.score}
              onChange={e =>
                setInput({ ...input, score: Number(e.target.value) })
              }
            />
            <textarea
              className="w-full border rounded p-2 text-sm"
              placeholder="코멘트"
              value={input.note}
              onChange={e => setInput({ ...input, note: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModal(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addTraining({ childId: child.id, ...input });
                  setModal(false);
                }}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
