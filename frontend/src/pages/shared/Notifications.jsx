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
  Plus
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
  }, [loadNotifications]);

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
