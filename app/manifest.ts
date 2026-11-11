import type { MetadataRoute } from "next";
import { asset, basePath } from "@/lib/site";

// 加到手機主畫面（PWA）的設定。點開圖示直接進入呼吸放鬆計時器。
// manifest 裡的網址不會自動加 basePath，要自己加上。
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${basePath}/`,
    name: "SEL 運動共學社群",
    short_name: "SEL 呼吸",
    description: "跟著圓圈的節奏吸氣、吐氣，用幾分鐘讓身心慢下來。",
    lang: "zh-TW",
    start_url: `${basePath}/breathing/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#def2f1",
    theme_color: "#2b7a78",
    icons: [
      { src: asset("/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: asset("/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: asset("/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
