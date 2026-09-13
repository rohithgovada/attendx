import React from "react";

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
  color = "#2563eb",
  bgColor = "#eff6ff",
  subtext,
  className = ""
}) => {
  const getTrendColor = () => {
    if (trendType === "positive") return "var(--success-text)";
    if (trendType === "negative") return "var(--danger-text)";
    return "var(--text-muted)";
  };

  return (
    <div
      className={`stat-card ${className}`}
      style={{ "--stat-accent": color }}
    >
      <div className="stat-card-info">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value}</span>
        {(trend || subtext) && (
          <div className="stat-card-trend" style={{ color: getTrendColor() }}>
            {trend && <span>{trend}</span>}
            {subtext && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{subtext}</span>}
          </div>
        )}
      </div>
      {Icon && (
        <div
          className="stat-card-icon"
          style={{ backgroundColor: bgColor, color: color }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
