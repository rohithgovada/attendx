from django.urls import path
from .views import (
    LoginView, StudentDashboardView, StudentAttendanceHistoryView,
    FacultyDashboardView, ClassRosterView, MarkAttendanceView,
    PrincipalDashboardView, ParentDashboardView, NotificationView,
    NotificationMarkReadView, AttendanceReportsView, ProfileUpdateView
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('student/attendance-history/', StudentAttendanceHistoryView.as_view(), name='student-history'),
    path('faculty/dashboard/', FacultyDashboardView.as_view(), name='faculty-dashboard'),
    path('faculty/roster/', ClassRosterView.as_view(), name='faculty-roster'),
    path('faculty/mark-attendance/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('principal/dashboard/', PrincipalDashboardView.as_view(), name='principal-dashboard'),
    path('parent/dashboard/', ParentDashboardView.as_view(), name='parent-dashboard'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
    path('notifications/mark-all-read/', NotificationMarkReadView.as_view(), name='notification-all-read'),
    path('reports/', AttendanceReportsView.as_view(), name='attendance-reports'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
]
