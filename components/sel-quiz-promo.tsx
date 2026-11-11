import { Card } from "./card";
import { LinkButton } from "./link-button";

// 圖示用的五邊形：外框與一個示意的能力輪廓（不是真實分數）。
const corner = (i: number, r: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
};
const shape = (rs: number[]) => rs.map((r, i) => corner(i, r)).join(" ");

/** SEL 五大能力自評的入口卡片，用於首頁與成果頁。 */
export function SelQuizPromo() {
  return (
    <Card id="sel-quiz" className="flex scroll-mt-28 flex-col items-center gap-8 text-center md:flex-row md:text-left">
      <div aria-hidden className="relative flex size-32 shrink-0 items-center justify-center md:size-40">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/40" />
        <svg viewBox="0 0 100 100" className="relative size-[78%]">
          <defs>
            <linearGradient id="sel-quiz-promo-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" />
              <stop offset="100%" stopColor="var(--color-primary)" />
            </linearGradient>
          </defs>
          <polygon points={shape([46, 46, 46, 46, 46])} fill="none" stroke="var(--color-secondary)" strokeOpacity={0.4} strokeWidth={2} />
          <polygon points={shape([23, 23, 23, 23, 23])} fill="none" stroke="var(--color-secondary)" strokeOpacity={0.3} strokeWidth={1.5} />
          <polygon points={shape([40, 30, 44, 34, 38])} fill="url(#sel-quiz-promo-fill)" stroke="var(--color-primary)" strokeWidth={2} strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-1">
        <span className="mb-3 inline-block rounded-lg bg-secondary/10 px-3 py-[5px] text-[0.9rem] font-semibold text-secondary">
          SEL 小工具
        </span>
        <h3 className="mb-3 text-[1.4rem] font-bold text-primary md:text-[1.6rem]">SEL 五大能力自評</h3>
        <p className="mb-6 text-muted">
          20 道題目、約 3 分鐘，用雷達圖看看自己在自我覺察、自我管理、社會覺察、人際技巧與負責任的決策上的現況。結果只顯示在你的畫面上，不會上傳或保存。
        </p>
        <LinkButton href="/sel-quiz#quiz">開始自評</LinkButton>
      </div>
    </Card>
  );
}
