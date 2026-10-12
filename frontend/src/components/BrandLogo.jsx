import React from "react";

export default function BrandLogo({ size = "default", className = "" }) {
  const isSmall = size === "small";
  const iconSize = isSmall ? 32 : 40;

  return (
    <div className={`brand-logo-container ${className}`}>
      <div 
        className="brand-logo-mark"
        style={{ width: iconSize, height: iconSize }}
        title="BM CloudHire AI"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="brand-logo-svg"
        >
          {/* Base rounded square with subtle depth */}
          <rect width="48" height="48" rx="12" fill="url(#brandGrad)" />
          
          {/* Subtle geometric cloud contour */}
          <path
            d="M36 26C36 22.6863 33.3137 20 30 20C29.6234 20 29.2559 20.0346 28.8995 20.1013C27.7533 16.4891 24.3739 14 20.5 14C15.8056 14 12 17.8056 12 22.5C12 23.0179 12.0461 23.5249 12.1347 24.0182C9.77353 24.8117 8 27.2091 8 30C8 33.3137 10.6863 36 14 36H34C37.3137 36 40 33.3137 40 30C40 27.9157 38.9378 26.0798 37.3197 25.0116"
            stroke="white"
            strokeOpacity="0.18"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Connected AI Sparkle nodes */}
          <circle cx="36" cy="14" r="2.5" fill="#60a5fa" />
          <path d="M36 9V12M36 16V19M31 14H34M38 14H41" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />

          {/* BM Monogram Typography */}
          <text
            x="24"
            y="31"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="900"
            fontFamily="'Inter', -apple-system, sans-serif"
            letterSpacing="-0.5"
          >
            BM
          </text>

          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0f172a" />
              <stop offset="0.6" stopColor="#1e3a8a" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="brand-text-block">
        <div className="brand-primary-name">
          <span className="brand-highlight">BM</span> CloudHire <span className="brand-ai-badge">AI</span>
        </div>
        <div className="brand-tagline">Intelligent Recruitment. Better Decisions.</div>
      </div>
    </div>
  );
}
