import { useState } from "react";
import { useClub } from "../app/store";

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

export default function Children() {
  const { children, addChild } = useClub();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", position: "" });

  const handleSubmit = () => {
    addChild(form);
    setForm({ name: "", grade: "", position: "" });
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">자녀 프로필</h2>
        <Dialog open={open} onOpenChange={setOpen}>
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
              <Button className="w-full" onClick={handleSubmit}>
                저장
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  <Card key={c.id}>
                    <CardHeader className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={c.avatar} />
                        <AvatarFallback>{c.name[0]}</AvatarFallback>
                      </Avatar>
                      <CardTitle>{c.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">학년: {c.grade}</p>
                      <p className="text-sm">포지션: {c.position}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
