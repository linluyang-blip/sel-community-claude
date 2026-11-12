import Image from "next/image";
import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/ssr";
import { BreathingPromo } from "@/components/breathing-promo";
import { Card, CardIcon } from "@/components/card";
import { ContactForm } from "@/components/contact-form";
import { Hero } from "@/components/hero";
import { LinkButton } from "@/components/link-button";
import { Orb } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { SelQuizPromo } from "@/components/sel-quiz-promo";
import { Section, SectionTitle } from "@/components/section";
import { about, members, schedule } from "@/lib/content";
import { asset } from "@/lib/site";

const badge = "inline-flex items-center gap-[0.35rem] rounded-md border px-2.5 py-1 text-[0.8rem] font-medium";

export default function Home() {
  return (
    <>
      <Hero
        className="min-h-svh"
        top={
          <div className="mb-4 flex justify-center gap-5 text-5xl leading-[1.6] md:mb-6 md:text-[4rem]">
            <div className="animate-hit-left">🏓</div>
            <div className="animate-hit-right">🏸</div>
          </div>
        }
        badge="國立高雄師範大學南區社會情緒學習與教育創新中心"
        title={
          <>
            SEL 教師專業<wbr />發展與實踐
          </>
        }
        description="關注教師在高壓教學環境中的情緒調適與人際支持，透過運動體驗與專業講座，提升自我覺察與社會情緒素養。"
      >
        <LinkButton href="#about">了解理念</LinkButton>
        <LinkButton href="#schedule" variant="outline">
          活動時程
        </LinkButton>
        <LinkButton href="/outcomes" variant="outline">
          成果發表
        </LinkButton>
      </Hero>

      <Section id="about">
        <Orb speed={0.15} className="top-10 -right-24 size-56 bg-secondary/20 md:size-80" />
        <SectionTitle>社群目標與理念</SectionTitle>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
          {about.map(({ icon: Icon, title, description }, i) => (
            <Card key={title} delay={(i % 3) * 150} className="md:last:col-span-2 lg:last:col-span-1">
              <CardIcon>
                <Icon />
              </CardIcon>
              <h3 className="mb-4 text-[1.4rem] font-bold">{title}</h3>
              <p className="text-muted">{description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="schedule">
        <Orb speed={0.25} className="top-1/4 -left-24 size-64 bg-primary/10 md:size-96" />
        <Orb speed={-0.1} className="right-[-6rem] bottom-1/4 size-56 bg-secondary/15 md:size-80" />
        <SectionTitle>活動規劃表</SectionTitle>
        <div className="relative mx-auto max-w-[900px] after:absolute after:inset-y-0 after:left-5 after:-ml-0.5 after:w-1 after:rounded-xs after:bg-secondary/20 after:content-[''] lg:after:left-1/2">
          {schedule.map(({ date, title, description, outcomeId, speaker, location }) => (
            <Reveal
              key={outcomeId}
              hiddenClassName=""
              className="group relative w-full py-[15px] pr-0 pl-[45px] after:absolute after:top-[15px] after:left-[7px] after:z-1 after:size-[26px] after:rounded-full after:border-4 after:border-secondary after:bg-surface after:transition-all after:duration-300 after:content-[''] hover:after:scale-120 hover:after:bg-secondary hover:after:shadow-[0_0_15px_rgba(58,175,169,0.5)] lg:w-1/2 lg:px-[50px] lg:py-2.5 lg:after:size-8 lg:odd:after:right-[-16px] lg:odd:after:left-auto lg:even:left-1/2 lg:even:after:left-[-16px]"
            >
              <Link
                href={`/outcomes#${outcomeId}`}
                prefetch={false}
                className="relative block translate-y-5 rounded-[20px] border border-glass bg-card p-5 opacity-0 md:p-8 shadow-soft transition-reveal group-hover:scale-[1.02] group-hover:shadow-[0_15px_30px_rgba(43,122,120,0.1)] group-data-visible:translate-y-0 group-data-visible:opacity-100"
              >
                <span className="mb-[0.8rem] inline-block rounded-lg bg-secondary/10 px-3 py-[5px] text-[0.9rem] font-semibold text-secondary">
                  {date}
                </span>
                <h4 className="mb-[0.8rem] text-[1.25rem] font-bold text-primary">{title}</h4>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className={`${badge} border-primary/15 bg-primary/8 text-primary`}>
                    <speaker.icon className="text-[0.9rem]" /> {speaker.label}
                  </span>
                  {location && (
                    <span className={`${badge} border-secondary/15 bg-secondary/8 text-secondary`}>
                      <MapPin className="text-[0.9rem]" /> {location}
                    </span>
                  )}
                </div>
                <p>{description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="breathing">
        <div className="space-y-6 md:space-y-10">
          <BreathingPromo />
          <SelQuizPromo />
        </div>
      </Section>

      <Section id="members">
        <Orb speed={0.15} className="-top-10 -left-16 size-48 bg-secondary/20 md:size-72" />
        <SectionTitle>社群成員</SectionTitle>
        <div className="grid grid-cols-2 gap-4 text-center md:gap-10 lg:grid-cols-4">
          {members.map(({ name, role, school, avatar, initial }, i) => (
            <Reveal
              key={name}
              delay={(i % 3) * 150}
              hiddenClassName="translate-y-5 opacity-0"
              className="rounded-3xl border border-glass bg-card px-3 py-6 shadow-soft md:px-8 md:py-10 transition-reveal hover:-translate-y-2"
            >
              {avatar ? (
                <Image
                  src={asset(avatar)}
                  alt={name}
                  width={140}
                  height={140}
                  className="mx-auto mb-4 size-24 rounded-full object-cover md:mb-6 md:size-[140px] shadow-[0_10px_20px_rgba(43,122,120,0.2)]"
                />
              ) : (
                <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-linear-135 from-secondary to-primary text-3xl font-bold md:mb-6 md:size-[140px] md:text-5xl text-white shadow-[0_10px_20px_rgba(43,122,120,0.2)]">
                  {initial}
                </div>
              )}
              <h4 className="mb-[0.3rem] text-[1.3rem] font-bold">{name}</h4>
              <p className="mb-2 font-medium text-primary">{role}</p>
              <small className="text-muted">{school}</small>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="contact">
        <SectionTitle>加入我們</SectionTitle>
        <Card className="mx-auto max-w-[600px] text-left">
          <ContactForm />
        </Card>
      </Section>
    </>
  );
}
