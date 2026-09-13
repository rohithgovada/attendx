import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  FileText,
  CalendarCheck,
  X,
  ExternalLink,
  Volume2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Gentle dual-tone Web Audio notification chime
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    // Note 1 (E5: 659.25Hz) -> Note 2 (A5: 880Hz)
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.setValueAtTime(880, now + 0.1);

    osc2.frequency.setValueAtTime(659.25 / 2, now);
    osc2.frequency.setValueAtTime(880 / 2, now + 0.1);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.46);
    osc2.stop(now + 0.46);
  } catch {
    // Audio autoplay restrictions may ignore without user click
  }
};

export const GlobalNotificationBanner = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [activeNotif, setActiveNotif] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleNewNotification = (e) => {
      const notif = e.detail;
      if (!notif) return;

      // Only display to matching target role or 'all'
      const isTarget =
        !notif.targetRole ||
        notif.targetRole === "all" ||
        notif.targetRole === role;

      if (!isTarget) return;

      if (timerRef.current) clearTimeout(timerRef.current);

      setActiveNotif(notif);
      setVisible(true);
      playChime();

      // Auto dismiss after 6.5s
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 6500);
    };

    window.addEventListener("attendx_new_notification", handleNewNotification);
    return () => {
      window.removeEventListener("attendx_new_notification", handleNewNotification);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [role]);

  if (!visible || !activeNotif) return null;

  const getCategoryTheme = () => {
    switch (activeNotif.category) {
      case "Warning":
        return {
          border: "#ef4444",
          bg: "#fef2f2",
          badgeBg: "#fee2e2",
          badgeColor: "#991b1b",
          icon: <AlertTriangle size={20} color="#ef4444" />
        };
      case "Leave":
        return {
          border: "#10b981",
          bg: "#ecfdf5",
          badgeBg: "#d1fae5",
          badgeColor: "#065f46",
          icon: <CalendarCheck size={20} color="#10b981" />
        };
      case "Academic":
        return {
          border: "#8b5cf6",
          bg: "#f5f3ff",
          badgeBg: "#ede9fe",
          badgeColor: "#5b21b6",
          icon: <FileText size={20} color="#8b5cf6" />
        };
      default:
        return {
          border: "#2563eb",
          bg: "#eff6ff",
          badgeBg: "#dbeafe",
          badgeColor: "#1e40af",
          icon: <Bell size={20} color="#2563eb" />
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 99999,
        maxWidth: 420,
        width: "calc(100vw - 48px)",
        background: "#ffffff",
        borderRadius: "14px",
        boxShadow: "0 20px 30px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -4px rgba(0, 0, 0, 0.08)",
        border: "1px solid var(--border-color)",
        borderLeft: `6px solid ${theme.border}`,
        overflow: "hidden",
        animation: "slideInNotification 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "var(--font-sans, inherit)"
      }}
    >
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Icon Badge */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: theme.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            {theme.icon}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  background: theme.badgeBg,
                  color: theme.badgeColor,
                  letterSpacing: "0.03em"
                }}
              >
                {activeNotif.category || "Notice"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                {activeNotif.timestamp || "Just now"}
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "#94a3b8",
                  background: "#f1f5f9",
                  padding: "1px 6px",
                  borderRadius: 4
                }}
              >
                Audience: {activeNotif.targetRole === "all" ? "Everyone" : activeNotif.targetRole}
              </span>
            </div>

            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 4px 0",
                lineHeight: 1.3
              }}
            >
              {activeNotif.title}
            </h4>

            <p
              style={{
                fontSize: "0.82rem",
                color: "#475569",
                margin: "0 0 10px 0",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {activeNotif.message}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => {
                  setVisible(false);
                  navigate("/notifications");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#2563eb",
                  background: "#eff6ff",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "1px solid #bfdbfe",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <span>View in Notifications</span>
                <ExternalLink size={13} />
              </button>

              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                From: {activeNotif.sender || "Campus ERP"}
              </span>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setVisible(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "#94a3b8",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
            title="Dismiss notification"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Subtle bottom animated duration bar */}
      <div
        style={{
          height: 3,
          background: theme.border,
          width: "100%",
          animation: "notifCountdown 6.5s linear forwards"
        }}
      />
    </div>
  );
};
