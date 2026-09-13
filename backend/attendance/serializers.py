from rest_framework import serializers
from .models import (
    User, Department, StudentProfile, FacultyProfile,
    ParentProfile, Subject, AttendanceSession, AttendanceRecord,
    Notification
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'address']


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class FacultyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_name = serializers.ReadOnlyField(source='department.name')

    class Meta:
        model = FacultyProfile
        fields = '__all__'


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_name = serializers.ReadOnlyField(source='department.name')
    department_code = serializers.ReadOnlyField(source='department.code')
    advisor_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = '__all__'

    def get_advisor_name(self, obj):
        if obj.advisor and obj.advisor.user:
            return obj.advisor.user.get_full_name() or obj.advisor.user.username
        return "Not Assigned"


class ParentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    ward = StudentProfileSerializer(read_only=True)

    class Meta:
        model = ParentProfile
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()
    department_name = serializers.ReadOnlyField(source='department.name')

    class Meta:
        model = Subject
        fields = '__all__'

    def get_faculty_name(self, obj):
        if obj.faculty and obj.faculty.user:
            return obj.faculty.user.get_full_name() or obj.faculty.user.username
        return "TBD"


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_roll = serializers.ReadOnlyField(source='student.roll_no')
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class AttendanceSessionSerializer(serializers.ModelSerializer):
    records = AttendanceRecordSerializer(many=True, read_only=True)
    subject_code = serializers.ReadOnlyField(source='subject.code')
    subject_name = serializers.ReadOnlyField(source='subject.name')
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSession
        fields = '__all__'

    def get_faculty_name(self, obj):
        return obj.faculty.user.get_full_name() or obj.faculty.user.username


class NotificationSerializer(serializers.ModelSerializer):
    read = serializers.BooleanField(source='is_read', read_only=True)
    targetRole = serializers.CharField(source='target_role', read_only=True)
    date = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'

    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d') if obj.created_at else ''

    def get_timestamp(self, obj):
        return obj.created_at.strftime('%I:%M %p') if obj.created_at else ''
