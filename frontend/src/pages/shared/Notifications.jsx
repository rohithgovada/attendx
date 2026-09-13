import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Toast } from "../../components/common/Toast";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  FileText,
  Send,
  Plus,
  CalendarCheck,
  Sparkles
} from "lucide-react";

export const Notifications = () => {
  const { user, role } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Modal for creating notification (for principal/faculty)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Circular");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");

  const loadNotifications = useCallback(async () => {
    try {
      const list = await api.getNotifications(role, user?.id);
      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener("attendx_notifications_updated", handleUpdate);
    window.addEventListener("attendx_new_notification", handleUpdate);
    return () => {
      window.removeEventListener("attendx_notifications_updated", handleUpdate);
      window.removeEventListener("attendx_new_notification", handleUpdate);
    };
  }, [loadNotifications]);

  const handleSimulate = async (type) => {
    if (type === "warning") {
      await api.createNotification({
        title: "⚠️ Urgent Attendance Shortage: CS601 Distributed Systems",
        message: "Your current attendance in CS601 is 68.0% (requires minimum 75%). Please submit a condonation application or meet your Class In-Charge Dr. Sarah Jenkins immediately.",
        category: "Warning",
        targetRole: "student",
        priority: "high",
        sender: "Dean of Academics"
      });
      setToastMessage("Live absence shortage alert dispatched to Student!");
    } else if (type === "leave") {
      await api.createNotification({
        title: "📝 Short Absence Application: Alex Morgan (CS2024-042)",
        message: "Alex Morgan has submitted a 2-day Medical Leave request (Sept 15 - Sept 16) for your section approval.",
        category: "Leave",
        targetRole: "faculty",
        priority: "medium",
        sender: "Student Leave Portal"
      });
      setToastMessage("Live leave application notification dispatched to Faculty In-Charge!");
    } else if (type === "circular") {
      await api.createNotification({
        title: "📢 National College Tech Symposium & Hackathon 2026",
        message: "Official Announcement: Annual Inter-College Hackathon registrations are open. All participants receive verified academic attendance credits.",
        category: "Circular",
        targetRole: "all",
        priority: "medium",
        sender: "Office of the Principal"
      });
      setToastMessage("College-wide circular notification dispatched to everyone!");
    }
  };

  const handleMarkAsRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setToastMessage("All notifications marked as read.");
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    await api.createNotification({
      title,
      message,
      category,
      targetRole,
      sender: user?.name || "Administration"
    });

    setCreateModalOpen(false);
    setTitle("");
    setMessage("");
    setToastMessage("New notification published and distributed!");
    loadNotifications();
  };

  const categories = [
    { label: "All Notifications", value: "all" },
    { label: "Attendance Warnings", value: "Warning" },
    { label: "College Circulars", value: "Circular" },
    { label: "Academic Notices", value: "Academic" },
    { label: "Leave Notices", value: "Leave" }
  ];

  const filteredNotifs = notifications.filter((n) => {
    const categoryMatch = selectedCategory === "all" || n.category === selectedCategory;
    const unreadMatch = !unreadOnly || !n.read;
    return categoryMatch && unreadMatch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading notification feed...
      </div>
    );
  }

  return (
    <div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Communications & Alerts
            </h1>
            {unreadCount > 0 ? (
              <Badge variant="danger">{unreadCount} Unread</Badge>
            ) : (
              <Badge variant="good">All Caught Up</Badge>
            )}
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Institutional circulars, attendance warnings, exam bulletins, and faculty directives
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn btn-outline"
              style={{ gap: 6 }}
            >
              <CheckCheck size={16} />
              <span>Mark All Read</span>
            </button>
          )}

          {(role === "principal" || role === "faculty") && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn btn-primary"
              style={{ gap: 6 }}
            >
              <Plus size={16} />
              <span>Publish Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Notification Simulator & Verification Station */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #bfdbfe",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          boxShadow: "0 4px 12px -2px rgba(37, 99, 235, 0.08)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              flexShrink: 0
            }}
          >
            <Bell size={22} className="bell-ring-active" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                Live Notification Engine Station
              </h3>
              <Badge variant="student" style={{ fontSize: "0.7rem" }}>Active & Real-Time</Badge>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
              Test instant push alerts, dual-tone audio chime, top-right animated banners, and navbar counter in 1 click:
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            onClick={() => handleSimulate("warning")}
            className="btn btn-outline btn-sm"
            style={{ borderColor: "#fecaca", color: "#b91c1c", background: "#fef2f2", gap: 6, fontWeight: 600 }}
            title="Trigger instant student absence shortage notice"
          >
            <AlertTriangle size={14} />
            <span>Test Absence Alert</span>
          </button>
          <button
            onClick={() => handleSimulate("leave")}
            className="btn btn-outline btn-sm"
            style={{ borderColor: "#a7f3d0", color: "#065f46", background: "#ecfdf5", gap: 6, fontWeight: 600 }}
            title="Trigger instant faculty leave application notice"
          >
            <CalendarCheck size={14} />
            <span>Test Leave Request</span>
          </button>
          <button
            onClick={() => handleSimulate("circular")}
            className="btn btn-outline btn-sm"
            style={{ borderColor: "#bfdbfe", color: "#1d4ed8", background: "#eff6ff", gap: 6, fontWeight: 600 }}
            title="Trigger instant college circular notice"
          >
            <Send size={14} />
            <span>Test College Circular</span>
          </button>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "12px 18px",
          marginBottom: 20
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: 600,
                border: "1px solid",
                borderColor: selectedCategory === cat.value ? "var(--primary)" : "var(--border-color)",
                background: selectedCategory === cat.value ? "var(--primary-light)" : "transparent",
                color: selectedCategory === cat.value ? "var(--primary)" : "var(--text-muted)",
                transition: "all 0.15s ease"
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            id="unreadFilter"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            style={{ accentColor: "var(--primary)" }}
          />
          <label htmlFor="unreadFilter" style={{ fontSize: "0.85rem", color: "var(--text-muted)", cursor: "pointer" }}>
            Unread only
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredNotifs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
            <Bell size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No notifications match the selected filter.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const isWarning = notif.category === "Warning";
            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                style={{
                  background: notif.read ? "#ffffff" : "var(--primary-light)",
                  border: "1px solid",
                  borderColor: notif.read ? "var(--border-color)" : "var(--primary-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 24px",
                  boxShadow: notif.read ? "var(--shadow-sm)" : "var(--shadow-md)",
                  transition: "all 0.2s ease",
                  cursor: notif.read ? "default" : "pointer",
                  position: "relative"
                }}
              >
                {!notif.read && (
                  <span
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444"
                    }}
                    title="Unread"
                  />
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-md)",
                      background: isWarning ? "#fef2f2" : "#eff6ff",
                      color: isWarning ? "#ef4444" : "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {isWarning ? <AlertTriangle size={22} /> : <FileText size={22} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                        {notif.title}
                      </h3>
                      <Badge variant={isWarning ? "danger" : "primary"}>
                        {notif.category}
                      </Badge>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        • {notif.timestamp} ({notif.date})
                      </span>
                    </div>

                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
                      {notif.message}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-subtle)", borderTop: "1px solid var(--border-light)", paddingTop: 10 }}>
                      <span>Issued by: <strong style={{ color: "var(--text-muted)" }}>{notif.sender}</strong></span>
                      {!notif.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                          style={{ color: "var(--primary)", fontWeight: 600 }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Official Notice or Circular"
      >
        <form onSubmit={handleCreateNotice}>
          <div className="form-group">
            <label className="form-label">Notice Title</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Schedule for Special Attendance Removals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Circular">College Circular</option>
                <option value="Warning">Attendance Warning</option>
                <option value="Academic">Academic Schedule</option>
                <option value="Leave">Leave Update</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                className="form-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="all">Everyone (All Roles)</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
                <option value="parent">Parents Only</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Notice Text</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Enter message details, policies, and instructions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: 6 }}>
              <Send size={15} />
              <span>Publish Notice</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
