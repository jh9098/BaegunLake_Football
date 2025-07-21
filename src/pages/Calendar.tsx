import { Calendar as RBC } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { localizer } from "../lib/calendar";
import { useState } from "react";

type Event = { id: string; title: string; start: Date; end: Date; place: string };

export default function Calendar() {
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "드리블 훈련 @A구장",
      start: new Date(),
      end: new Date(new Date().setHours(new Date().getHours() + 2)),
      place: "A구장"
    },
    {
      id: "2",
      title: "친선 경기 @B구장",
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
      place: "B구장"
    }
  ]);

  return (
    <section className="mx-auto max-w-5xl p-4 h-[80vh]">
      <h2 className="text-xl font-semibold mb-4">훈련 일정</h2>
      <RBC
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        popup
        style={{ height: "100%" }}
        messages={{
          next: "다음",
          previous: "이전",
          month: "월",
          week: "주",
          day: "일",
          today: "오늘"
        }}
      />
    </section>
  );
}
