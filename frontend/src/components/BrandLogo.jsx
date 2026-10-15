import React from "react";

export default function BrandLogo({ size = "default", className = "", showTagline = true, light = false }) {
  const isSmall = size === "small";
  const iconSize = isSmall ? 32 : 38;

  return (
    <div className={`brand-logo-container ${className} ${light ? "light-mode" : ""}`}>
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
          {/* Rounded square container with Forest Green brand background */}
          <rect width="48" height="48" rx="10" fill="#173C35" stroke="#52BFA0" strokeWidth="1.5" />
          
          {/* Mint green cloud connector accent */}
          <path
            d="M34 27C34 24.2 31.8 22 29 22C28.7 22 28.4 22.03 28.1 22.08C27.1 19 24.3 17 21 17C17.1 17 14 20.1 14 24C14 24.4 14.04 24.8 14.1 25.2C12.1 25.9 10.7 27.8 10.7 30C10.7 32.8 13 35 15.8 35H32.2C35 35 37.3 32.8 37.3 30C37.3 28.2 36.4 26.7 35 25.8"
            stroke="#52BFA0"
            strokeOpacity="0.4"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* BM Typography Monogram */}
          <text
            x="24"
            y="31"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="800"
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            letterSpacing="-0.5"
          >
            BM
          </text>
        </svg>
      </div>

      <div className="brand-text-block">
        <div className="brand-primary-name">
          <span className="brand-highlight" style={{ color: "#52BFA0" }}>BM</span> CloudHire
        </div>
        {showTagline && (
          <div className="brand-tagline">Intelligent Recruitment. Better Decisions.</div>
        )}
      </div>
    </div>
  );
}
