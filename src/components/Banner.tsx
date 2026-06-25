import React from "react";

export const Banner: React.FC = () => {
  return (
    <div className="w-full bg-accent-coral text-white py-2 px-4 text-center text-[10px] sm:text-xs font-semibold tracking-widest uppercase select-none transition-colors duration-300 font-display">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span>✦ Get unlimited access to all of CANVES for less than $1/week ✦</span>
        <a
          href="#subscribe"
          className="underline hover:text-neutral-200 transition-colors ml-1 font-extrabold"
        >
          Subscribe Now
        </a>
      </div>
    </div>
  );
};
export default Banner;
