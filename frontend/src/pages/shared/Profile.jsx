import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { Toast } from "../../components/common/Toast";
import {
  User,
  Shield,
  KeyRound,
  Save,
  Sparkles
} from "lucide-react";

export const Profile = () => {
  const { user, role, updateUser } = useAuth();

  // Contact Info state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "+1 (555) 234-5678");
  const [address, setAddress] = useState("44 Campus Walk, University Enclave, West Wing");

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const handleUpdateContact = (e) => {
    e.preventDefault();
    updateUser({ name, email, phone, address });
    setToastMessage("Profile and contact information saved successfully!");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setToastMessage("Account password updated successfully!");
  };

  return (
    <div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          User Profile & Account Settings
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 2 }}>
          Manage your personal information, institutional affiliation, and security preferences
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        {/* Left Column: Profile Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 16px" }}>
              <img
                src={user?.avatar}
                alt={user?.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid var(--primary-light)",
                  boxShadow: "var(--shadow-md)"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  border: "3px solid #fff"
                }}
                title="Active Account"
              />
            </div>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)" }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12 }}>
              {user?.email}
            </p>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <Badge variant={role} style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
                {role?.toUpperCase()} ACCOUNT
              </Badge>
            </div>

            {/* Role specific quick stats */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, textAlign: "left", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: 10 }}>
              {role === "student" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Roll Number:</span>
                    <strong>{user?.rollNo}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Department:</span>
                    <strong>{user?.department}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Class Advisor:</span>
                    <strong>{user?.advisor}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Term Attendance:</span>
                    <strong style={{ color: "#10b981" }}>{user?.attendanceRate}%</strong>
                  </div>
                </>
              )}

              {role === "faculty" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Employee ID:</span>
                    <strong>{user?.employeeId}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Department:</span>
                    <strong>{user?.department}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Office Cabin:</span>
                    <strong>{user?.cabin}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Conducted:</span>
                    <strong>{user?.totalClassesConducted} Lectures</strong>
                  </div>
                </>
              )}

              {role === "principal" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Employee ID:</span>
                    <strong>{user?.employeeId}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Office Suite:</span>
                    <strong>{user?.office}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Institution:</span>
                    <strong>{user?.institution}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Rating:</span>
                    <strong style={{ color: "var(--primary)" }}>{user?.accreditation}</strong>
                  </div>
                </>
              )}

              {role === "parent" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Relation:</span>
                    <strong>{user?.relation}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Linked Ward:</span>
                    <strong>{user?.wardName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Ward Roll No:</span>
                    <strong>{user?.wardRollNo}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Ward Program:</span>
                    <strong>{user?.wardDepartment}</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card" style={{ background: "var(--primary-light)", border: "1px solid var(--primary-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "var(--primary)" }}>
              <Sparkles size={18} />
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>AttendX Single Sign-On</h3>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--primary-dark)", lineHeight: 1.5 }}>
              Your profile is verified through St. Jude Institute's Central Identity Directory. For changes to official academic records or names, contact the Registrar's Desk.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Personal & Contact Information Form */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <User size={18} color="var(--primary)" />
                  <span>Contact & Communication Details</span>
                </h3>
                <p className="card-subtitle">Keep your phone and address up-to-date for attendance alerts</p>
              </div>
            </div>

            <form onSubmit={handleUpdateContact}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Mobile Phone (SMS Notifications)</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ gap: 6 }}>
                  <Save size={16} />
                  <span>Save Contact Details</span>
                </button>
              </div>
            </form>
          </div>

          {/* Account Security & Password */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <KeyRound size={18} color="var(--primary)" />
                  <span>Security & Authentication</span>
                </h3>
                <p className="card-subtitle">Update your password to safeguard your attendance account</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password (demo: password123)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button type="submit" className="btn btn-outline" style={{ gap: 6 }}>
                  <Shield size={16} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
