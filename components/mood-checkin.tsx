"use client";

import { ArrowRight, CheckCircle, DownloadSimple, LockSimple, PencilSimple, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  MAX_NOTE,
  MAX_TAGS,
  emotions,
  levels,
  localDate,
  parseEntries,
  prompts,
  readRaw,
  shiftDate,
  subscribe,
  toCsv,
  writeEntries,
  type Entry,
  type Level,
} from "@/lib/mood";

// 紀錄只存在這個瀏覽器的 localStorage，不上傳；React 會自動跳脫文字，使用者寫的內容不會被當成 HTML 執行。

const btnBase =
  "inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-[0.8rem] font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
const btnPrimary = `${btnBase} bg-primary text-white shadow-[0_4px_15px_rgba(43,122,120,0.3)] hover:bg-primary-dark disabled:hover:bg-primary`;
const btnOutline = `${btnBase} border-2 border-primary text-primary hover:bg-primary/10`;
const btnSmall = "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[0.9rem] font-semibold transition-colors duration-200";

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const parts = (date: string) => date.split("-").map(Number);
const longDate = (date: string) => {
  const [y, m, d] = parts(date);
  return `${m} 月 ${d} 日（${weekdays[new Date(y, m - 1, d).getDay()]}）`;
};
const shortDate = (date: string) => {
  const [, m, d] = parts(date);
  return `${m}/${d}`;
};

// 日期每天午夜會變，回到分頁時也重新檢查（手機休眠一整晚後打開的情況）。
function subscribeDay(onChange: () => void) {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
  const timer = setTimeout(onChange, midnight + 1000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}
const getToday = () => localDate();

export function MoodCheckin() {
  // 伺服器端（靜態輸出）沒有 localStorage，回傳 undefined 代表「尚未讀取」，避免 hydration 不一致。
  const raw = useSyncExternalStore(subscribe, readRaw, () => undefined);
  const today = useSyncExternalStore(subscribeDay, getToday, () => null);
  const entries = useMemo(() => parseEntries(raw ?? null), [raw]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  if (raw === undefined || today === null) {
    return <div className="min-h-[480px]" aria-busy="true" />;
  }
  if (raw === null) {
    return (
      <p className="rounded-2xl border border-secondary/30 p-4 text-ink/80">
        這個瀏覽器目前無法儲存資料（可能是無痕模式或封鎖了網站資料），所以沒辦法記錄心情。請改用一般視窗，或允許本網站儲存資料。
      </p>
    );
  }

  const todayEntry = entries.find((e) => e.date === today);
  const save = (next: Entry[]) => {
    const ok = writeEntries(next);
    setError(ok ? "" : "儲存失敗：瀏覽器的儲存空間可能已滿或被封鎖。");
    return ok;
  };

  return (
    <div>
      <p className="mb-6 flex items-center gap-1.5 text-[0.9rem] text-muted">
        <LockSimple className="shrink-0" /> 紀錄只存在這台裝置的瀏覽器，不會上傳，別人看不到。
      </p>

      {todayEntry && !editing ? (
        <TodaySummary entry={todayEntry} onEdit={() => setEditing(true)} />
      ) : (
        <TodayForm
          key={today}
          today={today}
          initial={todayEntry}
          onCancel={todayEntry ? () => setEditing(false) : undefined}
          onSave={(entry) => {
            if (save([entry, ...entries.filter((e) => e.date !== entry.date)])) setEditing(false);
          }}
        />
      )}
      {error && (
        <p role="alert" className="mt-4 text-[0.9rem] font-semibold text-[#b4473a]">
          {error}
        </p>
      )}

      {entries.length > 0 && <History entries={entries} today={today} onSave={save} />}
    </div>
  );
}

// ---------- 今天的打卡 ----------

type FormProps = { today: string; initial?: Entry; onSave: (e: Entry) => void; onCancel?: () => void };

function TodayForm({ today, initial, onSave, onCancel }: FormProps) {
  const [level, setLevel] = useState<Level | null>(initial?.level ?? null);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [note, setNote] = useState(initial?.note ?? "");
  // 每天換一個引導問題（依日期決定，不用亂數，畫面才穩定）。
  const prompt = prompts[parts(today).reduce((a, b) => a + b, 0) % prompts.length];

  const toggle = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : prev.length < MAX_TAGS ? [...prev, t] : prev));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (level) onSave({ date: today, level, tags, note: note.trim() });
      }}
    >
      <h2 className="mb-1 text-[1.5rem] font-bold text-primary md:text-[1.8rem]">今天的心情溫度</h2>
      <p className="mb-6 text-muted">{longDate(today)}</p>

      <fieldset className="mb-8">
        <legend className="mb-3 font-semibold">1. 選一個最接近現在心情的溫度</legend>
        <div className="flex gap-4">
          <Thermometer level={level} />
          <div className="flex flex-1 flex-col-reverse gap-2">
            {levels.map((l) => {
              const checked = level === l.value;
              return (
                <label
                  key={l.value}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-2 transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
                    checked ? "border-primary bg-primary/8" : "border-primary/15 hover:bg-primary/5"
                  }`}
                >
                  <input type="radio" name="level" value={l.value} checked={checked} onChange={() => setLevel(l.value)} className="sr-only" />
                  <span aria-hidden className="size-4 shrink-0 rounded-full" style={{ background: l.color }} />
                  {/* 手機上說明放在名稱下方，避免說明被擠成很窄的一欄。 */}
                  <span className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-3">
                    <span className="font-semibold whitespace-nowrap">{l.label}</span>
                    <span className="text-[0.85rem] leading-snug text-muted">{l.hint}</span>
                  </span>
                  {checked && <CheckCircle weight="fill" className="ml-auto shrink-0 text-xl text-primary" />}
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-8">
        <legend className="mb-1 font-semibold">2. 替感受取個名字（選填，最多 {MAX_TAGS} 個）</legend>
        <p className="mb-3 text-[0.85rem] text-muted">說得出感受，就比較能照顧它。</p>
        {Object.entries(emotions).map(([group, words]) => (
          <div key={group} className="mb-2 flex flex-wrap gap-2">
            {words.map((t) => {
              const on = tags.includes(t);
              const full = !on && tags.length >= MAX_TAGS;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  disabled={full}
                  onClick={() => toggle(t)}
                  className={`${btnSmall} border-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                    on ? "border-primary bg-primary text-white" : "border-primary/25 text-primary hover:bg-primary/10"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        ))}
      </fieldset>

      <label className="mb-8 block">
        <span className="mb-1 block font-semibold">3. 寫幾句話給自己（選填）</span>
        <span className="mb-3 block text-[0.85rem] text-muted">{prompt}</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={MAX_NOTE}
          rows={4}
          className="w-full rounded-2xl border-2 border-primary/20 bg-white/70 p-4 text-base leading-relaxed outline-none transition-colors focus:border-primary"
        />
        <span className="mt-1 block text-right text-[0.8rem] text-muted tabular-nums">
          {note.length} / {MAX_NOTE}
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className={btnOutline}>
            取消
          </button>
        )}
        <button type="submit" disabled={!level} className={btnPrimary}>
          <CheckCircle /> {initial ? "更新今天的紀錄" : "完成打卡"}
        </button>
      </div>
      {!level && <p className="mt-3 text-right text-[0.85rem] text-muted">選好心情溫度後，就能完成打卡。</p>}
    </form>
  );
}

function Thermometer({ level }: { level: Level | null }) {
  const color = level ? levels[level - 1].color : "transparent";
  const fill = level ? level / 5 : 0;
  return (
    <svg viewBox="0 0 40 200" aria-hidden className="w-10 shrink-0 self-stretch" preserveAspectRatio="xMidYMax meet">
      <rect x={12} y={6} width={16} height={160} rx={8} fill="var(--color-secondary)" fillOpacity={0.12} />
      <rect
        x={12}
        y={6 + 160 * (1 - fill)}
        width={16}
        height={160 * fill}
        rx={8}
        fill={color}
        className="transition-all duration-500 motion-reduce:transition-none"
      />
      <circle cx={20} cy={178} r={16} fill={level ? color : "var(--color-secondary)"} fillOpacity={level ? 1 : 0.2} className="transition-colors duration-500" />
    </svg>
  );
}

function TodaySummary({ entry, onEdit }: { entry: Entry; onEdit: () => void }) {
  const l = levels[entry.level - 1];
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 font-semibold text-primary">
        <CheckCircle weight="fill" className="text-xl" /> 今天已經打卡了
      </p>
      <h2 className="mb-6 text-[1.5rem] font-bold md:text-[1.8rem]">{longDate(entry.date)}</h2>
      <div className="mb-6 rounded-2xl border border-primary/15 bg-white/60 p-5">
        <EntryBody entry={entry} />
      </div>

      {entry.level <= 2 && (
        <div className="mb-6 rounded-2xl bg-secondary/10 p-4 text-ink/80">
          <p className="mb-2 font-bold text-primary">辛苦了，謝謝你願意停下來看看自己。</p>
          <p className="mb-2">
            心情低落是正常的訊號。可以先做幾分鐘呼吸放鬆，或找一位信任的同事聊聊。如果低落持續兩週以上，或影響到睡眠與生活，建議尋求專業協助，例如學校輔導室，或撥打衛福部安心專線
            <strong> 1925</strong>（24 小時免付費）。
          </p>
          <Link href="/breathing#timer" prefetch={false} className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">
            試試呼吸放鬆計時器 <ArrowRight />
          </Link>
        </div>
      )}

      <button type="button" onClick={onEdit} className={btnOutline}>
        <PencilSimple /> 修改今天的紀錄
      </button>
      <span className="sr-only">今天的心情：{l.label}</span>
    </div>
  );
}

function EntryBody({ entry }: { entry: Entry }) {
  const l = levels[entry.level - 1];
  return (
    <>
      <p className="flex flex-wrap items-center gap-2">
        <span aria-hidden className="size-3.5 rounded-full" style={{ background: l.color }} />
        <span className="font-bold">{l.label}</span>
        {entry.tags.map((t) => (
          <span key={t} className="rounded-full bg-primary/8 px-2.5 py-0.5 text-[0.85rem] font-medium text-primary">
            {t}
          </span>
        ))}
      </p>
      {entry.note && <p className="mt-2 break-words whitespace-pre-wrap text-ink/80">{entry.note}</p>}
    </>
  );
}

// ---------- 歷史紀錄 ----------

function History({ entries, today, onSave }: { entries: Entry[]; today: string; onSave: (e: Entry[]) => boolean }) {
  const [shown, setShown] = useState(7);
  const [confirming, setConfirming] = useState<string | null>(null);
  const byDate = new Map(entries.map((e) => [e.date, e]));

  const days = Array.from({ length: 14 }, (_, i) => shiftDate(today, i - 13));
  const recent = entries.filter((e) => e.date > shiftDate(today, -30));
  const avg = recent.length ? recent.reduce((s, e) => s + e.level, 0) / recent.length : 0;
  const counts = new Map<string, number>();
  recent.forEach((e) => e.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const topTags = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3);
  let streak = 0;
  for (let d = byDate.has(today) ? today : shiftDate(today, -1); byDate.has(d); d = shiftDate(d, -1)) streak++;

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(entries)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `情緒溫度計-${today}.csv`;
    // 先加進頁面再點擊、稍後才釋放網址，Firefox 與 Safari 才會確實開始下載。
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section aria-labelledby="mood-history" className="mt-12 border-t border-primary/10 pt-10">
      <h2 id="mood-history" className="mb-6 text-[1.3rem] font-bold text-primary">
        我的紀錄
      </h2>

      <dl className="mb-8 grid grid-cols-3 gap-3 text-center">
        {[
          ["連續打卡", `${streak} 天`],
          ["近 30 天平均", recent.length ? avg.toFixed(1) : "–"],
          ["近 30 天紀錄", `${recent.length} 天`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-secondary/10 px-2 py-3">
            <dt className="text-[0.8rem] text-muted">{k}</dt>
            <dd className="text-[1.3rem] font-bold text-primary tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mb-3 font-semibold">最近 14 天</h3>
      <ol className="mb-3 flex h-36 items-end gap-1" aria-label="最近 14 天的心情溫度">
        {days.map((d) => {
          const e = byDate.get(d);
          const l = e && levels[e.level - 1];
          return (
            <li key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="sr-only">
                {shortDate(d)}：{l ? l.label : "沒有紀錄"}
              </span>
              {l ? (
                <span aria-hidden className="w-full max-w-6 rounded-t-md" style={{ height: `${(e.level / 5) * 100}%`, background: l.color }} title={`${shortDate(d)} ${l.label}`} />
              ) : (
                <span aria-hidden className="mb-1 size-1.5 rounded-full bg-primary/20" />
              )}
              <span aria-hidden className={`text-[0.7rem] tabular-nums ${d === today ? "font-bold text-primary" : "text-muted"}`}>
                {parts(d)[2]}
              </span>
            </li>
          );
        })}
      </ol>
      <p aria-hidden className="mb-8 flex flex-wrap gap-x-3 gap-y-1 text-[0.8rem] text-muted">
        {levels.map((l) => (
          <span key={l.value} className="inline-flex items-center gap-1">
            <span className="size-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </p>

      {topTags.length > 0 && (
        <p className="mb-8 text-ink/80">
          近 30 天最常出現的情緒：<strong className="text-primary">{topTags.map(([t, n]) => `${t}（${n} 次）`).join("、")}</strong>
        </p>
      )}

      <ul className="mb-6 space-y-3">
        {entries.slice(0, shown).map((e) => (
          <li key={e.date} className="rounded-2xl border border-primary/10 bg-white/50 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-semibold text-muted">{longDate(e.date)}</span>
              {confirming === e.date ? (
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSave(entries.filter((x) => x.date !== e.date)) && setConfirming(null)}
                    className={`${btnSmall} bg-[#b4473a] text-white hover:bg-[#9a3b30]`}
                  >
                    確定刪除
                  </button>
                  <button type="button" onClick={() => setConfirming(null)} className={`${btnSmall} text-muted hover:bg-primary/5`}>
                    取消
                  </button>
                </span>
              ) : (
                <button type="button" aria-label={`刪除 ${shortDate(e.date)} 的紀錄`} onClick={() => setConfirming(e.date)} className={`${btnSmall} px-3 text-muted hover:bg-primary/5`}>
                  <Trash />
                </button>
              )}
            </div>
            <EntryBody entry={e} />
          </li>
        ))}
      </ul>
      {entries.length > shown && (
        <button type="button" onClick={() => setShown(shown + 14)} className={`${btnOutline} mb-8`}>
          顯示更多（還有 {entries.length - shown} 筆）
        </button>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-primary/10 pt-6">
        <button type="button" onClick={download} className={`${btnSmall} border-2 border-primary/25 text-primary hover:bg-primary/10`}>
          <DownloadSimple /> 下載紀錄（CSV）
        </button>
        {confirming === "all" ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[0.9rem] font-semibold text-[#b4473a]">全部 {entries.length} 筆紀錄都會刪除，無法復原。</span>
            <button type="button" onClick={() => onSave([]) && setConfirming(null)} className={`${btnSmall} bg-[#b4473a] text-white hover:bg-[#9a3b30]`}>
              確定清除
            </button>
            <button type="button" onClick={() => setConfirming(null)} className={`${btnSmall} text-muted hover:bg-primary/5`}>
              取消
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirming("all")} className={`${btnSmall} text-muted hover:bg-primary/5`}>
            <Trash /> 清除全部紀錄
          </button>
        )}
      </div>
    </section>
  );
}
