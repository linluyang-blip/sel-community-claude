"use client";

import { ArrowCounterClockwise, Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { patterns, type Kind } from "@/lib/breathing";

const labels: Record<Kind, string> = { in: "吸氣", "hold-in": "停住", out: "吐氣", "hold-out": "停住" };
const tones: Record<Kind, number> = { in: 528, "hold-in": 440, out: 396, "hold-out": 440 };

const durations = [1, 3, 5];
const PREP_MS = 3000;
/** 圓圈最小時的縮放比例（最大為 1）。 */
const MIN_SCALE = 0.55;

type Status = "idle" | "running" | "paused" | "done";
type Display = { phase: number; secondsLeft: number; cycle: number; remaining: number };

const ease = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p);
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const option = (active: boolean) =>
  `cursor-pointer rounded-full border-2 px-4 py-2 text-[0.95rem] font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
    active ? "border-primary bg-primary text-white" : "border-primary/30 text-primary hover:bg-primary/10"
  }`;

export function BreathingTimer() {
  const [patternId, setPatternId] = useState(patterns[0].id);
  const [minutes, setMinutes] = useState(3);
  const [status, setStatus] = useState<Status>("idle");
  const [sound, setSound] = useState(true);
  const [display, setDisplay] = useState<Display>({ phase: -1, secondsLeft: 3, cycle: 0, remaining: 0 });

  const pattern = patterns.find((p) => p.id === patternId)!;
  const cycleMs = pattern.phases.reduce((sum, p) => sum + p.seconds, 0) * 1000;
  const totalCycles = Math.max(1, Math.round((minutes * 60_000) / cycleMs));

  const circle = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const elapsedBefore = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const soundOn = useRef(sound);

  useEffect(() => {
    soundOn.current = sound;
  }, [sound]);

  const beep = (frequency: number) => {
    const ctx = audio.current;
    if (!ctx || !soundOn.current) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.85);
  };

  // 計時：以 requestAnimationFrame 依實際經過時間推算，動畫直接寫入 DOM，文字每秒才更新一次。
  useEffect(() => {
    if (status !== "running") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = 0;
    // 上一個畫面所在的階段；階段改變時發出提示音（剛開始或暫停後繼續的第一個畫面不發聲）。
    let lastPhase = "";
    let lastText = "";

    const tick = () => {
      const elapsed = elapsedBefore.current + performance.now() - start;
      let scale = MIN_SCALE;
      let progress = 0;
      let next: Display;

      if (elapsed < PREP_MS) {
        next = { phase: -1, secondsLeft: Math.ceil((PREP_MS - elapsed) / 1000), cycle: 0, remaining: Math.round((totalCycles * cycleMs) / 1000) };
        progress = elapsed / PREP_MS;
      } else {
        const t = elapsed - PREP_MS;
        const cycle = Math.floor(t / cycleMs);
        if (cycle >= totalCycles) {
          setStatus("done");
          return;
        }
        let within = t - cycle * cycleMs;
        let phase = 0;
        while (within >= pattern.phases[phase].seconds * 1000) within -= pattern.phases[phase++].seconds * 1000;
        const { kind, seconds } = pattern.phases[phase];
        progress = within / (seconds * 1000);
        scale =
          kind === "in" ? MIN_SCALE + (1 - MIN_SCALE) * ease(progress)
          : kind === "out" ? 1 - (1 - MIN_SCALE) * ease(progress)
          : kind === "hold-in" ? 1
          : MIN_SCALE;
        next = {
          phase,
          secondsLeft: Math.ceil(seconds - within / 1000),
          cycle: cycle + 1,
          remaining: Math.ceil((totalCycles * cycleMs - t) / 1000),
        };
        const phaseKey = `${cycle}-${phase}`;
        if (lastPhase && phaseKey !== lastPhase) beep(tones[kind]);
        lastPhase = phaseKey;
      }
      if (next.phase === -1) lastPhase = "prep";

      if (circle.current) circle.current.style.scale = String(reduced ? 0.85 : scale);
      if (bar.current) bar.current.style.width = `${(progress * 100).toFixed(1)}%`;

      const text = `${next.cycle}-${next.phase}-${next.secondsLeft}-${next.remaining}`;
      if (text !== lastText) {
        lastText = text;
        setDisplay(next);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      elapsedBefore.current += performance.now() - start;
    };
  }, [status, pattern, cycleMs, totalCycles]);

  // 練習中保持螢幕常亮（瀏覽器支援時）。
  useEffect(() => {
    if (status !== "running" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = () =>
      navigator.wakeLock
        .request("screen")
        .then((l) => {
          if (cancelled) l.release().catch(() => {});
          else lock = l;
        })
        .catch(() => {});
    const onVisible = () => document.visibilityState === "visible" && request();
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, [status]);

  // 回到初始狀態時，把圓圈與進度條復原。
  useEffect(() => {
    if (status !== "idle" && status !== "done") return;
    if (circle.current) circle.current.style.scale = String(status === "done" ? 1 : MIN_SCALE);
    if (bar.current) bar.current.style.width = status === "done" ? "100%" : "0%";
  }, [status]);

  const start = () => {
    // 音效必須在使用者點擊時建立，iOS 才允許播放。
    audio.current ??= new AudioContext();
    audio.current.resume().catch(() => {});
    if (status === "idle" || status === "done") {
      elapsedBefore.current = 0;
      setDisplay({ phase: -1, secondsLeft: 3, cycle: 0, remaining: Math.round((totalCycles * cycleMs) / 1000) });
    }
    setStatus("running");
  };

  const reset = () => setStatus("idle");
  const choose = (fn: () => void) => () => {
    fn();
    setStatus("idle");
  };

  const locked = status === "running" || status === "paused";
  const current = display.phase >= 0 ? pattern.phases[display.phase] : null;

  let headline: string;
  let sub: string;
  if (status === "idle") {
    headline = pattern.name;
    sub = pattern.rhythm;
  } else if (status === "done") {
    headline = "完成";
    sub = `${totalCycles} 輪呼吸`;
  } else if (current) {
    headline = labels[current.kind];
    sub = String(display.secondsLeft);
  } else {
    headline = "準備";
    sub = String(display.secondsLeft);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex flex-wrap justify-center gap-2 md:mb-6" role="group" aria-label="呼吸方式">
        {patterns.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={p.id === patternId}
            disabled={locked}
            onClick={choose(() => setPatternId(p.id))}
            className={option(p.id === patternId)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2 md:mb-8" role="group" aria-label="練習時間">
        {durations.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={m === minutes}
            disabled={locked}
            onClick={choose(() => setMinutes(m))}
            className={option(m === minutes)}
          >
            {m} 分鐘
          </button>
        ))}
      </div>

      <div className="relative mb-5 size-[220px] min-[400px]:size-[260px] md:mb-6 md:size-[320px]">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/40" />
        <div
          ref={circle}
          style={{ scale: MIN_SCALE }}
          className="absolute inset-0 rounded-full bg-linear-135 from-secondary to-primary shadow-[0_20px_50px_rgba(43,122,120,0.35)] will-change-[scale]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <p aria-live="polite" className="text-[1.6rem] font-bold md:text-[2rem]">
            {headline}
          </p>
          <p className={`font-semibold tabular-nums ${status === "idle" || status === "done" ? "text-[0.95rem]" : "text-[2.2rem] leading-tight"}`}>
            {sub}
          </p>
        </div>
      </div>

      <div className="mb-3 h-2 w-full max-w-[320px] overflow-hidden rounded-full bg-secondary/15">
        <div ref={bar} style={{ width: "0%" }} className="h-full rounded-full bg-secondary" />
      </div>
      <p className="mb-5 min-h-[1.6em] text-center text-[0.95rem] text-muted tabular-nums md:mb-8">
        {status === "done"
          ? "做得很好！花一點時間感受現在身體的狀態。"
          : locked && display.cycle > 0
            ? `第 ${display.cycle} / ${totalCycles} 輪・剩餘 ${clock(display.remaining)}`
            : `共 ${totalCycles} 輪，約 ${clock(Math.round((totalCycles * cycleMs) / 1000))}`}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {status === "running" ? (
          <button type="button" onClick={() => setStatus("paused")} className={controlPrimary}>
            <Pause weight="fill" /> 暫停
          </button>
        ) : (
          <button type="button" onClick={start} className={controlPrimary}>
            <Play weight="fill" /> {status === "paused" ? "繼續" : status === "done" ? "再一次" : "開始"}
          </button>
        )}
        {locked && (
          <button type="button" onClick={reset} className={controlOutline}>
            <ArrowCounterClockwise /> 重來
          </button>
        )}
        <button
          type="button"
          aria-pressed={sound}
          aria-label={sound ? "關閉提示音" : "開啟提示音"}
          onClick={() => setSound(!sound)}
          className={`${controlOutline} px-4!`}
        >
          {sound ? <SpeakerHigh /> : <SpeakerSlash />}
          <span className="text-[0.9rem]">提示音{sound ? "開" : "關"}</span>
        </button>
      </div>
    </div>
  );
}

const controlBase =
  "inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-[0.8rem] font-semibold transition-all duration-300 hover:-translate-y-0.5";
const controlPrimary = `${controlBase} bg-primary text-white shadow-[0_4px_15px_rgba(43,122,120,0.3)] hover:bg-primary-dark`;
const controlOutline = `${controlBase} border-2 border-primary text-primary hover:bg-primary/10`;
