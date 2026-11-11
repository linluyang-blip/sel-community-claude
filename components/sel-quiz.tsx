"use client";

import { ArrowLeft, ArrowRight, ArrowCounterClockwise, LockSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { competencies, levelOf, scale } from "@/lib/sel-quiz";

// 答案只存在這個元件的 state，不上傳、不寫入瀏覽器儲存空間，關閉或重新整理頁面就會消失。

const btnBase =
  "inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-[0.8rem] font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
const btnPrimary = `${btnBase} bg-primary text-white shadow-[0_4px_15px_rgba(43,122,120,0.3)] hover:bg-primary-dark disabled:hover:bg-primary`;
const btnOutline = `${btnBase} border-2 border-primary text-primary hover:bg-primary/10`;

const emptyAnswers = () => competencies.map((c) => c.items.map(() => 0));
const average = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function SelQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[][]>(emptyAnswers);
  const top = useRef<HTMLDivElement>(null);

  const done = step === competencies.length;
  const go = (next: number) => {
    setStep(next);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const restart = () => {
    setAnswers(emptyAnswers());
    go(0);
  };

  return (
    <div ref={top} className="scroll-mt-28">
      {done ? (
        <Result scores={answers.map(average)} onRestart={restart} />
      ) : (
        <Questions
          step={step}
          answers={answers[step]}
          onAnswer={(i, v) => setAnswers((prev) => prev.map((row, s) => (s === step ? row.map((x, j) => (j === i ? v : x)) : row)))}
          onBack={() => go(step - 1)}
          onNext={() => go(step + 1)}
        />
      )}
    </div>
  );
}

type QuestionsProps = {
  step: number;
  answers: number[];
  onAnswer: (item: number, value: number) => void;
  onBack: () => void;
  onNext: () => void;
};

function Questions({ step, answers, onAnswer, onBack, onNext }: QuestionsProps) {
  const c = competencies[step];
  const complete = answers.every((a) => a > 0);
  const last = step === competencies.length - 1;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[0.9rem] font-semibold text-muted tabular-nums">
        <span>
          第 {step + 1} / {competencies.length} 部分
        </span>
        <span>{answers.filter((a) => a > 0).length} / {c.items.length} 題</span>
      </div>
      <div className="mb-8 flex gap-1.5" aria-hidden>
        {competencies.map((x, i) => (
          <div key={x.id} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-secondary" : "bg-secondary/15"}`} />
        ))}
      </div>

      <h2 className="mb-1 text-[1.5rem] font-bold text-primary md:text-[1.8rem]">{c.name}</h2>
      <p className="mb-8 text-muted">{c.summary}</p>

      <ol className="mb-10 space-y-8">
        {c.items.map((item, i) => (
          <li key={item}>
            <fieldset>
              <legend className="mb-3 font-semibold">
                {i + 1}. {item}
              </legend>
              <div className="flex justify-between gap-2 sm:justify-start sm:gap-3">
                {scale.map((label, v) => {
                  const value = v + 1;
                  const checked = answers[i] === value;
                  return (
                    <label key={label} className="flex flex-col items-center gap-1">
                      <input
                        type="radio"
                        name={`${c.id}-${i}`}
                        value={value}
                        checked={checked}
                        onChange={() => onAnswer(i, value)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        className={`flex size-11 cursor-pointer items-center justify-center rounded-full border-2 font-semibold transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary sm:size-12 ${
                          checked ? "border-primary bg-primary text-white" : "border-primary/30 text-primary hover:bg-primary/10"
                        }`}
                      >
                        {value}
                      </span>
                      <span className="text-[0.75rem] whitespace-nowrap text-muted sm:text-[0.8rem]">{label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={onBack} className={btnOutline}>
            <ArrowLeft /> 上一部分
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={onNext} disabled={!complete} className={btnPrimary}>
          {last ? "看結果" : "下一部分"} <ArrowRight />
        </button>
      </div>
      {!complete && <p className="mt-3 text-right text-[0.85rem] text-muted">這一部分的題目都作答後，就能繼續。</p>}
    </div>
  );
}

function Result({ scores, onRestart }: { scores: number[]; onRestart: () => void }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  // 全部同分時不特別標出強弱項。
  const strengths = max > min ? competencies.filter((_, i) => scores[i] === max) : [];
  const growth = max > min ? competencies.filter((_, i) => scores[i] === min) : [];

  return (
    <div>
      <h2 className="mb-2 text-center text-[1.5rem] font-bold text-primary md:text-[1.8rem]">你的 SEL 能力雷達圖</h2>
      <p className="mb-6 flex items-center justify-center gap-1.5 text-center text-[0.9rem] text-muted">
        <LockSimple /> 結果只顯示在你的畫面上，不會上傳或保存。
      </p>

      <div className="flex flex-col gap-8">
        <Radar scores={scores} active={active} onActive={setActive} />

        <div>
          <table className="w-full text-left">
            <caption className="sr-only">各能力平均分數（1 到 5 分）</caption>
            <thead className="text-[0.85rem] text-muted">
              <tr>
                <th className="pb-2 font-semibold">能力</th>
                <th className="pb-2 text-right font-semibold">平均</th>
                <th className="pb-2 pl-4 font-semibold">狀態</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((c, i) => (
                <tr
                  key={c.id}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className={`border-t border-primary/10 transition-colors ${active === i ? "bg-secondary/10" : ""}`}
                >
                  <td className="py-3 font-semibold">{c.name}</td>
                  <td className="py-3 text-right text-[1.1rem] font-bold text-primary tabular-nums">{scores[i].toFixed(1)}</td>
                  <td className="py-3 pl-4 text-[0.9rem] text-muted">{levelOf(scores[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        {strengths.length > 0 && (
          <p className="rounded-2xl bg-secondary/10 p-4 text-ink/80">
            <strong className="text-primary">相對優勢：{strengths.map((c) => c.name).join("、")}</strong>
            <br />
            這是你目前最得心應手的能力，可以多運用它來支持學生與同事。
          </p>
        )}
        {(growth.length > 0 ? growth : competencies.filter((_, i) => scores[i] < 3)).map((c) => (
          <div key={c.id} className="rounded-2xl border border-secondary/30 p-4">
            <p className="mb-1 font-bold text-primary">可以多練習：{c.name}</p>
            <p className="text-ink/80">{c.tip}</p>
            {c.link && (
              <Link href={c.link.href} prefetch={false} className="mt-2 inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">
                {c.link.label} <ArrowRight />
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-[0.85rem] text-muted">
        這份自評是幫助自我覺察與反思的小工具，不是標準化心理測驗，分數沒有好壞之分。隔一段時間再做一次，看看自己的變化。
      </p>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={onRestart} className={btnOutline}>
          <ArrowCounterClockwise /> 重新作答
        </button>
      </div>
    </div>
  );
}

// 雷達圖：1–5 分，五條軸從正上方順時針排列。
const SIZE = 420;
const C = SIZE / 2;
const R = 130;
const LEVELS = [1, 2, 3, 4, 5];
// 左右兩側預留標籤寬度；較長的名稱拆成兩行，手機上標籤字才不會太小。
const PAD = 40;
const LABEL = 22;
const lines = (name: string) => (name.length > 4 ? [name.slice(0, 4), name.slice(4)] : [name]);

const point = (axis: number, value: number) => {
  const angle = -Math.PI / 2 + (axis * 2 * Math.PI) / competencies.length;
  const r = (value / 5) * R;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;
};
const polygon = (values: number[]) => values.map((v, i) => point(i, v).join(",")).join(" ");

function Radar({ scores, active, onActive }: { scores: number[]; active: number | null; onActive: (i: number | null) => void }) {
  return (
    <svg
      viewBox={`${-PAD} 0 ${SIZE + PAD * 2} ${SIZE}`}
      role="img"
      aria-label={`SEL 能力雷達圖：${competencies.map((c, i) => `${c.name} ${scores[i].toFixed(1)} 分`).join("，")}`}
      className="mx-auto w-full max-w-[460px]"
    >
      {/* 格線與軸線：淡色，不搶資料的視線 */}
      {LEVELS.map((l) => (
        <polygon key={l} points={polygon(competencies.map(() => l))} fill="none" stroke="var(--color-primary)" strokeOpacity={l === 5 ? 0.25 : 0.12} />
      ))}
      {competencies.map((c, i) => {
        const [x, y] = point(i, 5);
        return <line key={c.id} x1={C} y1={C} x2={x} y2={y} stroke="var(--color-primary)" strokeOpacity={0.12} />;
      })}
      {[1, 3, 5].map((l) => {
        const [, y] = point(0, l);
        return (
          <text key={l} x={C + 6} y={y + 4} fontSize={14} fill="var(--color-muted)" className="tabular-nums">
            {l}
          </text>
        );
      })}

      {/* 資料 */}
      <polygon points={polygon(scores)} fill="var(--color-secondary)" fillOpacity={0.22} stroke="var(--color-primary)" strokeWidth={2} strokeLinejoin="round" />
      {scores.map((s, i) => {
        const [x, y] = point(i, s);
        const c = competencies[i];
        return (
          <g
            key={c.id}
            tabIndex={0}
            role="button"
            aria-label={`${c.name} ${s.toFixed(1)} 分`}
            onMouseEnter={() => onActive(i)}
            onMouseLeave={() => onActive(null)}
            onFocus={() => onActive(i)}
            onBlur={() => onActive(null)}
            className="cursor-default outline-none"
          >
            <circle cx={x} cy={y} r={18} fill="transparent" />
            <circle cx={x} cy={y} r={active === i ? 7 : 5} fill="var(--color-primary)" stroke="var(--color-surface)" strokeWidth={2} />
          </g>
        );
      })}

      {/* 軸標籤 */}
      {competencies.map((c, i) => {
        const [x, y] = point(i, 6);
        const anchor = Math.abs(x - C) < 5 ? "middle" : x > C ? "start" : "end";
        const rows = lines(c.name);
        return (
          <text
            key={c.id}
            x={x}
            y={y - ((rows.length - 1) * LABEL * 1.2) / 2}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={LABEL}
            fontWeight={active === i ? 700 : 600}
            fill={active === i ? "var(--color-primary)" : "var(--color-ink)"}
          >
            {rows.map((row, r) => (
              <tspan key={row} x={x} dy={r === 0 ? 0 : LABEL * 1.2}>
                {row}
              </tspan>
            ))}
          </text>
        );
      })}

      {/* 提示框 */}
      {active !== null &&
        (() => {
          const [x, y] = point(active, scores[active]);
          const label = `${competencies[active].name}　${scores[active].toFixed(1)} 分`;
          const w = label.length * 16 + 16;
          const tx = Math.min(Math.max(x - w / 2, -PAD + 4), SIZE + PAD - w - 4);
          const ty = y - 46 < 4 ? y + 14 : y - 46;
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={w} height={34} rx={8} fill="var(--color-ink)" fillOpacity={0.9} />
              <text x={tx + w / 2} y={ty + 18} textAnchor="middle" dominantBaseline="middle" fontSize={16} fill="white" className="tabular-nums">
                {label}
              </text>
            </g>
          );
        })()}
    </svg>
  );
}
