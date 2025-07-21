import {
  Calendar as RBC,
  Views,
  ToolbarProps
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { localizer } from "../lib/calendar";
import { useClub } from "../app/store";
import { useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";

const DnDCalendar = withDragAndDrop(RBC);

export default function Calendar() {
  const { events, addEvent, moveEvent } = useClub();
  const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(
    null
  );

  /* ---------- 새 일정 저장 ---------- */
  const handleSave = (title: string, place: string) => {
    if (!slotInfo) return;
    addEvent({ title, place, start: slotInfo.start, end: slotInfo.end });
    setSlotInfo(null);
  };

  /* ---------- 렌더 ---------- */
  return (
    <section className="mx-auto max-w-5xl p-4 h-[80vh]">
      <h2 className="text-xl font-semibold mb-4">훈련 일정</h2>

      <DndProvider backend={HTML5Backend}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          defaultView={Views.MONTH}
          style={{ height: "100%" }}
          selectable
          popup
          onEventDrop={({ event, start, end }) =>
            moveEvent(event.id as string, start, end)
          }
          onSelectSlot={({ start, end }) => setSlotInfo({ start, end })}
          messages={{
            next: "다음",
            previous: "이전",
            month: "월",
            week: "주",
            day: "일",
            today: "오늘"
          }}
          eventPropGetter={() => ({
            className: "bg-primary/80 text-white"
          })}
          components={{ toolbar: CustomToolbar }}
        />
      </DndProvider>

      {slotInfo && (
        <QuickAdd
          slot={slotInfo}
          onCancel={() => setSlotInfo(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

/* ---------- 커스텀 툴바 (월/주/일 토글 버튼) ---------- */
function CustomToolbar({ label, onNavigate, onView, view }: ToolbarProps) {
  return (
    <div className="flex justify-between items-center px-2 py-1 bg-white border rounded mb-2">
      <div className="space-x-1">
        <Button size="sm" variant="outline" onClick={() => onNavigate("PREV")}>
          ←
        </Button>
        <Button size="sm" variant="outline" onClick={() => onNavigate("TODAY")}>
          오늘
        </Button>
        <Button size="sm" variant="outline" onClick={() => onNavigate("NEXT")}>
          →
        </Button>
      </div>
      <span className="font-medium">{label}</span>
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

/* ---------- QuickAdd 모달 (간단 구현) ---------- */
function QuickAdd({
  slot,
  onSave,
  onCancel
}: {
  slot: { start: Date; end: Date };
  onSave: (title: string, place: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-4 w-80 space-y-3">
        <h3 className="font-semibold text-lg">새 일정</h3>
        <p className="text-sm">
          {dayjs(slot.start).format("M/D HH:mm")} –{" "}
          {dayjs(slot.end).format("M/D HH:mm")}
        </p>
        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="제목"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="장소"
          value={place}
          onChange={e => setPlace(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(title || "훈련", place || "-");
            }}
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
