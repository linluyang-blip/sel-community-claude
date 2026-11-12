import type { Metadata } from "next";
import { Card } from "@/components/card";
import { Hero } from "@/components/hero";
import { LinkButton } from "@/components/link-button";
import { MoodCheckin } from "@/components/mood-checkin";
import { Orb } from "@/components/parallax";
import { Section } from "@/components/section";

const title = "情緒溫度計 | SEL 運動共學社群";
const description = "每天花一分鐘，選擇今天的心情溫度、替感受取個名字、寫幾句話給自己。紀錄只存在你的瀏覽器，別人看不到。";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

export default function MoodPage() {
  return (
    <>
      <Hero className="min-h-[55svh]" badge="SEL 小工具" title="情緒溫度計" description={description}>
        <LinkButton href="#checkin">今天打卡</LinkButton>
        <LinkButton href="/" variant="outline">
          回到首頁
        </LinkButton>
      </Hero>

      <Section id="mood">
        <Orb speed={0.15} className="top-10 -right-24 size-56 bg-secondary/20 md:size-80" />
        <Orb speed={0.1} className="bottom-10 -left-24 size-56 bg-primary/10 md:size-80" />
        <div className="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-5">
          <div id="checkin" className="rounded-3xl border border-glass bg-card p-6 shadow-soft backdrop-blur-lg md:p-10 lg:col-span-3">
            <MoodCheckin />
          </div>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 text-[1.3rem] font-bold text-primary">為什麼要量情緒溫度？</h2>
            <p className="mb-8 text-[0.95rem] text-muted">
              自我覺察是 SEL 五大能力的起點。每天停下來一分鐘，看看自己的心情、替感受命名，就能更早發現壓力的累積，也更知道什麼事會讓自己充電。
            </p>

            <h2 className="mb-4 text-[1.3rem] font-bold text-primary">怎麼使用</h2>
            <ul className="mb-8 list-disc space-y-2 pl-5 text-[0.95rem] text-muted marker:text-secondary">
              <li>找一個固定時間打卡，例如放學後或睡前。</li>
              <li>心情沒有好壞，照實記錄就好；同一天可以回來修改。</li>
              <li>累積一兩週後，看看「最近 14 天」的起伏和常出現的情緒。</li>
            </ul>

            <h2 className="mb-4 text-[1.3rem] font-bold text-primary">關於隱私</h2>
            <ul className="mb-8 list-disc space-y-2 pl-5 text-[0.95rem] text-muted marker:text-secondary">
              <li>紀錄只存在這台裝置的這個瀏覽器，不會上傳到任何伺服器，社群夥伴也看不到。</li>
              <li>換手機或電腦就看不到原本的紀錄；清除瀏覽器資料或使用無痕視窗時，紀錄也會消失。可以用「下載紀錄」自行備份。</li>
              <li>如果是和別人共用的電腦，使用同一個瀏覽器的人也能看到，用完記得清除。</li>
            </ul>

            <p className="rounded-2xl bg-secondary/10 p-4 text-[0.95rem] text-ink/80">
              這是幫助自我覺察的小工具，不是心理測驗或診斷。如果低落的心情持續兩週以上，建議尋求專業協助，例如學校輔導室，或撥打衛福部安心專線{" "}
              <a href="tel:1925" className="font-bold text-primary underline underline-offset-4">
                1925
              </a>
              （24 小時免付費）。
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
