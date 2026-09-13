from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from attendance.models import (
    Department, StudentProfile, FacultyProfile, ParentProfile,
    Subject, Notification
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial AttendX college datasets and users'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting AttendX database seeding...")

        # 1. Departments
        cse, _ = Department.objects.get_or_create(name='Computer Science & Engineering', code='CSE')
        it, _ = Department.objects.get_or_create(name='Information Technology', code='IT')
        ece, _ = Department.objects.get_or_create(name='Electronics & Communication', code='ECE')
        me, _ = Department.objects.get_or_create(name='Mechanical Engineering', code='ME')
        ce, _ = Department.objects.get_or_create(name='Civil Engineering', code='CE')

        # 2. Demo Users & Profiles
        # Faculty: Dr. Sarah Jenkins
        faculty_user, _ = User.objects.get_or_create(
            username='sarah.jenkins@college.edu',
            defaults={
                'email': 'sarah.jenkins@college.edu',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'role': 'faculty',
                'phone': '+1 (555) 345-6789',
                'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                'address': 'Faculty Quarters B-3, University Campus'
            }
        )
        faculty_user.set_password('password123')
        faculty_user.save()

        faculty_prof, _ = FacultyProfile.objects.get_or_create(
            user=faculty_user,
            defaults={
                'employee_id': 'EMP-CS-104',
                'department': cse,
                'designation': 'Associate Professor & Class In-Charge',
                'cabin': 'Block B, Room 302',
                'total_classes_conducted': 94
            }
        )

        # Principal: Dr. Robert Vance
        principal_user, _ = User.objects.get_or_create(
            username='robert.vance@college.edu',
            defaults={
                'email': 'robert.vance@college.edu',
                'first_name': 'Robert',
                'last_name': 'Vance',
                'role': 'principal',
                'phone': '+1 (555) 987-6543',
                'avatar': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
                'address': 'Principal Residence, Admin Block Suite'
            }
        )
        principal_user.set_password('password123')
        principal_user.save()

        # Parent: Mr. David Morgan
        parent_user, _ = User.objects.get_or_create(
            username='david.morgan@gmail.com',
            defaults={
                'email': 'david.morgan@gmail.com',
                'first_name': 'David',
                'last_name': 'Morgan',
                'role': 'parent',
                'phone': '+1 (555) 876-5432',
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'address': '742 Evergreen Terr, North Bay'
            }
        )
        parent_user.set_password('password123')
        parent_user.save()

        # Student: Alex Morgan
        student_user, _ = User.objects.get_or_create(
            username='alex.morgan@college.edu',
            defaults={
                'email': 'alex.morgan@college.edu',
                'first_name': 'Alex',
                'last_name': 'Morgan',
                'role': 'student',
                'phone': '+1 (555) 234-5678',
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'address': 'West Hostel Block A, Room 204'
            }
        )
        student_user.set_password('password123')
        student_user.save()

        alex_profile, _ = StudentProfile.objects.get_or_create(
            user=student_user,
            defaults={
                'roll_no': 'CS2024-042',
                'gender': 'Female',
                'department': cse,
                'semester': '6th Semester',
                'section': 'A',
                'batch': '2022 - 2026',
                'attendance_rate': 81.4,
                'advisor': faculty_prof,
                'parent_user': parent_user,
                'parent_name': 'Mr. David Morgan',
                'parent_phone': '+1 (555) 876-5432'
            }
        )
        alex_profile.attendance_rate = 81.4
        alex_profile.save()

        ParentProfile.objects.get_or_create(
            user=parent_user,
            defaults={
                'relation': 'Father',
                'occupation': 'Senior Electrical Engineer',
                'ward': alex_profile
            }
        )

        # 3. Create Additional 19 Students
        students_data = [
            ("CS2024-001", "Aiden", "Scott", "aiden.scott@college.edu", 92.3, "Robert Scott", "+1 (555) 901-2001"),
            ("CS2024-002", "Bella", "Chen", "bella.chen@college.edu", 86.8, "Wei Chen", "+1 (555) 901-2002"),
            ("CS2024-003", "Caleb", "Johnson", "caleb.johnson@college.edu", 68.1, "Marcus Johnson", "+1 (555) 901-2003"),
            ("CS2024-004", "Daniel", "Diaz", "daniel.diaz@college.edu", 61.5, "Hector Diaz", "+1 (555) 901-2004"),
            ("CS2024-005", "Elena", "Rostova", "elena.rostova@college.edu", 94.5, "Igor Rostov", "+1 (555) 901-2005"),
            ("CS2024-006", "Farhan", "Qureshi", "farhan.qureshi@college.edu", 76.9, "Zubair Qureshi", "+1 (555) 901-2006"),
            ("CS2024-007", "Grace", "Lin", "grace.lin@college.edu", 96.7, "Thomas Lin", "+1 (555) 901-2007"),
            ("CS2024-008", "Hannah", "Abbott", "hannah.abbott@college.edu", 72.5, "George Abbott", "+1 (555) 901-2008"),
            ("CS2024-009", "Ian", "Wright", "ian.wright@college.edu", 81.8, "Samuel Wright", "+1 (555) 901-2009"),
            ("CS2024-010", "Jasmin", "Kaur", "jasmin.kaur@college.edu", 84.6, "Harpreet Kaur", "+1 (555) 901-2010"),
            ("CS2024-011", "Kevin", "Patel", "kevin.patel@college.edu", 57.1, "Ramesh Patel", "+1 (555) 901-2011"),
            ("CS2024-012", "Liam", "O'Connor", "liam.oconnor@college.edu", 88.5, "Patrick O'Connor", "+1 (555) 901-2012"),
            ("CS2024-013", "Maya", "Thorne", "maya.thorne@college.edu", 92.8, "Arthur Thorne", "+1 (555) 901-2013"),
            ("CS2024-014", "Nathaniel", "Brooks", "nathaniel.brooks@college.edu", 76.4, "Donald Brooks", "+1 (555) 901-2014"),
            ("CS2024-015", "Olivia", "Zhang", "olivia.zhang@college.edu", 85.2, "Jian Zhang", "+1 (555) 901-2015"),
            ("CS2024-016", "Pranav", "Iyer", "pranav.iyer@college.edu", 70.9, "Subramanian Iyer", "+1 (555) 901-2016"),
            ("CS2024-017", "Quinn", "Gallagher", "quinn.gallagher@college.edu", 79.7, "Frank Gallagher", "+1 (555) 901-2017"),
            ("CS2024-018", "Rohan", "Malhotra", "rohan.malhotra@college.edu", 89.0, "Vikram Malhotra", "+1 (555) 901-2018"),
            ("CS2024-019", "Sophia", "Martinez", "sophia.martinez@college.edu", 95.6, "Carlos Martinez", "+1 (555) 901-2019"),
        ]

        for roll, fname, lname, email, att_rate, pname, pphone in students_data:
            suser, _ = User.objects.get_or_create(
                username=email,
                defaults={
                    'email': email,
                    'first_name': fname,
                    'last_name': lname,
                    'role': 'student',
                    'phone': '+1 (555) 101-2000'
                }
            )
            suser.set_password('password123')
            suser.save()

            sprof, _ = StudentProfile.objects.get_or_create(
                user=suser,
                defaults={
                    'roll_no': roll,
                    'department': cse,
                    'semester': '6th Semester',
                    'section': 'A',
                    'advisor': faculty_prof,
                    'parent_name': pname,
                    'parent_phone': pphone,
                    'attendance_rate': att_rate
                }
            )
            sprof.attendance_rate = att_rate
            sprof.save()

        # 4. Subjects
        Subject.objects.get_or_create(
            code='CS601',
            defaults={
                'name': 'Advanced Database Systems',
                'short_name': 'DBMS',
                'department': cse,
                'semester': '6th Semester',
                'credits': 4,
                'faculty': faculty_prof,
                'total_hours': 48,
                'color': '#2563eb'
            }
        )
        Subject.objects.get_or_create(
            code='CS602',
            defaults={
                'name': 'Computer Networks & Security',
                'short_name': 'CNS',
                'department': cse,
                'semester': '6th Semester',
                'credits': 4,
                'faculty': faculty_prof,
                'total_hours': 45,
                'color': '#7c3aed'
            }
        )
        Subject.objects.get_or_create(
            code='CS603',
            defaults={
                'name': 'Machine Learning & AI',
                'short_name': 'ML/AI',
                'department': cse,
                'semester': '6th Semester',
                'credits': 3,
                'faculty': faculty_prof,
                'total_hours': 40,
                'color': '#059669'
            }
        )
        Subject.objects.get_or_create(
            code='CS604',
            defaults={
                'name': 'Cloud Computing & DevOps',
                'short_name': 'Cloud',
                'department': cse,
                'semester': '6th Semester',
                'credits': 3,
                'faculty': faculty_prof,
                'total_hours': 38,
                'color': '#d97706'
            }
        )
        Subject.objects.get_or_create(
            code='CS605',
            defaults={
                'name': 'Software Engineering & Agile',
                'short_name': 'SE',
                'department': cse,
                'semester': '6th Semester',
                'credits': 3,
                'faculty': faculty_prof,
                'total_hours': 36,
                'color': '#db2777'
            }
        )
        Subject.objects.get_or_create(
            code='CS606',
            defaults={
                'name': 'Distributed Systems Lab',
                'short_name': 'DS Lab',
                'department': cse,
                'semester': '6th Semester',
                'credits': 2,
                'faculty': faculty_prof,
                'total_hours': 30,
                'color': '#0891b2'
            }
        )

        # 5. Initial Notifications
        Notification.objects.get_or_create(
            title='Low Attendance Warning: CS606 Lab',
            defaults={
                'message': 'Your attendance in Distributed Systems Lab has dropped to 68.0% (below university 75% threshold). Please consult Dr. Sarah Jenkins immediately to avoid debarment.',
                'category': 'Warning',
                'priority': 'high',
                'sender': 'Academics Branch',
                'target_role': 'student',
                'recipient': student_user,
                'is_read': False
            }
        )
        Notification.objects.get_or_create(
            title='Mid-Term Examination Schedule Released',
            defaults={
                'message': 'Mid-term theory examinations for 6th Semester will commence from October 5th. Hall tickets will be issued only to candidates having >=75% overall attendance.',
                'category': 'Circular',
                'priority': 'medium',
                'sender': 'Office of the Controller of Examinations',
                'target_role': 'all',
                'is_read': False
            }
        )
        Notification.objects.get_or_create(
            title='Parent Alert: Ward Attendance Status',
            defaults={
                'message': 'Dear Parent, your ward Alex Morgan (Roll: CS2024-042) has an overall attendance of 81.3%. However, attendance in 2 subjects is below 75%. Please check the parent portal.',
                'category': 'Warning',
                'priority': 'high',
                'sender': 'Dean of Student Welfare',
                'target_role': 'parent',
                'recipient': parent_user,
                'is_read': False
            }
        )
        Notification.objects.get_or_create(
            title='Faculty Monthly Attendance Submission Due',
            defaults={
                'message': 'All faculty members are requested to lock and finalize monthly attendance registers for August by 5:00 PM tomorrow for principal review.',
                'category': 'Academic',
                'priority': 'medium',
                'sender': 'Dr. Robert Vance, Principal',
                'target_role': 'faculty',
                'recipient': faculty_user,
                'is_read': True
            }
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded AttendX database!"))
