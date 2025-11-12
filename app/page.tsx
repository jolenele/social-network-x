"use client";

import React, { useEffect, useState } from "react";
import ImageComp from "@/app/components/ImageComp";
// Lexend is loaded via `next/font/google` in `app/layout.tsx`; no need to import @fontsource here
import Link from "next/link";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    // Query internal API that returns { authenticated: boolean }
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setIsLoggedIn(Boolean(data?.authenticated));
      })
      .catch(() => {
        if (!mounted) return;
        setIsLoggedIn(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // While loading, default to the public flow so users can still proceed.
  const href = isLoggedIn ? "/editor" : "/try_it_now";

  return (
    <div
      className="min-h-screen flex flex-col items-center text-black bg-[#8df6ddff] font-lexend bg-[radial-gradient(#fef5fe_2px,transparent_2px),radial-gradient(#fef5fe_2px,transparent_2px)] bg-size-[80px_80px] bg-position-[0_0,40px_40px] bg-blend-overlay"
    >
      <p className="text-[30px] mt-15">Discover the New You</p>
      <p className="text-[18px] mt-5 mb-5 text-black text-center">
        The possibilities are endless — AI reinvents your style, no scissors required.
      </p>

      <div className="flex flex-row items-center">
        <div className="mr-5 text-xl">Before</div>
        <ImageComp
          firstSrc="/images/before-homepage.png"
          secondSrc="/images/after-homepage.png"
          width={420}
          // className="my-5 mx-3"
        />
        <div className="ml-5 text-xl"><span>After</span></div>
      </div>

      {/* ✨ New text below the image */}
      <p className="mt-4 text-center text-lg font-medium text-black">
        No more wondering, <br /> “Would I pull that off?”
      </p>

      {/* 🌈 Try it button goes to `/editor` when logged in */}
      <Link href={href}>
        <button
          className="mt-4 w-36 h-10 text-black text-lg rounded-full border border-black shadow-md transition-transform transform hover:scale-105 bg-[#8df6ddff]"
        >
          Try it Now
        </button>
      </Link>
    </div>
  );
}