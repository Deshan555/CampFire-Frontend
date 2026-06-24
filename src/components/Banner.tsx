import React from "react";

export const Banner: React.FC = () => {
  return (
    <div className="w-full bg-accent-purple dark:bg-purple-900/50 text-neutral-900 dark:text-neutral-100 py-1.5 px-4 text-center text-[10px] sm:text-xs font-semibold tracking-wider uppercase select-none border-b-[0.5px] border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span>✦ Get unlimited access to all of Camp Fire for less than $1/week ✦</span>
        <a
          href="#subscribe"
          className="underline hover:text-neutral-700 dark:hover:text-purple-300 transition-colors ml-1 font-bold"
        >
          Subscribe Now
        </a>
      </div>
    </div>
  );
};
export default Banner;
