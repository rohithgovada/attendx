from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('principal', 'Principal'),
        ('parent', 'Parent'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=30, blank=True, null=True)
    avatar = models.URLField(max_length=500, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"


class Department(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class FacultyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='faculty_members')
    designation = models.CharField(max_length=120)
    cabin = models.CharField(max_length=100, blank=True, null=True)
    total_classes_conducted = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.employee_id}"


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_no = models.CharField(max_length=50, unique=True)
    gender = models.CharField(max_length=20, default='Female')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='students')
    semester = models.CharField(max_length=50, default='6th Semester')
    section = models.CharField(max_length=20, default='A')
    batch = models.CharField(max_length=50, default='2022 - 2026')
    attendance_rate = models.FloatField(default=80.0)
    advisor = models.ForeignKey(FacultyProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='advised_students')
    parent_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='wards')
    parent_name = models.CharField(max_length=120, blank=True, null=True)
    parent_phone = models.CharField(max_length=40, blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.roll_no})"


class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    relation = models.CharField(max_length=50, default='Father')
    occupation = models.CharField(max_length=100, blank=True, null=True)
    ward = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='parent_guardians')

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} (Parent of {self.ward.roll_no})"


class Subject(models.Model):
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='subjects')
    semester = models.CharField(max_length=50, default='6th Semester')
    credits = models.PositiveIntegerField(default=3)
    faculty = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='assigned_subjects')
    total_hours = models.PositiveIntegerField(default=40)
    color = models.CharField(max_length=30, default='#2563eb')

    def __str__(self):
        return f"{self.code}: {self.name}"


class AttendanceSession(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sessions')
    faculty = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='conducted_sessions')
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    semester = models.CharField(max_length=50, default='6th Semester')
    section = models.CharField(max_length=20, default='A')
    date = models.DateField()
    time_slot = models.CharField(max_length=60)
    lecture_topic = models.TextField(blank=True, null=True)
    session_type = models.CharField(max_length=30, default='Lecture')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject.code} on {self.date} ({self.time_slot})"


class AttendanceRecord(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
    )
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    remarks = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        unique_together = ('session', 'student')

    def __str__(self):
        return f"{self.student.roll_no} - {self.session.subject.code} - {self.status}"


class Notification(models.Model):
    CATEGORY_CHOICES = (
        ('Warning', 'Attendance Warning'),
        ('Circular', 'College Circular'),
        ('Academic', 'Academic Bulletin'),
        ('Leave', 'Leave Update'),
    )
    PRIORITY_CHOICES = (
        ('high', 'High Priority'),
        ('medium', 'Medium Priority'),
        ('low', 'Low Priority'),
    )
    TARGET_ROLE_CHOICES = (
        ('all', 'All Roles'),
        ('student', 'Students'),
        ('faculty', 'Faculty'),
        ('principal', 'Principal'),
        ('parent', 'Parents'),
    )
    title = models.CharField(max_length=250)
    message = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='Circular')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    sender = models.CharField(max_length=150, default='AttendX Administration')
    target_role = models.CharField(max_length=20, choices=TARGET_ROLE_CHOICES, default='all')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='personal_notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.category}] {self.title}"
