import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const Toast = ({
  message,
  type = "success",
  onClose,
  duration = 3500
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} style={{ color: "#10b981" }} />;
      case "error":
        return <AlertCircle size={18} style={{ color: "#ef4444" }} />;
      default:
        return <Info size={18} style={{ color: "#38bdf8" }} />;
    }
  };

  return (
    <div className="toast-container">
      <div className="toast">
        {getIcon()}
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{ color: "#94a3b8", marginLeft: "auto", padding: 2 }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
