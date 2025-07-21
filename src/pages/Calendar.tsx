// src/pages/Calendar.tsx
import { useState } from "react";
import { Calendar as RBC, Views, ToolbarProps, Event as BigCalendarEvent } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import dayjs from "dayjs";

// useClub 스토어와 타입을 가져옵니다.
import { useClub, Session } from "../app/store";
import { localizer } from "../lib/calendar";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar as CalendarIcon } from "@phosphor-icons/react"

const DnDCalendar = withDragAndDrop(RBC);

// BigCalendar의 Event와 우리 Session을 매핑
interface CalendarEvent extends BigCalendarEvent {
  id: string;
  place: string;
}

export default function CalendarPage() {
  const { sessions } = useClub(); // 스토어에서 sessions 데이터를 가져옵니다.
  const [selectedEvent, setSelectedEvent] = useState<Session | null>(null);

  // 우리 Session 데이터를 BigCalendar가 이해하는 Event 형태로 변환
  const formattedSessions: CalendarEvent[] = sessions.map(s => ({
    ...s,
    resource: s.id, // DnD를 위해 필요
  }));

  return (
    <section className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">훈련 일정</h1>
        <p className="text-muted-foreground">전체 훈련 및 경기 일정을 확인하고 관리하세요.</p>
      </div>
      <div className="h-[80vh] bg-card p-4 rounded-lg shadow-sm">
        <DndProvider backend={HTML5Backend}>
          <DnDCalendar
            localizer={localizer}
            events={formattedSessions} // 변환된 데이터를 사용
            defaultView={Views.MONTH}
            style={{ height: "100%" }}
            selectable
            popup
            onSelectEvent={(event: BigCalendarEvent) => {
                const session = sessions.find(s => s.id === (event as CalendarEvent).id);
                if(session) setSelectedEvent(session);
            }}
            messages={{
              next: "다음", previous: "이전", month: "월", week: "주", day: "일", today: "오늘",
              showMore: total => `+${total}개 더보기`,
            }}
            eventPropGetter={(event) => ({
              className: "bg-primary border-none text-primary-foreground p-1 rounded-md cursor-pointer",
              title: `${event.title} @ ${ (event as CalendarEvent).place}`
            })}
            components={{ toolbar: CustomToolbar }}
          />
        </DndProvider>
      </div>

      {selectedEvent && (
        <AlertDialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <CalendarIcon size={24} />
                        {selectedEvent.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        <p><strong>장소:</strong> {selectedEvent.place}</p>
                        <p><strong>시간:</strong> {dayjs(selectedEvent.start).format('M월 D일 HH:mm')} ~ {dayjs(selectedEvent.end).format('HH:mm')}</p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction>확인</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
}

function CustomToolbar({ label, onNavigate, onView, view }: ToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center px-2 py-2 bg-card mb-2 rounded-t-md">
      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
        <Button size="sm" variant="outline" onClick={() => onNavigate("PREV")}>←</Button>
        <Button size="sm" variant="outline" onClick={() => onNavigate("TODAY")}>오늘</Button>
        <Button size="sm" variant="outline" onClick={() => onNavigate("NEXT")}>→</Button>
      </div>
      <span className="text-lg font-bold order-first sm:order-none mb-2 sm:mb-0">{label}</span>
      <div className="space-x-1">
        {(["month", "week", "day"] as const).map(v => (
          <Button
            key={v}
            size="sm"
            variant={view === v ? "default" : "outline"}
            onClick={() => onView(v)}
          >
            {v === "month" ? "월" : v === "week" ? "주" : "일"}
          </Button>
        ))}
      </div>
    </div>
  );
}