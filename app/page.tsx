"use client"; // <-- Add this at the very top

import { useState } from "react";
import "@fontsource/lexend";
import Link from "next/link";

export default function Home() {
  const [sliderPos, setSliderPos] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPos(Number(e.target.value));
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center pt-15 text-black bg-[#8df6ddff]"
      style={{ fontFamily: "'Lexend', sans-serif", 
        backgroundColor: "#8df6ddff", // base color stays
        backgroundImage:
          "radial-gradient(#fef5fe 2px, transparent 2px), radial-gradient(#fef5fe 2px, transparent 2px)", // white dots
        backgroundSize: "80px 80px",
        backgroundPosition: "0 0, 40px 40px",
        backgroundBlendMode: "overlay", // makes sure base color shows through
      }}
    >
      <p className="text-[1.5rem]">Discover the New You</p>
      <p className="text-lg mt-5 text-black text-center">
        The possibilities are endless — AI reinvents your style, no scissors required.
      </p>

      <div className="relative mt-10 w-80 h-80 md:w-[500px] md:h-[400px] overflow-hidden shadow-lg bg-[#152f40ff]">
        {/* AFTER IMAGE (bottom layer) */}
        <img
          src="/images/after-homepage.png"
          alt="After"
          className="absolute top-0 left-0 w-full h-full object-contain"
        />
        {/* BEFORE IMAGE (top layer) */}
        <img
          src="/images/before-homepage.png"
          alt="Before"
          className="absolute top-0 left-0 h-full object-contain"
          style={{ width: `${100 - sliderPos}%` }}
        />

        {/* Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={handleSliderChange}
          className="absolute bottom-2 left-0 w-full appearance-none h-1 rounded-lg cursor-pointer"
          style={{
            background: "linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)", // blue → purple → pink
          }}
        />

        {/* Custom slider thumb for Chrome */}
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 15px;
            width: 15px;
            background: white;
            border-radius: 0;
            cursor: pointer;
            margin-top: -7px; /* adjust to center on track */
            transform: rotate(45deg); /* diamond shape */
          }
        `}</style>
      </div>

      <div className="flex justify-between w-80 md:w-[500px] mt-2 text-sm font-bold text-black">
        <span>Before</span>
        <span>After</span>
      </div>

      {/* ✨ New text below the image */}
      <p className="mt-5 text-center text-lg font-medium text-black">
        No more wondering, <br /> “Would I pull that off?”
      </p>

      {/* 🌈 Try it Now button */}
      <Link href="/try_it_now">
        <button
          className="mt-4 w-36 h-10 text-black text-lg rounded-full border-1 border-black shadow-md transition-transform transform hover:scale-105"
          style={{
            background: "#8df6ddff",
          }}
        >
          Try it Now
        </button>
      </Link>

    </div>
  );
}