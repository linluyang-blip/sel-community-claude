import type { Metadata } from "next";
import { Card } from "@/components/card";
import { Hero } from "@/components/hero";
import { LinkButton } from "@/components/link-button";
import { Orb } from "@/components/parallax";
import { Section } from "@/components/section";
import { SelQuiz } from "@/components/sel-quiz";
import { competencies } from "@/lib/sel-quiz";

const title = "SEL 五大能力自評 | SEL 運動共學社群";
const description = "20 道題目、約 3 分鐘，用雷達圖看看自己在 SEL 五大能力的現況。結果只顯示在你的畫面上，不會上傳或保存。";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

export default function SelQuizPage() {
  return (
    <>
      <Hero className="min-h-[55svh]" badge="SEL 小工具" title="SEL 五大能力自評" description={description}>
        <LinkButton href="#quiz">開始自評</LinkButton>
        <LinkButton href="/" variant="outline">
          回到首頁
        </LinkButton>
      </Hero>

      <Section id="quiz">
        <Orb speed={0.15} className="top-10 -right-24 size-56 bg-secondary/20 md:size-80" />
        <Orb speed={0.1} className="bottom-10 -left-24 size-56 bg-primary/10 md:size-80" />
        <div className="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-5">
          <div className="rounded-3xl border border-glass bg-card p-6 shadow-soft backdrop-blur-lg md:p-10 lg:col-span-3">
            <SelQuiz />
          </div>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 text-[1.3rem] font-bold text-primary">什麼是 SEL 五大能力？</h2>
            <dl className="mb-8 space-y-4">
              {competencies.map((c) => (
                <div key={c.id}>
                  <dt className="font-bold">{c.name}</dt>
                  <dd className="text-[0.95rem] text-muted">{c.summary}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mb-4 text-[1.3rem] font-bold text-primary">作答方式</h2>
            <ul className="mb-8 list-disc space-y-2 pl-5 text-[0.95rem] text-muted marker:text-secondary">
              <li>依照最近一個月的真實狀況作答，沒有標準答案。</li>
              <li>1 分代表「很不符合」，5 分代表「非常符合」。</li>
              <li>每項能力取 4 題的平均分數，畫成雷達圖。</li>
            </ul>

            <p className="rounded-2xl bg-secondary/10 p-4 text-[0.95rem] text-ink/80">
              五大能力參考 CASEL 的社會情緒學習架構。這份自評是社群自編的反思工具，不是標準化心理測驗，適合在研習前後或學期中定期回顧自己的狀態。
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
