import type { Metadata } from "next";
import { BackToTop } from "@/components/back-to-top";
import { BreathingPromo } from "@/components/breathing-promo";
import { Card, CardIcon } from "@/components/card";
import { Hero } from "@/components/hero";
import { Lightbox, Photo } from "@/components/lightbox";
import { LinkButton } from "@/components/link-button";
import { MoodPromo } from "@/components/mood-promo";
import { Orb } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { SelQuizPromo } from "@/components/sel-quiz-promo";
import { Section } from "@/components/section";
import { outcomes } from "@/lib/content";

const title = "成果發表 | SEL 運動共學社群";

export const metadata: Metadata = {
  title,
  description: "SEL 社群成果發表",
  openGraph: { title },
};

export default function Outcomes() {
  const allPhotos = outcomes.flatMap((o) => o.groups?.flatMap((g) => g.photos) ?? []);

  return (
    <>
      <Hero
        className="min-h-[50vh]"
        badge="實踐成果紀錄"
        title="學習與實踐成果"
        description="探索我們在每次交流中所凝聚的智慧與反思，從汗水中收穫成長，從對話中建立支持。"
      >
        <LinkButton href="/" variant="outline">
          返回首頁
        </LinkButton>
      </Hero>

      <Section id="outcomes">
        <Orb speed={0.2} className="top-[15%] -right-24 size-64 bg-secondary/15 md:size-96" />
        <Orb speed={0.1} className="top-[55%] -left-24 size-56 bg-primary/10 md:size-80" />
        <Lightbox photos={allPhotos}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10 xl:grid-cols-4">
            {outcomes.map(({ id, icon: Icon, title, host, summary, groups }, i) => {
              const delay = (i % 3) * 150;
              const hostLine = host && (
                <>
                  <host.icon className="inline align-[-0.125em]" /> {host.label}
                  {host.place && ` ∕ ${host.place}`}
                </>
              );

              if (!groups) {
                return (
                  <Reveal
                    key={id}
                    id={id}
                    delay={delay}
                    className="flex min-h-[250px] scroll-mt-[100px] flex-col items-center justify-center rounded-3xl border border-dashed border-primary/35 bg-white/45 p-6 text-center md:p-10 shadow-[0_8px_32px_rgba(43,122,120,0.04)] backdrop-blur-xl transition-reveal hover:-translate-y-2 hover:bg-white/55 hover:shadow-[0_20px_40px_rgba(43,122,120,0.1)]"
                  >
                    <div className="mb-[1.2rem] animate-pulse-icon text-5xl text-primary/50">
                      <Icon />
                    </div>
                    <h3 className="mb-[0.6rem] text-[1.25rem] font-bold text-ink/80">{title}</h3>
                    <p className="mb-2 text-[0.85rem] font-medium text-primary">{hostLine}</p>
                    <p className="max-w-[250px] text-[0.9rem] text-muted">{summary}</p>
                  </Reveal>
                );
              }

              return (
                <Card key={id} id={id} delay={delay} className="col-span-full scroll-mt-[100px]">
                  <CardIcon>
                    <Icon />
                  </CardIcon>
                  <h3 className="mb-4 text-[1.4rem] font-bold">{title}</h3>
                  {host && <p className="mb-[0.8rem] text-[0.9rem] font-medium text-primary">{hostLine}</p>}
                  {summary && <p className="text-muted">{summary}</p>}
                  {groups.map(({ heading, photos }, g) => (
                    <div key={heading ?? g} className={g === 0 ? "mt-4" : "mt-10"}>
                      {heading && (
                        <h4 className="mb-[1.2rem] border-l-4 border-secondary pl-[0.8rem] text-[1.1rem] font-bold">
                          {heading}
                        </h4>
                      )}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {photos.map((photo) => (
                          <Photo key={photo.src} {...photo} />
                        ))}
                      </div>
                    </div>
                  ))}
                </Card>
              );
            })}
          </div>
        </Lightbox>
      </Section>

      <Section id="breathing">
        <div className="space-y-6 md:space-y-10">
          <BreathingPromo />
          <SelQuizPromo />
          <MoodPromo />
        </div>
      </Section>

      <BackToTop />
    </>
  );
}
