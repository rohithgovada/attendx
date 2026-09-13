import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  BarChart3,
  Bell,
  User,
  LogOut,
  GraduationCap,
  X
} from "lucide-react";
import { Badge } from "../common/Badge";

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const list = await api.getNotifications(role, user?.id);
      const unread = list.filter(n => !n.read && !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // fallback
    }
  }, [role, user]);

  useEffect(() => {
    fetchUnread();
    const handleUpdate = () => fetchUnread();
    window.addEventListener("attendx_notifications_updated", handleUpdate);
    window.addEventListener("attendx_new_notification", handleUpdate);
    return () => {
      window.removeEventListener("attendx_notifications_updated", handleUpdate);
      window.removeEventListener("attendx_new_notification", handleUpdate);
    };
  }, [fetchUnread]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Define navigation configuration by role
  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
          { label: "My Attendance", path: "/student/attendance", icon: CalendarCheck },
          { label: "Reports & Stats", path: "/reports", icon: BarChart3 },
          { label: "Notifications", path: "/notifications", icon: Bell },
          { label: "My Profile", path: "/profile", icon: User }
        ];
      case "faculty":
        return [
          { label: "Dashboard", path: "/faculty/dashboard", icon: LayoutDashboard },
          { label: "Mark Attendance", path: "/faculty/mark-attendance", icon: ClipboardList },
          { label: "Class Reports", path: "/reports", icon: BarChart3 },
          { label: "Notifications", path: "/notifications", icon: Bell },
          { label: "Faculty Profile", path: "/profile", icon: User }
        ];
      case "principal":
        return [
          { label: "Overview Dashboard", path: "/principal/dashboard", icon: LayoutDashboard },
          { label: "Institution Reports", path: "/reports", icon: BarChart3 },
          { label: "Notices & Circulars", path: "/notifications", icon: Bell },
          { label: "Admin Profile", path: "/profile", icon: User }
        ];
      case "parent":
        return [
          { label: "Ward Dashboard", path: "/parent/dashboard", icon: LayoutDashboard },
          { label: "Detailed Attendance", path: "/student/attendance", icon: CalendarCheck },
          { label: "Attendance Reports", path: "/reports", icon: BarChart3 },
          { label: "Notifications", path: "/notifications", icon: Bell },
          { label: "Guardian Profile", path: "/profile", icon: User }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div className="brand-text">
            <h1>AttendX</h1>
            <span>Campus ERP</span>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          style={{ color: "#94a3b8", display: "none" }}
          className="mobile-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav">
        <div className="nav-section-title">Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {item.path === "/notifications" && unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 9999,
                    boxShadow: "0 1px 3px rgba(239, 68, 68, 0.4)"
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer with User info & Logout */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user-card">
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
            />
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {user.name}
              </p>
              <div style={{ display: "flex", marginTop: 2 }}>
                <Badge variant={role} style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                  {role}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          style={{ width: "100%", justifyContent: "flex-start", color: "#f87171", borderColor: "#334155" }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
