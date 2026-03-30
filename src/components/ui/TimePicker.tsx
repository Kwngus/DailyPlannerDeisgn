"use client";

const MINUTES = [0, 10, 20, 30, 40, 50];

type Props = {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
};

function roundToTen(min: number): number {
  return Math.round(min / 10) * 10 % 60;
}

export default function TimePicker({ value, onChange }: Props) {
  const [hStr, mStr] = value.split(":");
  const hour = parseInt(hStr, 10);
  const minute = roundToTen(parseInt(mStr, 10));

  function handleHour(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange(`${String(parseInt(e.target.value, 10)).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }

  function handleMinute(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange(`${String(hour).padStart(2, "0")}:${e.target.value}`);
  }

  const selectClass =
    "flex-1 px-2 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)] text-center appearance-none cursor-pointer";

  return (
    <div className="flex gap-1.5 items-center">
      <select value={hour} onChange={handleHour} className={selectClass}>
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className="text-[var(--text-muted)] font-bold text-sm">:</span>
      <select value={String(minute).padStart(2, "0")} onChange={handleMinute} className={selectClass}>
        {MINUTES.map((m) => (
          <option key={m} value={String(m).padStart(2, "0")}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
}
