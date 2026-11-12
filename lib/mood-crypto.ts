// 情緒溫度計的密碼鎖：用密碼加密紀錄後才存進 localStorage，共用電腦的其他人只看得到亂碼。
//
// - 金鑰：PBKDF2-SHA256 由密碼與隨機 salt 產生，迭代 600,000 次（OWASP 密碼儲存建議值），拖慢逐一猜密碼的速度。
// - 加密：AES-GCM 256，每次寫入都用新的隨機 IV（同一把金鑰重複使用 IV 會破解 GCM），並附帶驗證，內容被竄改會解密失敗。
// - 金鑰設為不可匯出、只留在記憶體，關閉分頁就消失；儲存空間裡只有 salt、IV 與密文。
// - 忘記密碼無法復原，這是刻意的：任何「找回」機制都等於留了後門。

import { sanitize, type Entry } from "./mood";

const ITERATIONS = 600_000;
// 從儲存空間讀進來的參數可能被竄改：次數太低等於沒保護，太高會讓頁面卡住。
const MIN_ITERATIONS = 100_000;
const MAX_ITERATIONS = 5_000_000;
/** 附加驗證資料：把密文綁定在這個用途上。 */
const AAD = new TextEncoder().encode("sel-mood-v1");
export const MIN_PASSWORD = 6;

export type Locked = { version: 1; locked: true; iterations: number; salt: string; iv: string; data: string };
export type Session = { key: CryptoKey; salt: string; iterations: number; raw: string; entries: Entry[] };

export const cryptoAvailable = () => typeof crypto !== "undefined" && !!crypto.subtle;

// 用迴圈分段轉換，避免紀錄很多時 String.fromCharCode(...大陣列) 超過參數上限。
function toBase64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromBase64(b64: string) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** 看起來是加密格式（不論參數是否合理）；用來避免把損壞的加密資料當成「沒有紀錄」而覆蓋掉。 */
export function looksLocked(raw: string) {
  try {
    return JSON.parse(raw)?.locked === true;
  } catch {
    return false;
  }
}

/** 判斷儲存的內容是不是上鎖的格式，並檢查參數是否合理。 */
export function asLocked(raw: string): Locked | null {
  try {
    const v = JSON.parse(raw);
    const b64 = /^[A-Za-z0-9+/]+={0,2}$/;
    if (
      v?.locked === true &&
      Number.isInteger(v.iterations) &&
      v.iterations >= MIN_ITERATIONS &&
      v.iterations <= MAX_ITERATIONS &&
      [v.salt, v.iv, v.data].every((s) => typeof s === "string" && b64.test(s))
    ) {
      return v as Locked;
    }
  } catch {}
  return null;
}

export async function deriveKey(password: string, salt: string, iterations: number) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: fromBase64(salt), iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** 用新的密碼建立 session（設定或變更密碼時）。 */
export async function newSession(password: string, entries: Entry[]): Promise<Session> {
  const salt = toBase64(crypto.getRandomValues(new Uint8Array(16)));
  const key = await deriveKey(password, salt, ITERATIONS);
  return encrypt({ key, salt, iterations: ITERATIONS, raw: "", entries }, entries);
}

/** 加密紀錄，回傳更新後的 session（raw 是要寫入儲存空間的字串）。 */
export async function encrypt(session: Session, entries: Entry[]): Promise<Session> {
  const clean = sanitize({ entries });
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: AAD },
    session.key,
    new TextEncoder().encode(JSON.stringify({ entries: clean })),
  );
  const locked: Locked = { version: 1, locked: true, iterations: session.iterations, salt: session.salt, iv: toBase64(iv), data: toBase64(new Uint8Array(data)) };
  return { ...session, raw: JSON.stringify(locked), entries: clean };
}

/** 解密；密碼錯誤或資料被竄改時會丟出錯誤。 */
export async function decrypt(key: CryptoKey, locked: Locked): Promise<Entry[]> {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(locked.iv), additionalData: AAD }, key, fromBase64(locked.data));
  return sanitize(JSON.parse(new TextDecoder().decode(plain)));
}

/** 用密碼解鎖，成功回傳 session，密碼錯誤回傳 null。 */
export async function unlock(password: string, raw: string): Promise<Session | null> {
  const locked = asLocked(raw);
  if (!locked) return null;
  const key = await deriveKey(password, locked.salt, locked.iterations);
  try {
    return { key, salt: locked.salt, iterations: locked.iterations, raw, entries: await decrypt(key, locked) };
  } catch {
    return null;
  }
}
