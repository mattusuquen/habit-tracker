"use client";

import { useMemo, useState } from "react";

// ---- Config ---------------------------------------------------------------

// The habits you're tracking. Each contributes an equal share to how much of a
// day's tile gets revealed. Colors are used for the checkboxes and stat dots.
const HABITS = [
  { id: "workout", label: "Workout", color: "#2f9e44" },
  { id: "read", label: "Read", color: "#1c7ed6" },
  { id: "meditate", label: "Meditate", color: "#9c36b5" },
  { id: "nosocial", label: "No Social Media", color: "#f08c00" },
] as const;

type HabitId = (typeof HABITS)[number]["id"];

// The month we're painting. Change these to move around.
const YEAR = 2025;
const MONTH = 3; // 0-indexed: 3 = April

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// The "painting" hidden under the tiles. Right now it's just a green gradient
// (GitHub-contributions green), but this is the ONE place the art lives — swap
// it for `url(/paintings/april.jpg)` later and everything else keeps working.
const PAINTING =
  "linear-gradient(135deg, #0e4429 0%, #006d32 35%, #26a641 70%, #39d353 100%)";

// The color that "covers" an unearned tile (the blank square).
const COVER_COLOR = "#e8e5dd";

// ---- Helpers --------------------------------------------------------------

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Build the calendar grid: leading blanks + each day of the month + trailing. */
function buildCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const total = daysInMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// A single slice of the shared painting, revealed by `reveal` (0..1).
function PaintTile({
  col,
  row,
  cols,
  rows,
  reveal,
}: {
  col: number;
  row: number;
  cols: number;
  rows: number;
  reveal: number;
}) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: PAINTING,
          backgroundSize: `${cols * 100}% ${rows * 100}%`,
          backgroundPosition: `${(col / (cols - 1)) * 100}% ${(row / (rows - 1)) * 100}%`,
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ backgroundColor: COVER_COLOR, opacity: 1 - reveal }}
      />
    </>
  );
}

// ---- Sidebar --------------------------------------------------------------

const NAV = [
  { id: "home", label: "Home", icon: IconHome },
  { id: "habits", label: "Habits", icon: IconTarget },
  { id: "calendar", label: "Calendar", icon: IconCalendar },
  { id: "gallery", label: "Art Gallery", icon: IconImage },
  { id: "settings", label: "Settings", icon: IconGear },
];

function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[#e6e1d7] bg-white p-5">
      <div className="mb-8 flex items-center gap-2 px-2">
        <IconLeaf className="h-6 w-6 text-[#39d353]" />
        <span className="text-lg font-semibold text-[#2b2723]">HabitCanvas</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item, i) => {
          const Icon = item.icon;
          const active = i === 0;
          return (
            <a
              key={item.id}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-[#e9f1e4] font-medium text-[#2b2723]"
                  : "text-[#8c867b] hover:bg-[#f0ede6]/60 hover:text-[#2b2723]"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="mt-auto px-2">
        <IconLeaf className="mb-2 h-5 w-5 text-[#39d353]" />
        <p className="text-xs italic leading-relaxed text-[#8c867b]">
          &ldquo;Small steps,
          <br />
          beautiful results.&rdquo;
        </p>
      </div>
    </aside>
  );
}

// ---- Year panel -----------------------------------------------------------

function YearInArt() {
  return (
    <div className="rounded-xl border border-[#e6e1d7] bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        <IconLeaf className="h-5 w-5 text-[#39d353]" />
        <h3 className="font-semibold text-[#2b2723]">Your Year in Art</h3>
      </div>
      <p className="mb-4 text-xs text-[#8c867b]">
        12 months. 12 paintings. One better you.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {MONTH_SHORT.map((m, i) => {
          const locked = i > MONTH;
          const current = i === MONTH;
          return (
            <div key={m} className="flex flex-col items-center gap-1.5">
              <div
                className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg ${
                  current ? "ring-2 ring-[#39d353]" : ""
                }`}
              >
                {locked ? (
                  <div className="flex h-full w-full items-center justify-center bg-[#f0ede6]">
                    <IconLock className="h-4 w-4 text-[#bdb7ab]" />
                  </div>
                ) : (
                  <div className="absolute inset-0" style={{ backgroundImage: PAINTING }} />
                )}
              </div>
              <span className="text-[11px] text-[#8c867b]">{MONTH_NAMES[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YearProgress() {
  const monthsDone = MONTH + 1;
  const pct = Math.round((monthsDone / 12) * 100);
  return (
    <div className="rounded-xl border border-[#e6e1d7] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconLeaf className="h-5 w-5 text-[#39d353]" />
          <h3 className="font-semibold text-[#2b2723]">Year Progress</h3>
        </div>
        <span className="text-xs text-[#8c867b]">{monthsDone} / 12 months</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0ede6]">
        <div className="h-full rounded-full bg-[#39d353]" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-[#8c867b]">
        You&rsquo;re {pct}% through the year. Keep going!
      </p>
    </div>
  );
}

// ---- Page -----------------------------------------------------------------

export default function Home() {
  const cells = useMemo(() => buildCells(YEAR, MONTH), []);
  const cols = 7;
  const rows = cells.length / cols;
  const totalDays = daysInMonth(YEAR, MONTH);

  // completed[day] = Set of habit ids done that day.
  const [completed, setCompleted] = useState<Record<number, Set<HabitId>>>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const toggleHabit = (day: number, habit: HabitId) => {
    setCompleted((prev) => {
      const next = { ...prev };
      const set = new Set(next[day] ?? []);
      if (set.has(habit)) set.delete(habit);
      else set.add(habit);
      next[day] = set;
      return next;
    });
  };

  const revealFor = (day: number) => (completed[day]?.size ?? 0) / HABITS.length;
  const painted = Object.values(completed).filter((s) => s.size > 0).length;

  // Per-habit monthly totals for the list under the graph.
  const habitTotals = useMemo(() => {
    const totals: Record<HabitId, number> = {
      workout: 0, read: 0, meditate: 0, nosocial: 0,
    };
    for (const set of Object.values(completed))
      for (const id of set) totals[id]++;
    return totals;
  }, [completed]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-1 bg-[#f5f2ec] font-sans text-[#2b2723]">
      <Sidebar />

      <main className="flex-1 overflow-x-auto p-8">
        {/* Greeting */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{greeting()}, Matthew</h1>
            <p className="mt-1 text-[#8c867b]">Your habits are painting a better you.</p>
          </div>
          <span className="text-sm text-[#8c867b]">{today}</span>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          {/* Center: the painting card */}
          <div className="flex-1 rounded-xl border border-[#e6e1d7] bg-white p-6">
            <div className="mb-1 flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold">
                {MONTH_NAMES[MONTH]} {YEAR}
              </h2>
              <span className="flex items-center gap-2 rounded-full bg-[#f0ede6] px-3 py-1 text-xs text-[#8c867b]">
                <span className="h-2 w-2 rounded-full bg-[#39d353]" />
                {painted} / {totalDays} days
              </span>
            </div>
            <p className="mb-5 text-sm text-[#8c867b]">
              Keep showing up. The picture is coming together.
            </p>

            {/* Weekday labels */}
            <div
              className="mb-2 grid gap-2 text-center text-xs text-[#8c867b]"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {WEEKDAYS.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>

            {/* The painting grid */}
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {cells.map((day, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);

                // Blank padding cells render as prefilled (fully revealed) tiles.
                if (day === null) {
                  return (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-md opacity-60">
                      <PaintTile col={col} row={row} cols={cols} rows={rows} reveal={1} />
                    </div>
                  );
                }

                const reveal = revealFor(day);
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    title={`Day ${day} — ${completed[day]?.size ?? 0}/${HABITS.length} habits`}
                    className={`relative aspect-square overflow-hidden rounded-md transition-transform hover:scale-105 ${
                      isSelected ? "ring-2 ring-[#39d353] ring-offset-2 ring-offset-white" : ""
                    }`}
                  >
                    <PaintTile col={col} row={row} cols={cols} rows={rows} reveal={reveal} />
                    <span
                      className="absolute left-1 top-0.5 text-[10px] font-medium"
                      style={{ color: reveal > 0.5 ? "#0d1117" : "#8c867b" }}
                    >
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Day editor (appears when a day is selected) */}
            {selectedDay !== null && (
              <div className="mt-5 rounded-lg border border-[#e6e1d7] bg-[#f0ede6] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {MONTH_NAMES[MONTH]} {selectedDay}
                  </h3>
                  <span className="text-xs text-[#8c867b]">
                    {Math.round(revealFor(selectedDay) * 100)}% revealed
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {HABITS.map((h) => {
                    const done = completed[selectedDay]?.has(h.id) ?? false;
                    return (
                      <button
                        key={h.id}
                        onClick={() => toggleHabit(selectedDay, h.id)}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          done ? "text-[#2b2723]" : "border-[#e6e1d7] text-[#8c867b] hover:border-[#bdb7ab]"
                        }`}
                        style={done ? { backgroundColor: `${h.color}22`, borderColor: h.color } : undefined}
                      >
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-sm border"
                          style={{ backgroundColor: done ? h.color : "transparent", borderColor: h.color }}
                        >
                          {done && (
                            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                              <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="#0d1117" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Habits list under the graph */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#e6e1d7] pt-5 sm:grid-cols-4">
              {HABITS.map((h) => (
                <div key={h.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-[#2b2723]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                    {h.label}
                  </div>
                  <span className="pl-4 text-sm text-[#8c867b]">
                    {habitTotals[h.id]}/{totalDays}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex w-full flex-col gap-6 xl:w-80">
            <YearInArt />
            <YearProgress />
          </div>
        </div>
      </main>
    </div>
  );
}

// ---- Icons ----------------------------------------------------------------

type IconProps = { className?: string };

function IconHome({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}
function IconTarget({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}
function IconCalendar({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </svg>
  );
}
function IconImage({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M4 17l5-5 4 4 3-3 4 4" />
    </svg>
  );
}
function IconGear({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}
function IconLeaf({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 21c0-6 3-11 9-13 4-1.3 7-1 7-1s.3 3-1 7c-2 6-7 9-13 9a8 8 0 01-2-.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21c3-5 7-8 11-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLock({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}
