import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Sparkles
} from "lucide-react";
import { Badge } from "../common/Badge";
import { api } from "../../services/api";
import { NOTIFICATIONS_DATA } from "../../mockData/notifications";

export const Navbar = ({ setMobileOpen }) => {
  const { user, role, loginAs, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleChange = (newRole) => {
    loginAs(newRole);
    // Navigate to respective dashboard
    if (newRole === "student") navigate("/student/dashboard");
    else if (newRole === "faculty") navigate("/faculty/dashboard");
    else if (newRole === "principal") navigate("/principal/dashboard");
    else if (newRole === "parent") navigate("/parent/dashboard");
  };

  const [notificationsList, setNotificationsList] = useState([]);
  const [isRinging, setIsRinging] = useState(false);

  const fetchNavNotifs = useCallback(async () => {
    try {
      const list = await api.getNotifications(role, user?.id);
      setNotificationsList(list);
    } catch {
      // fallback
    }
  }, [role, user]);

  useEffect(() => {
    fetchNavNotifs();

    const handleUpdate = () => {
      fetchNavNotifs();
    };

    const handleNew = (e) => {
      fetchNavNotifs();
      const notif = e.detail;
      if (!notif || notif.targetRole === "all" || notif.targetRole === role) {
        setIsRinging(true);
        setTimeout(() => setIsRinging(false), 2000);
      }
    };

    window.addEventListener("attendx_notifications_updated", handleUpdate);
    window.addEventListener("attendx_new_notification", handleNew);
    return () => {
      window.removeEventListener("attendx_notifications_updated", handleUpdate);
      window.removeEventListener("attendx_new_notification", handleNew);
    };
  }, [fetchNavNotifs, role]);

  const notifications = notificationsList.length > 0 ? notificationsList.slice(0, 5) : [];
  const unreadCount = notificationsList.filter(n => !n.read && !n.is_read).length;

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await api.markAllNotificationsRead(role);
  };

  return (
    <header className="navbar">
      {/* Left side: Hamburger & Search */}
      <div className="navbar-left">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="btn btn-outline btn-sm"
          style={{ padding: 8, display: "flex" }}
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div className="navbar-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search students, subjects, classes..."
          />
        </div>
      </div>

      {/* Right side: Role Switcher, Notifications, User Profile */}
      <div className="navbar-right">
        {/* Quick Role Switcher */}
        <div className="role-switcher-banner">
          <Sparkles size={14} color="var(--primary)" />
          <span style={{ fontWeight: 500 }}>Active Role:</span>
          <select
            className="role-switcher-select"
            value={role || "student"}
            onChange={(e) => handleRoleChange(e.target.value)}
            title="Switch demo persona"
          >
            <option value="student">Student (Alex)</option>
            <option value="faculty">Faculty (Dr. Sarah)</option>
            <option value="principal">Principal (Dr. Vance)</option>
            <option value="parent">Parent (Mr. David)</option>
          </select>
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="btn btn-outline btn-sm"
            style={{
              padding: 8,
              position: "relative",
              borderRadius: "50%",
              width: 38,
              height: 38
            }}
            title="Notifications"
          >
            <Bell size={18} className={isRinging ? "bell-ring-active" : ""} />
            {unreadCount > 0 && (
              <span className="notif-pulse-dot" title={`${unreadCount} unread alerts`}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: "absolute",
                top: "120%",
                right: 0,
                width: 360,
                background: "#ffffff",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                border: "1px solid var(--border-color)",
                zIndex: 100,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--bg-main)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Notifications</span>
                  {unreadCount > 0 ? (
                    <Badge variant="danger" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                      {unreadCount} new
                    </Badge>
                  ) : (
                    <Badge variant="good" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                      All read
                    </Badge>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}
                      title="Mark all as read"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/notifications");
                    }}
                    style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}
                  >
                    View All
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No notifications for your profile.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.read && !n.is_read;
                    return (
                      <div
                        key={n.id}
                        onClick={async () => {
                          await api.markNotificationRead(n.id);
                          setNotifOpen(false);
                          navigate("/notifications");
                        }}
                        style={{
                          padding: "12px 18px",
                          borderBottom: "1px solid var(--border-light)",
                          background: isUnread ? "#f0f7ff" : "#fff",
                          cursor: "pointer",
                          transition: "background 0.15s",
                          position: "relative"
                        }}
                      >
                        {isUnread && (
                          <div
                            style={{
                              position: "absolute",
                              left: 6,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--primary)"
                            }}
                          />
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: isUnread ? 700 : 600, color: "var(--text-main)" }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: 6 }}>
                            {n.timestamp || "Recent"}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
                          {n.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        {user && (
          <div style={{ position: "relative" }} ref={profileRef}>
            <div
              className="navbar-user-chip"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.1 }}>
                  {user.name}
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                  {role}
                </span>
              </div>
              <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
            </div>

            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "120%",
                  right: 0,
                  width: 210,
                  background: "#ffffff",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--border-color)",
                  zIndex: 100,
                  padding: "8px 0"
                }}
              >
                <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-light)" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>{user.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 16px",
                    fontSize: "0.85rem",
                    color: "var(--text-main)",
                    textAlign: "left"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 16px",
                    fontSize: "0.85rem",
                    color: "#ef4444",
                    textAlign: "left"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
