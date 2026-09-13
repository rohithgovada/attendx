from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Department, StudentProfile, FacultyProfile,
    ParentProfile, Subject, AttendanceSession, AttendanceRecord,
    Notification
)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AttendX Role & Metadata', {'fields': ('role', 'phone', 'avatar', 'address')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('AttendX Role & Metadata', {'fields': ('role', 'phone', 'avatar', 'address')}),
    )

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('roll_no', 'get_name', 'department', 'semester', 'section', 'attendance_rate', 'parent_name')
    list_filter = ('department', 'semester', 'section')
    search_fields = ('roll_no', 'user__first_name', 'user__last_name', 'user__email')

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Student Name'

@admin.register(FacultyProfile)
class FacultyProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'get_name', 'department', 'designation', 'cabin', 'total_classes_conducted')
    list_filter = ('department', 'designation')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__email')

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Faculty Name'

@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ('get_name', 'relation', 'get_ward', 'occupation')
    search_fields = ('user__first_name', 'user__last_name', 'ward__roll_no')

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Parent Name'

    def get_ward(self, obj):
        return f"{obj.ward.user.get_full_name()} ({obj.ward.roll_no})"
    get_ward.short_description = 'Ward Student'

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'semester', 'credits', 'faculty')
    list_filter = ('department', 'semester')
    search_fields = ('code', 'name')

@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'faculty', 'date', 'time_slot', 'section', 'created_at')
    list_filter = ('subject', 'date', 'section')
    search_fields = ('subject__code', 'subject__name', 'lecture_topic')

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('session', 'student', 'status')
    list_filter = ('status', 'session__subject')
    search_fields = ('student__roll_no', 'student__user__first_name')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'priority', 'target_role', 'recipient', 'is_read', 'created_at')
    list_filter = ('category', 'priority', 'target_role', 'is_read')
    search_fields = ('title', 'message', 'sender')
