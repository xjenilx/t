import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-7">
        <svg viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Main Purple Head */}
          <path
            d="M0 14C0 6.26801 6.26801 0 14 0H26C33.732 0 40 6.26801 40 14V20C40 24.4183 36.4183 28 32 28H14C6.26801 28 0 21.732 0 14Z"
            fill="#5850EC"
          />
          {/* Light Blue Face Plate */}
          <rect x="5" y="5" width="30" height="18" rx="9" fill="#A5B4FC" />
          {/* Black Eyes */}
          <circle cx="14" cy="14" r="3" fill="black" />
          <circle cx="26" cy="14" r="3" fill="black" />
        </svg>
      </div>
      <div className="flex items-center font-black text-2xl tracking-tighter">
        <span className="text-white">MAKE</span>
        <span className="text-[#6366F1] ml-1">UGCAD</span>
      </div>
    </div>
  );
};
