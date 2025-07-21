import { useState } from 'react';
import dayjs from 'dayjs';

type Session = { date: string; title: string; place: string };
const dummy: Session[] = [
  { date: dayjs().format('YYYY-MM-DD'), title: '드리블 훈련', place: 'A구장' },
  { date: dayjs().add(2, 'day').format('YYYY-MM-DD'), title: '친선 경기', place: 'B구장' }
];

export default function Calendar() {
  const [sessions] = useState(dummy);
  return (
    <section className="mx-auto max-w-4xl p-4">
      <h2 className="text-xl font-semibold mb-4">훈련 일정</h2>
      <ul className="space-y-3">
        {sessions.map(s => (
          <li key={s.date} className="rounded bg-white p-4 shadow flex justify-between">
            <span>{dayjs(s.date).format('M월 D일 (ddd)')}</span>
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-gray-500">{s.place}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
