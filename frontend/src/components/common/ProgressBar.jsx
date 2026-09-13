import React from "react";

export const ProgressBar = ({
  value = 0,
  showLabel = true,
  showThreshold = true,
  height = 8,
  className = ""
}) => {
  const percentage = Math.min(100, Math.max(0, Number(value)));

  let colorClass = "fill-good";
  if (percentage < 65) {
    colorClass = "fill-critical";
  } else if (percentage < 75) {
    colorClass = "fill-warning";
  }

  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div className="progress-header">
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Attendance Rate
          </span>
          <span style={{ fontWeight: 700, color: percentage < 75 ? "#ef4444" : "#10b981" }}>
            {percentage}%
          </span>
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        {showThreshold && (
          <div
            className="progress-threshold-line"
            title="University 75% Minimum Mandatory Requirement"
          />
        )}
        <div
          className={`progress-fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
