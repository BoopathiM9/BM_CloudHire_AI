import React from "react";

export default function AppIsDeadScreen({ error, onRetry, isChecking }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#090d0b",
        color: "#f8fafc",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px"
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          width: "100%",
          backgroundColor: "#111815",
          border: "2px solid #ef4444",
          borderRadius: "16px",
          padding: "36px 32px",
          boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.35)",
          textAlign: "center"
        }}
      >
        {/* Skull Icon Badge */}
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "2px solid #ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "30px"
          }}
        >
          💀
        </div>

        {/* Required Primary Heading */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "900",
            letterSpacing: "-0.03em",
            color: "#ef4444",
            margin: "0 0 10px",
            textTransform: "lowercase"
          }}
        >
          app is dead
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "#94a3b8",
            margin: "0 0 24px",
            lineHeight: 1.6
          }}
        >
          A backend exception was caught in the catch block. The silent fallback hack has been
          disabled — the application refuses to mask backend failures with offline mock data.
        </p>

        {/* Caught Exception Detail Box */}
        <div
          style={{
            backgroundColor: "#060908",
            border: "1px solid #332020",
            borderRadius: "10px",
            padding: "16px",
            textAlign: "left",
            marginBottom: "24px",
            fontFamily: "'JetBrains Mono', Consolas, monospace"
          }}
        >
          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#ef4444",
              fontWeight: 700,
              marginBottom: "8px"
            }}
          >
            CAUGHT EXCEPTION IN CATCH BLOCK:
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#fca5a5",
              wordBreak: "break-word",
              lineHeight: 1.5
            }}
          >
            {error || "Backend connection refused / network error caught in catch."}
          </div>
        </div>

        {/* Diagnostic Metadata */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "12px",
            color: "#64748b",
            textAlign: "left",
            marginBottom: "28px",
            padding: "14px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
        >
          <div>
            <strong style={{ color: "#cbd5e1" }}>Status:</strong> Fail-Fast Strict Mode (Zero Mock Fallback)
          </div>
          <div>
            <strong style={{ color: "#cbd5e1" }}>Endpoint Target:</strong>{" "}
            <code style={{ color: "#52BFA0" }}>
              https://6y44jbl350.execute-api.us-east-1.amazonaws.com
            </code>
          </div>
          <div>
            <strong style={{ color: "#cbd5e1" }}>Action:</strong> Verify AWS Lambda and API Gateway deployment.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onRetry}
            disabled={isChecking}
            style={{
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: isChecking ? "not-allowed" : "pointer",
              opacity: isChecking ? 0.7 : 1,
              transition: "background 0.2s"
            }}
          >
            {isChecking ? "Checking Backend..." : "Retry Connection"}
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "transparent",
              color: "#cbd5e1",
              border: "1px solid #334155",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
