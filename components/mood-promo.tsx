import { Card } from "./card";
import { LinkButton } from "./link-button";

/** 情緒溫度計的入口卡片，用於首頁與成果頁。 */
export function MoodPromo() {
  return (
    <Card id="mood" className="flex scroll-mt-28 flex-col items-center gap-8 text-center md:flex-row md:text-left">
      <div aria-hidden className="relative flex size-32 shrink-0 items-center justify-center md:size-40">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/40" />
        <svg viewBox="0 0 40 100" className="relative h-[70%]">
          <defs>
            <linearGradient id="mood-promo-fill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="#e9b949" />
            </linearGradient>
          </defs>
          <rect x={12} y={4} width={16} height={74} rx={8} fill="var(--color-secondary)" fillOpacity={0.15} />
          <rect x={12} y={30} width={16} height={56} rx={8} fill="url(#mood-promo-fill)" />
          <circle cx={20} cy={84} r={13} fill="var(--color-primary)" />
        </svg>
      </div>
      <div className="flex-1">
        <span className="mb-3 inline-block rounded-lg bg-secondary/10 px-3 py-[5px] text-[0.9rem] font-semibold text-secondary">
          SEL 小工具
        </span>
        <h3 className="mb-3 text-[1.4rem] font-bold text-primary md:text-[1.6rem]">情緒溫度計</h3>
        <p className="mb-6 text-muted">
          每天花一分鐘，選擇今天的心情溫度、替感受取個名字、寫幾句話給自己，累積下來就能看見自己的情緒起伏。紀錄只存在你的瀏覽器，別人看不到。
        </p>
        <LinkButton href="/mood#checkin">今天打卡</LinkButton>
      </div>
    </Card>
  );
}
