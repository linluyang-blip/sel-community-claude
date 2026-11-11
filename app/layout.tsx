import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Outfit } from "next/font/google";
import { Nav } from "@/components/nav";
import { ScrollProgress } from "@/components/scroll-progress";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// 中文字型檔依 unicode-range 切片，由瀏覽器按需下載，因此不預載。
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  preload: false,
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const title = "SEL 運動共學社群 | 高師大";

export const metadata: Metadata = {
  title,
  description: "關注教師在高壓教學環境中的情緒調適與人際支持，透過運動體驗與專業講座，提升自我覺察與社會情緒素養。",
  openGraph: {
    title,
    description: "關注教師在高壓教學環境中的情緒調適與人際支持，提升自我覺察與教育創新。",
    type: "website",
    images: `${siteUrl}/og-image.jpg`,
  },
  // 加到 iPhone 主畫面後以全螢幕開啟，圖示下方顯示的名稱。
  appleWebApp: { capable: true, title: "SEL 呼吸", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#2b7a78",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-TW" className={`${notoSansTC.variable} ${outfit.variable} scroll-pt-[85px]`}>
      <body className="overflow-x-hidden bg-linear-135 from-[#def2f1] to-white font-sans leading-[1.6] text-ink">
        <ScrollProgress />
        <Nav />
        {/* overflow-x-clip：視差光暈會超出畫面邊緣，不能讓它產生橫向捲動。 */}
        <main className="overflow-x-clip">{children}</main>
        <footer className="mt-16 border-t border-glass bg-white/50 px-4 py-12 text-center text-[0.9rem] text-muted backdrop-blur-[10px]">
          <p>&copy; 2026 高師大南區社會情緒學習與教育創新中心。版權所有，保留一切權利。</p>
        </footer>
      </body>
    </html>
  );
}
