import { useState } from 'react';

export default function Dashboard() {
  const [score] = useState({ pass: 70, dribble: 60, speed: 80 });

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h2 className="text-xl font-semibold mb-4">자녀 성취도</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(score).map(([k, v]) => (
          <div
            key={k}
            className="rounded bg-white p-4 shadow flex flex-col items-center"
          >
            <span className="text-sm text-gray-500">{k}</span>
            <span className="text-3xl font-bold text-primary">{v}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
