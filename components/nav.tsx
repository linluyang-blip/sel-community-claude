"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "回到首頁" },
  { href: "/#about", label: "關於社群" },
  { href: "/#schedule", label: "活動規劃" },
  { href: "/outcomes", label: "成果發表" },
  { href: "/#members", label: "成員介紹" },
  { href: "/breathing", label: "呼吸放鬆" },
  { href: "/sel-quiz", label: "SEL 自評" },
  { href: "/mood", label: "情緒溫度計" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="fixed top-0 z-1000 flex w-full items-center justify-between border-b border-glass bg-white/70 px-[5%] py-3 shadow-[0_4px_15px_rgba(0,0,0,0.02)] backdrop-blur-md lg:py-[1.2rem]">
      <div className="text-lg font-bold tracking-[0.5px] whitespace-nowrap text-primary lg:text-xl">SEL 運動共學社群</div>

      <ul className="hidden gap-6 lg:flex xl:gap-10">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              // 靜態輸出的預載檔路徑與瀏覽器請求的路徑不一致，會產生 404，所以全站關閉預載。
              prefetch={false}
              className="relative font-medium whitespace-nowrap transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-secondary after:transition-[width] after:duration-300 after:ease-[cubic-bezier(0.25,0.8,0.25,1)] after:content-[''] hover:text-primary hover:after:w-full"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label={open ? "關閉選單" : "開啟選單"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex size-10 cursor-pointer items-center justify-center text-2xl text-primary lg:hidden"
      >
        {open ? <X /> : <List />}
      </button>

      {open && (
        <ul className="absolute inset-x-0 top-full border-b border-glass bg-white px-[5%] py-2 shadow-soft lg:hidden">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} prefetch={false} onClick={() => setOpen(false)} className="block py-3 font-medium hover:text-primary">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
