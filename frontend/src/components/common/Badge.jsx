import React from "react";

export const Badge = ({ children, variant = "primary", className = "", style = {} }) => {
  // Normalize variant names safely without ever throwing on null/undefined
  const safeVariant = (variant ? String(variant) : "primary").toLowerCase();
  const getVariantClass = () => {
    switch (safeVariant) {
      case "present":
      case "good":
      case "excellent":
      case "success":
        return "badge-good";
      case "absent":
      case "critical":
      case "danger":
        return "badge-danger";
      case "late":
      case "warning":
        return "badge-warning";
      case "student":
      case "faculty":
      case "principal":
      case "parent":
      case "primary":
        return "badge-primary";
      default:
        return "badge-neutral";
    }
  };

  return (
    <span className={`badge ${getVariantClass()} ${className}`} style={style}>
      {children}
    </span>
  );
};
