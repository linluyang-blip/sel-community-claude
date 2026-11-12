import type { Icon } from "@phosphor-icons/react";
import {
  Barbell,
  Books,
  ChalkboardTeacher,
  FlowerLotus,
  Handshake,
  PingPong,
  Plant,
  PresentationChart,
  Strategy,
  User,
  Users,
} from "@phosphor-icons/react/ssr";

export type Person = { icon: Icon; label: string };

export type ScheduleItem = {
  date: string;
  title: string;
  description: string;
  outcomeId: string;
  speaker: Person;
  location?: string;
};

export type Member = {
  name: string;
  role: string;
  school: string;
  avatar?: string;
  initial: string;
};

export type Photo = { src: string; alt: string; featured?: boolean };
export type PhotoGroup = { heading?: string; photos: Photo[] };

export type Outcome = {
  id: string;
  icon: Icon;
  title: string;
  host?: Person & { place?: string };
  summary?: string;
  /** 沒有 groups 的場次會顯示為「籌備中」卡片。 */
  groups?: PhotoGroup[];
};

const photos = (prefix: string, from: number, to: number, alt: string): Photo[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    src: `/${prefix}-photo${from + i}.jpg`,
    alt: `${alt}${from + i}`,
  }));

export const contactEndpoint = "https://formsubmit.co/7e1e9d6317fae8ca91496e2357c8ceaf";

export const about: { icon: Icon; title: string; description: string }[] = [
  {
    icon: FlowerLotus,
    title: "自我覺察與情緒調適",
    description: "透過情緒調節策略、呼吸放鬆及桌球/羽球運動體驗，引導教師覺察壓力來源，培養自我照顧與調適能力。",
  },
  {
    icon: Handshake,
    title: "人際互動與支持關係",
    description: "藉由人際互動講座、合作型運動活動與經驗分享，促進教師溝通與支持能力，建立正向同儕支持系統。",
  },
  {
    icon: Plant,
    title: "落實正向教學氛圍",
    description: "採「專業學習＋體驗實作＋反思交流」模式，將 SEL 落實於日常生活與教學情境中，提升身心健康。",
  },
];

export const schedule: ScheduleItem[] = [
  {
    date: "04.24 (五)",
    title: "破冰交流 & SEL經驗分享",
    description:
      "分享羽球雙打比賽之經驗與心得，覺察合作歷程中的溝通方式、角色分工與情緒變化；交流目前對社會情緒學習（SEL）的理解與實踐經驗，建立初步共識並凝聚社群方向。",
    outcomeId: "outcome-0424",
    speaker: { icon: User, label: "黃如昕 召集人" },
  },
  {
    date: "05.04 (一) 16:00-17:30",
    title: "桌球實作 I：壓力釋放與專注練習",
    description:
      "由專業教練帶領桌球基礎與專注練習，透過運動體驗身心放鬆與壓力釋放效果。引導教師覺察運動歷程中的專注狀態與情緒變化，連結自我管理能力。",
    outcomeId: "outcome-0504",
    speaker: { icon: Barbell, label: "林子鈞 教練" },
    location: "城市桌球",
  },
  {
    date: "05.20 (三) 12:20-14:00",
    title: "SEL 於學校行政與導師之運用",
    description:
      "專題講座介紹社會情緒學習（SEL）的核心概念與五大能力，引導教師檢視自身在教學現場中的情緒經驗與壓力來源，建立情緒覺察與自我理解的基礎。",
    outcomeId: "outcome-0520",
    speaker: { icon: PresentationChart, label: "劉士毅 主任" },
    location: "青年國中",
  },
  {
    date: "06.15 (一) 16:30-18:00",
    title: "桌球實作 II：桌球與情緒調節體驗",
    description:
      "進階桌球基礎與專注練習，透過運動過程體驗身心放鬆與壓力釋放效果，引導教師覺察運動歷程中的專注狀態與情緒變化，連結自我管理能力。",
    outcomeId: "outcome-0615",
    speaker: { icon: Barbell, label: "林子鈞 教練" },
    location: "城市桌球",
  },
  {
    date: "09.18 (五) 14:20-15:10",
    title: "SEL 讀書會",
    description: "社群教師分享 SEL 相關書籍的閱讀心得，透過共讀與交流，協助教師建立日常可運用的自我照顧策略與心靈支持網絡。",
    outcomeId: "outcome-reading",
    speaker: { icon: User, label: "黃如昕 召集人" },
  },
  {
    date: "10.16 (五) 14:20-15:10",
    title: "羽球發球機實作 I：身心放鬆與體能調適",
    description: "由教練帶領羽球活動，透過運動促進身心放鬆與壓力調適。活動後進行反思討論，引導分享身體感受與情緒變化，連結自我管理與身心調節能力。",
    outcomeId: "outcome-badminton1",
    speaker: { icon: User, label: "蔡宗凌 主任" },
    location: "高餐大附中 5樓禮堂",
  },
  {
    date: "09-12月 (待定)",
    title: "羽球實作 II：團隊互動與支持關係建立",
    description: "透過分組合作與互動練習，體驗團隊合作與互相支持的歷程。活動後安排交流與反思，討論互動過程中的溝通、支持與合作經驗，強化關係建立能力。",
    outcomeId: "outcome-badminton2",
    speaker: { icon: Users, label: "社群自由練習" },
  },
  {
    date: "09-12月 (待定)",
    title: "SEL 共學交流與成果發表",
    description: "透過羽球與桌球活動進行成果展現，呈現成員在合作互動、專注投入與情緒調節之學習歷程，深化自我覺察、自我管理與人際關係能力。",
    outcomeId: "outcome-share",
    speaker: { icon: User, label: "黃如昕 召集人" },
  },
];

export const members: Member[] = [
  { name: "黃如昕", role: "召集人 / 導師", school: "高餐大附中", avatar: "/avatar-huang.jpg", initial: "昕" },
  { name: "林律揚", role: "成員 / 導師", school: "高餐大附中", initial: "揚" },
  { name: "羅琳峰", role: "成員 / 導師", school: "高餐大附中", avatar: "/avatar-feng.jpg", initial: "峰" },
  { name: "蔡宗凌", role: "成員 / 學務主任", school: "高餐大附中", initial: "凌" },
];

export const outcomes: Outcome[] = [
  {
    id: "outcome-0424",
    icon: Handshake,
    title: "04.24 破冰交流 & SEL經驗分享",
    groups: [
      {
        heading: "第一部分：校際羽球比賽英姿",
        photos: [
          { src: "/badminton-hero.jpg", alt: "校際羽球比賽精彩畫面", featured: true },
          ...photos("424", 2, 14, "羽球交流成果"),
        ],
      },
      {
        heading: "第二部分：分享羽球比賽經驗，覺察合作歷程的溝通與情緒變化",
        photos: photos("424", 15, 19, "羽球交流成果"),
      },
    ],
  },
  {
    id: "outcome-0504",
    icon: PingPong,
    title: "05.04 桌球實作 I：壓力釋放與專注練習",
    host: { icon: ChalkboardTeacher, label: "林子鈞 教練", place: "城市桌球" },
    summary: "專業教練帶領桌球基礎，引導教師覺察運動歷程中的專注狀態與身心壓力釋放效果。",
    groups: [{ photos: photos("504", 1, 11, "桌球實作成果") }],
  },
  {
    id: "outcome-0520",
    icon: PresentationChart,
    title: "05.20 SEL 於學校行政與導師之運用",
    host: { icon: User, label: "劉士毅 主任", place: "青年國中" },
    summary: "透過專題講座引導教師檢視自身在教學現場中的情緒經驗與壓力來源，建立情緒覺察與自我理解的基礎。",
    groups: [{ photos: photos("520", 1, 3, "SEL運用成果") }],
  },
  {
    id: "outcome-0615",
    icon: PingPong,
    title: "06.15 桌球實作 II：桌球與情緒調節體驗",
    host: { icon: Barbell, label: "林子鈞 教練", place: "城市桌球" },
    summary: "進階桌球體驗，進一步鞏固身心放鬆技巧與壓力釋放反思，促進社群深度交流。",
    groups: [{ photos: photos("615", 1, 3, "桌球實作成果") }],
  },
  {
    id: "outcome-reading",
    icon: Books,
    title: "09.18 SEL 讀書會",
    host: { icon: User, label: "黃如昕 召集人" },
    summary: "分享書籍閱讀心得，協助建立日常自我照顧策略與支持網絡。",
    groups: [{ photos: photos("918", 1, 12, "SEL 讀書會成果") }],
  },
  {
    id: "outcome-badminton1",
    icon: Barbell,
    title: "10.16 羽球發球機實作 I",
    host: { icon: User, label: "蔡宗凌 主任", place: "高餐大附中 5樓禮堂" },
    summary: "活動已於 10/16 辦理，成果照片整理中！透過運動促進身心放鬆與體能調適，連結自我管理與情緒調節。",
  },
  {
    id: "outcome-badminton2",
    icon: Users,
    title: "09-12月 羽球實作 II",
    host: { icon: Users, label: "社群自由練習" },
    summary: "活動籌備中，敬請期待！透過團隊分組合作練習，體驗互相支持的互動歷程並建立關係。",
  },
  {
    id: "outcome-share",
    icon: Strategy,
    title: "09-12月 SEL 成果發表",
    host: { icon: User, label: "黃如昕 召集人" },
    summary: "活動籌備中，敬請期待！進行羽球與桌球活動成果展現，深化自我覺察與關係建立之學習反思。",
  },
];
