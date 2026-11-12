import type { Metadata } from "next";
import { BreathingTimer } from "@/components/breathing-timer";
import { patterns } from "@/lib/breathing";
import { Card } from "@/components/card";
import { Hero } from "@/components/hero";
import { LinkButton } from "@/components/link-button";
import { Orb } from "@/components/parallax";
import { Section } from "@/components/section";

const title = "呼吸放鬆計時器 | SEL 運動共學社群";
const description = "跟著圓圈的節奏吸氣、吐氣，用幾分鐘讓身心慢下來。適合上課前、運動後或感到緊繃的時候使用。";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

const tips = [
  "坐姿或站姿都可以，肩膀放鬆下沉。",
  "用鼻子慢慢吸氣，讓腹部隨吸氣鼓起。",
  "吐氣時放慢速度，比吸氣更長會更放鬆。",
  "若感到頭暈或不適，請停下來恢復自然呼吸。",
];

export default function Breathing() {
  return (
    <>
      <Hero className="min-h-[55svh]" badge="SEL 小工具" title="呼吸放鬆計時器" description={description}>
        <LinkButton href="#timer">開始練習</LinkButton>
        <LinkButton href="/" variant="outline">
          回到首頁
        </LinkButton>
      </Hero>

      <Section id="practice">
        <Orb speed={0.15} className="top-10 -right-24 size-56 bg-secondary/20 md:size-80" />
        <Orb speed={0.1} className="bottom-10 -left-24 size-56 bg-primary/10 md:size-80" />
        <div className="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-5">
          {/* 錨點放在卡片上，跳轉後卡片緊貼導覽列下方，手機上整個計時器才放得進一個畫面。 */}
          <div
            id="timer"
            className="rounded-3xl border border-glass bg-card p-5 shadow-soft backdrop-blur-lg md:p-10 lg:col-span-3"
          >
            <BreathingTimer />
          </div>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 text-[1.3rem] font-bold text-primary">三種呼吸節奏</h2>
            <dl className="mb-8 space-y-4">
              {patterns.map((p) => (
                <div key={p.id}>
                  <dt className="font-bold">
                    {p.name}
                    <span className="ml-2 text-[0.85rem] font-semibold text-secondary">{p.rhythm}</span>
                  </dt>
                  <dd className="text-[0.95rem] text-muted">{p.note}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mb-4 text-[1.3rem] font-bold text-primary">練習小提醒</h2>
            <ul className="mb-8 list-disc space-y-2 pl-5 text-[0.95rem] text-muted marker:text-secondary">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>

            <p className="rounded-2xl bg-secondary/10 p-4 text-[0.95rem] text-ink/80">
              放慢呼吸是 SEL「自我管理」最容易開始的練習：先覺察身體的緊繃，再用呼吸讓自己回到平穩，才有餘裕回應學生與同事。
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
