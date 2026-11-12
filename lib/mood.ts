// 情緒溫度計的選項與紀錄格式。放在 lib 而非 client component，伺服器端頁面才能讀取說明文字。
// 紀錄只存在使用者自己的瀏覽器（localStorage），不會上傳。

export type Level = 1 | 2 | 3 | 4 | 5;

export const levels: { value: Level; label: string; hint: string; color: string }[] = [
  { value: 1, label: "很低落", hint: "沉重、提不起勁", color: "#5b7db1" },
  { value: 2, label: "有點低", hint: "累、悶、不太順", color: "#7fb3c8" },
  { value: 3, label: "平穩", hint: "普通、還可以", color: "#3aafa9" },
  { value: 4, label: "不錯", hint: "輕鬆、有餘裕", color: "#e9b949" },
  { value: 5, label: "很好", hint: "愉快、充滿能量", color: "#e07a5f" },
];

/** 情緒詞彙：替感受命名是自我覺察的第一步。 */
export const emotions = {
  正向: ["開心", "平靜", "感恩", "有成就感", "期待", "被支持"],
  負向: ["疲憊", "焦慮", "煩躁", "委屈", "失落", "無力"],
} as const;
const allEmotions: readonly string[] = [...emotions.正向, ...emotions.負向];

export const MAX_TAGS = 3;
export const MAX_NOTE = 300;
/** 最多保留約兩年的紀錄，避免無限制成長。 */
const MAX_ENTRIES = 730;

export const prompts = [
  "今天什麼事影響了你的心情？",
  "此刻身體哪裡感覺緊繃或放鬆？",
  "今天有哪個片刻讓你覺得值得？",
  "如果能對今天的自己說一句話，你會說什麼？",
];

export type Entry = { date: string; level: Level; tags: string[]; note: string };

const KEY = "sel-mood-v1";
const EVENT = "sel-mood-change";
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 本地時區的日期（YYYY-MM-DD），不能用 toISOString，那是 UTC，台灣早上 8 點前會算成前一天。 */
export function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 往前或往後推幾天的日期字串。 */
export function shiftDate(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

// 讀進來的資料可能被手動改過或來自舊版，逐筆檢查格式，不合格的直接略過（不信任外部資料）。
export function sanitize(raw: unknown): Entry[] {
  const list = (raw as { entries?: unknown })?.entries;
  if (!Array.isArray(list)) return [];
  const byDate = new Map<string, Entry>();
  for (const e of list) {
    if (!e || typeof e !== "object") continue;
    const { date, level, tags, note } = e as Record<string, unknown>;
    if (typeof date !== "string" || !DATE.test(date)) continue;
    if (typeof level !== "number" || !Number.isInteger(level) || level < 1 || level > 5) continue;
    byDate.set(date, {
      date,
      level: level as Level,
      tags: Array.isArray(tags) ? tags.filter((t): t is string => typeof t === "string" && allEmotions.includes(t)).slice(0, MAX_TAGS) : [],
      note: typeof note === "string" ? note.slice(0, MAX_NOTE) : "",
    });
  }
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_ENTRIES);
}

export function parseEntries(raw: string | null): Entry[] {
  if (!raw) return [];
  try {
    return sanitize(JSON.parse(raw));
  } catch {
    return [];
  }
}

// ---- 給 useSyncExternalStore 用的儲存介面 ----

/** 讀取原始字串；瀏覽器封鎖儲存空間時回傳 null。 */
export function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return null;
  }
}

export function subscribe(onChange: () => void) {
  // storage 事件：同一個瀏覽器的其他分頁改了紀錄；自訂事件：這個分頁自己改了紀錄。
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/** 寫入原始字串（null 代表刪除），失敗（空間已滿、被封鎖）時回傳 false。 */
export function writeRaw(value: string | null): boolean {
  try {
    if (value === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

/** 以未加密的格式寫入紀錄。 */
export function writeEntries(entries: Entry[]): boolean {
  return writeRaw(entries.length ? JSON.stringify({ version: 1, entries: sanitize({ entries }) }) : null);
}

// ---- 匯出 ----

// 以 = + - @ 開頭的儲存格會被 Excel 當成公式執行（CSV 注入），前面加上單引號讓它變成純文字。
const cell = (s: string) => {
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function toCsv(entries: Entry[]) {
  const rows = [["日期", "心情溫度", "心情", "情緒詞", "想說的話"]].concat(
    entries.map((e) => [e.date, String(e.level), levels[e.level - 1].label, e.tags.join("、"), e.note]),
  );
  // 開頭的 BOM 讓 Excel 正確辨識 UTF-8 中文。
  return "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
}
