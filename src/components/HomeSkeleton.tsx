import React from 'react';

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-3 pb-28 gap-4 animate-pulse select-none">
      {/* User Greeting & Stats Pill Skeleton */}
      <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDEFE6]"></div>
            <div className="flex flex-col gap-1.5">
              <div className="w-28 h-4 rounded-md bg-[#EDEFE6]"></div>
              <div className="w-36 h-3 rounded-md bg-[#EDEFE6]/80"></div>
            </div>
          </div>
          <div className="w-20 h-7 rounded-full bg-[#EDEFE6]"></div>
        </div>

        {/* Streak & Metric Bar Skeleton */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E6E9DE]">
          <div className="h-14 rounded-xl bg-[#EDEFE6]"></div>
          <div className="h-14 rounded-xl bg-[#EDEFE6]"></div>
          <div className="h-14 rounded-xl bg-[#EDEFE6]"></div>
        </div>
      </section>

      {/* Quote / Wisdom Teaser Skeleton */}
      <div className="h-16 rounded-2xl bg-[#EDEFE6] shadow-xs"></div>

      {/* Achievements Bar Skeleton */}
      <div className="h-14 rounded-2xl bg-[#EDEFE6] shadow-xs"></div>

      {/* Primary Action Card Skeleton */}
      <div className="h-32 rounded-3xl bg-[#EDEFE6] shadow-xs"></div>

      {/* Active Paths Section Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="w-32 h-4 rounded-md bg-[#EDEFE6]"></div>
          <div className="w-16 h-3 rounded-md bg-[#EDEFE6]"></div>
        </div>

        {/* Path Card 1 */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="w-24 h-4 rounded-full bg-[#EDEFE6]"></div>
            <div className="w-16 h-3 rounded-full bg-[#EDEFE6]"></div>
          </div>
          <div className="w-48 h-5 rounded-md bg-[#EDEFE6]"></div>
          <div className="w-full h-3 rounded-md bg-[#EDEFE6]"></div>
          <div className="w-full h-2 rounded-full bg-[#EDEFE6] mt-1"></div>
          <div className="h-10 rounded-xl bg-[#EDEFE6] mt-2"></div>
        </div>

        {/* Path Card 2 */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="w-20 h-4 rounded-full bg-[#EDEFE6]"></div>
            <div className="w-14 h-3 rounded-full bg-[#EDEFE6]"></div>
          </div>
          <div className="w-40 h-5 rounded-md bg-[#EDEFE6]"></div>
          <div className="w-3/4 h-3 rounded-md bg-[#EDEFE6]"></div>
          <div className="w-full h-2 rounded-full bg-[#EDEFE6] mt-1"></div>
        </div>
      </div>
    </div>
  );
};
