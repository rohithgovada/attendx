import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { ProgressBar } from "../../components/common/ProgressBar";
import { Modal } from "../../components/common/Modal";
import { Toast } from "../../components/common/Toast";
import {
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

export const ParentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getParentDashboardData(user?.id);
        setData(res);
      } catch (err) {
        console.error("Failed to load parent dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setInquiryModalOpen(false);
    setInquirySubject("");
    setInquiryMessage("");
    setToastMessage("Inquiry submitted to Class Advisor Dr. Sarah Jenkins. You will receive an update shortly.");
  };

  if (loading || !data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading parent monitoring portal...
      </div>
    );
  }

  const { ward, overallRate, subjects, todaySchedule, criticalSubjects, facultyAdvisor } = data;

  return (
    <div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Parent Portal: Monitoring {ward.name}
            </h1>
            <Badge variant="good">Verified Guardian</Badge>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Guardian: <strong>{user?.name}</strong> • Ward Roll No: <strong>{ward.rollNo}</strong> • {ward.department}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setInquiryModalOpen(true)}
            className="btn btn-outline"
            style={{ gap: 8 }}
          >
            <MessageSquare size={16} />
            <span>Contact Class Advisor</span>
          </button>
          <Link to="/student/attendance" className="btn btn-primary" style={{ gap: 8 }}>
            <Calendar size={16} />
            <span>Detailed Attendance Sheet</span>
          </Link>
        </div>
      </div>

      {/* Shortage Warning Notice if critical subjects exist */}
      {criticalSubjects.length > 0 && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AlertTriangle size={24} color="#d97706" />
            <div>
              <p style={{ fontSize: "0.92rem", fontWeight: 700 }}>
                Parent Advisory: Subject Shortage Detected
              </p>
              <p style={{ fontSize: "0.82rem", marginTop: 2 }}>
                {ward.name}'s attendance in {criticalSubjects.map(s => s.name).join(" & ")} is currently below the 75% minimum required for semester examinations.
              </p>
            </div>
          </div>
          <button
            onClick={() => setInquiryModalOpen(true)}
            className="btn btn-sm"
            style={{ background: "#d97706", color: "#fff" }}
          >
            Inquire Now
          </button>
        </div>
      )}

      {/* Top 4 KPI Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Ward's Overall Attendance"
          value={`${overallRate}%`}
          icon={TrendingUp}
          color="#2563eb"
          bgColor="#eff6ff"
          trend="Overall Good Standing"
          trendType="positive"
          subtext="• Threshold: 75% Min"
        />
        <StatCard
          title="Classes Attended"
          value="148 / 182"
          icon={CheckCircle2}
          color="#10b981"
          bgColor="#ecfdf5"
          trend="148 hours logged"
          trendType="positive"
        />
        <StatCard
          title="Classes Missed"
          value="34 Hours"
          icon={Clock}
          color="#f59e0b"
          bgColor="#fffbeb"
          trend="8 Excused (Medical)"
          trendType="neutral"
        />
        <StatCard
          title="Current Exam Eligibility"
          value="Eligible"
          icon={ShieldCheck}
          color="#10b981"
          bgColor="#ecfdf5"
          trend="Overall >= 75%"
          trendType="positive"
        />
      </div>

      {/* Two Column Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Ward's Subject Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <GraduationCap size={18} color="var(--primary)" />
                <span>Subject Attendance Breakdown</span>
              </h2>
              <p className="card-subtitle">Real-time attendance status in each 6th semester course</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {subjects.map((sub) => (
              <div key={sub.code}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{sub.name}</span>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Faculty: {sub.faculty} • {sub.attended}/{sub.conducted} classes
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: sub.percentage < 75 ? "#ef4444" : "#10b981"
                      }}
                    >
                      {sub.percentage}%
                    </span>
                    <p style={{ fontSize: "0.72rem", color: sub.percentage < 75 ? "#ef4444" : "var(--text-muted)" }}>
                      {sub.percentage < 75 ? "Needs attendance" : "Safe"}
                    </p>
                  </div>
                </div>
                <ProgressBar
                  value={sub.percentage}
                  showLabel={false}
                  showThreshold={true}
                  height={8}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Faculty Advisor & Today's Attendance Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Class In-Charge / Advisor Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Class In-Charge Advisor</h3>
                <p className="card-subtitle">Official faculty mentor assigned to your ward</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                alt="Faculty Advisor"
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>{facultyAdvisor.name}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{facultyAdvisor.designation}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>{facultyAdvisor.officeHours}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
                <Phone size={15} color="var(--primary)" />
                <span>{facultyAdvisor.phone}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
                <Mail size={15} color="var(--primary)" />
                <span>{facultyAdvisor.email}</span>
              </div>
            </div>

            <button
              onClick={() => setInquiryModalOpen(true)}
              className="btn btn-outline btn-sm"
              style={{ width: "100%", marginTop: 16, gap: 6 }}
            >
              <MessageSquare size={14} />
              <span>Leave Message for Advisor</span>
            </button>
          </div>

          {/* Today's Classes Verification */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Today's Class Presence</h3>
                <p className="card-subtitle">Saturday, Sept 13 • Gate & Class Logs</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {todaySchedule.slice(0, 3).map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "var(--bg-main)",
                    borderRadius: 8
                  }}
                >
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>{slot.subjectCode}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{slot.time}</p>
                  </div>
                  <Badge variant={slot.status === "Present" ? "good" : "danger"}>
                    {slot.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advisor Inquiry Modal */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title="Contact Class Advisor (Dr. Sarah Jenkins)"
      >
        <form onSubmit={handleSendInquiry}>
          <div className="form-group">
            <label className="form-label">Subject of Inquiry</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Leave note explanation / Attendance shortage query"
              value={inquirySubject}
              onChange={(e) => setInquirySubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message to Advisor</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Provide details regarding your ward's attendance, absence reason, or requested consultation..."
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setInquiryModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: 6 }}>
              <Send size={15} />
              <span>Submit Message</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
