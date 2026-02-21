"""
Comprehensive database seed script
Run with: python seed_data.py
"""
from datetime import date, datetime, time, timedelta
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.profile import Profile
from app.models.job_posting import JobPosting, JobStatus
from app.models.application import Application, ApplicationStatus
from app.models.interview import Interview, InterviewStatus, InterviewType
from app.core.security import get_password_hash

def seed_database():
    db = SessionLocal()

    # Check if data already exists
    existing_users = db.query(User).count()
    if existing_users > 0:
        print(f"Database already has {existing_users} users. Skipping seed.")
        db.close()
        return

    print("🌱 Starting database seed...")

    # ========== STEP 1: Create Users ==========
    print("\n📝 Creating users...")

    admin_user = User(
        email="admin@hris.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_active="true"
    )

    hr_user = User(
        email="hr@hris.com",
        hashed_password=get_password_hash("hr123"),
        full_name="HR Manager",
        role=UserRole.HR,
        is_active="true"
    )

    candidate1 = User(
        email="candidate@hris.com",
        hashed_password=get_password_hash("candidate123"),
        full_name="John Doe",
        role=UserRole.CANDIDATE,
        is_active="true"
    )

    candidate2 = User(
        email="jane.smith@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Jane Smith",
        role=UserRole.CANDIDATE,
        is_active="true"
    )

    candidate3 = User(
        email="mike.johnson@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Mike Johnson",
        role=UserRole.CANDIDATE,
        is_active="true"
    )

    db.add_all([admin_user, hr_user, candidate1, candidate2, candidate3])
    db.commit()
    db.refresh(admin_user)
    db.refresh(hr_user)
    db.refresh(candidate1)
    db.refresh(candidate2)
    db.refresh(candidate3)

    print(f"✅ Created {5} users")

    # ========== STEP 2: Create Profiles ==========
    print("\n📝 Creating profiles...")

    profile1 = Profile(
        user_id=candidate1.id,
        bio="Experienced software engineer with 5+ years in full-stack development. Passionate about building scalable web applications.",
        skills=["Python", "JavaScript", "React", "FastAPI", "PostgreSQL", "Docker"],
        phone="+1-555-0101",
        address="123 Main St, San Francisco, CA 94102",
        documents=[]
    )

    profile2 = Profile(
        user_id=candidate2.id,
        bio="Product manager with expertise in SaaS products and agile methodologies. Love turning ideas into successful products.",
        skills=["Product Management", "Agile", "User Research", "Data Analysis", "Roadmapping"],
        phone="+1-555-0102",
        address="456 Oak Ave, Boston, MA 02108",
        documents=[]
    )

    profile3 = Profile(
        user_id=candidate3.id,
        bio="Creative UX designer focused on user-centered design. Experience with design systems and accessibility standards.",
        skills=["Figma", "Sketch", "Adobe XD", "User Research", "Prototyping", "Design Systems"],
        phone="+1-555-0103",
        address="789 Pine Rd, Austin, TX 78701",
        documents=[]
    )

    db.add_all([profile1, profile2, profile3])
    db.commit()

    print(f"✅ Created {3} profiles")

    # ========== STEP 3: Create Job Postings ==========
    print("\n📝 Creating job postings...")

    job_postings = [
        JobPosting(
            job_title="Senior Software Engineer",
            department="Engineering",
            category="Technology",
            location="Remote",
            status=JobStatus.ACTIVE,
            date_posted=date.today() - timedelta(days=20),
            application_deadline=date.today() + timedelta(days=30),
            description="We are looking for a Senior Software Engineer to join our growing engineering team. You will be responsible for designing, developing, and maintaining scalable web applications.",
            requirements=[
                "5+ years of experience in software development",
                "Strong proficiency in JavaScript, TypeScript, and React",
                "Experience with modern web technologies and frameworks",
                "Excellent problem-solving and communication skills"
            ],
            responsibilities=[
                "Design and implement new features for our web applications",
                "Collaborate with cross-functional teams",
                "Mentor junior developers",
                "Participate in code reviews and architectural discussions"
            ],
            created_by=hr_user.id
        ),
        JobPosting(
            job_title="Product Manager",
            department="Product",
            category="Management",
            location="San Francisco, CA",
            status=JobStatus.ACTIVE,
            date_posted=date.today() - timedelta(days=15),
            application_deadline=date.today() + timedelta(days=35),
            description="We are seeking an experienced Product Manager to lead product strategy and execution. You will work closely with engineering, design, and business teams to deliver innovative products.",
            requirements=[
                "3+ years of product management experience",
                "Strong analytical and strategic thinking skills",
                "Experience with Agile methodologies",
                "Excellent stakeholder management abilities"
            ],
            responsibilities=[
                "Define product vision and roadmap",
                "Gather and prioritize product requirements",
                "Work with engineering teams to deliver features",
                "Analyze product metrics and user feedback"
            ],
            created_by=hr_user.id
        ),
        JobPosting(
            job_title="UX Designer",
            department="Design",
            category="Design",
            location="Boston, MA",
            status=JobStatus.ACTIVE,
            date_posted=date.today() - timedelta(days=10),
            application_deadline=date.today() + timedelta(days=40),
            description="Join our design team as a UX Designer to create intuitive and engaging user experiences. You will conduct user research, create wireframes, and collaborate with product and engineering teams.",
            requirements=[
                "3+ years of UX design experience",
                "Proficiency in Figma, Sketch, or similar design tools",
                "Strong portfolio demonstrating user-centered design",
                "Experience with user research and usability testing"
            ],
            responsibilities=[
                "Conduct user research and usability testing",
                "Create wireframes, prototypes, and high-fidelity designs",
                "Collaborate with product managers and engineers",
                "Maintain and evolve our design system"
            ],
            created_by=hr_user.id
        ),
        JobPosting(
            job_title="DevOps Engineer",
            department="Engineering",
            category="Technology",
            location="New York, NY",
            status=JobStatus.ACTIVE,
            date_posted=date.today() - timedelta(days=7),
            application_deadline=date.today() + timedelta(days=45),
            description="We're looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. You'll work on automation, CI/CD pipelines, and system reliability.",
            requirements=[
                "4+ years of DevOps or infrastructure experience",
                "Strong knowledge of AWS, Docker, and Kubernetes",
                "Experience with CI/CD tools like Jenkins or GitLab CI",
                "Scripting skills in Python or Bash"
            ],
            responsibilities=[
                "Design and maintain cloud infrastructure",
                "Build and optimize CI/CD pipelines",
                "Monitor system performance and reliability",
                "Implement security best practices"
            ],
            created_by=admin_user.id
        ),
        JobPosting(
            job_title="Data Analyst",
            department="Analytics",
            category="Data",
            location="Remote",
            status=JobStatus.ACTIVE,
            date_posted=date.today() - timedelta(days=5),
            application_deadline=date.today() + timedelta(days=50),
            description="Join our analytics team to turn data into actionable insights. You'll work with large datasets, create dashboards, and support data-driven decision making.",
            requirements=[
                "2+ years of data analysis experience",
                "Proficiency in SQL and Python",
                "Experience with BI tools like Tableau or PowerBI",
                "Strong statistical and analytical skills"
            ],
            responsibilities=[
                "Analyze data to identify trends and insights",
                "Create dashboards and reports for stakeholders",
                "Collaborate with teams to define metrics",
                "Support A/B testing and experimentation"
            ],
            created_by=hr_user.id
        ),
        JobPosting(
            job_title="Marketing Manager",
            department="Marketing",
            category="Marketing",
            location="Los Angeles, CA",
            status=JobStatus.CLOSED,
            date_posted=date.today() - timedelta(days=60),
            application_deadline=date.today() - timedelta(days=10),
            description="Lead our marketing efforts to drive brand awareness and customer acquisition. This position has been filled.",
            requirements=[
                "5+ years of marketing experience",
                "Experience with digital marketing channels",
                "Strong analytical and creative skills"
            ],
            responsibilities=[
                "Develop marketing strategies",
                "Manage marketing campaigns",
                "Analyze campaign performance"
            ],
            created_by=hr_user.id
        )
    ]

    db.add_all(job_postings)
    db.commit()
    for job in job_postings:
        db.refresh(job)

    print(f"✅ Created {len(job_postings)} job postings")

    # ========== STEP 4: Create Applications ==========
    print("\n📝 Creating applications...")

    # Application 1: John Doe -> Senior Software Engineer (In-Process with interview)
    app1 = Application(
        user_id=candidate1.id,
        job_posting_id=job_postings[0].id,  # Senior Software Engineer
        status=ApplicationStatus.IN_PROCESS,
        applied_date=date.today() - timedelta(days=18),
        cover_letter="I am excited to apply for the Senior Software Engineer position. With 5+ years of experience in full-stack development and a passion for building scalable applications, I believe I would be a great fit for your team.",
        documents=[],
        timeline=[
            {
                "status": "Pending",
                "timestamp": (datetime.now() - timedelta(days=18)).isoformat(),
                "note": "Application submitted"
            },
            {
                "status": "In-Process",
                "timestamp": (datetime.now() - timedelta(days=15)).isoformat(),
                "note": "Application under review"
            }
        ]
    )

    # Application 2: Jane Smith -> Product Manager (Pending)
    app2 = Application(
        user_id=candidate2.id,
        job_posting_id=job_postings[1].id,  # Product Manager
        status=ApplicationStatus.PENDING,
        applied_date=date.today() - timedelta(days=12),
        cover_letter="I am thrilled to apply for the Product Manager role. My experience in SaaS products and agile methodologies aligns perfectly with your requirements.",
        documents=[],
        timeline=[
            {
                "status": "Pending",
                "timestamp": (datetime.now() - timedelta(days=12)).isoformat(),
                "note": "Application submitted"
            }
        ]
    )

    # Application 3: Mike Johnson -> UX Designer (In-Process with interview scheduled)
    app3 = Application(
        user_id=candidate3.id,
        job_posting_id=job_postings[2].id,  # UX Designer
        status=ApplicationStatus.IN_PROCESS,
        applied_date=date.today() - timedelta(days=8),
        cover_letter="I am passionate about creating user-centered designs and would love to contribute to your design team. My portfolio demonstrates my commitment to accessibility and design systems.",
        documents=[],
        timeline=[
            {
                "status": "Pending",
                "timestamp": (datetime.now() - timedelta(days=8)).isoformat(),
                "note": "Application submitted"
            },
            {
                "status": "In-Process",
                "timestamp": (datetime.now() - timedelta(days=5)).isoformat(),
                "note": "Portfolio reviewed - moving forward"
            }
        ]
    )

    # Application 4: John Doe -> DevOps Engineer (Accepted)
    app4 = Application(
        user_id=candidate1.id,
        job_posting_id=job_postings[3].id,  # DevOps Engineer
        status=ApplicationStatus.ACCEPTED,
        applied_date=date.today() - timedelta(days=50),
        cover_letter="I am interested in the DevOps Engineer position and have extensive experience with AWS and Kubernetes.",
        documents=[],
        timeline=[
            {
                "status": "Pending",
                "timestamp": (datetime.now() - timedelta(days=50)).isoformat(),
                "note": "Application submitted"
            },
            {
                "status": "In-Process",
                "timestamp": (datetime.now() - timedelta(days=45)).isoformat(),
                "note": "Initial screening passed"
            },
            {
                "status": "Accepted",
                "timestamp": (datetime.now() - timedelta(days=30)).isoformat(),
                "note": "Offer extended and accepted"
            }
        ]
    )

    # Application 5: Jane Smith -> Data Analyst (Rejected)
    app5 = Application(
        user_id=candidate2.id,
        job_posting_id=job_postings[4].id,  # Data Analyst
        status=ApplicationStatus.REJECTED,
        applied_date=date.today() - timedelta(days=25),
        cover_letter="I would like to apply for the Data Analyst position.",
        documents=[],
        timeline=[
            {
                "status": "Pending",
                "timestamp": (datetime.now() - timedelta(days=25)).isoformat(),
                "note": "Application submitted"
            },
            {
                "status": "Rejected",
                "timestamp": (datetime.now() - timedelta(days=20)).isoformat(),
                "note": "Looking for candidates with more SQL experience"
            }
        ]
    )

    db.add_all([app1, app2, app3, app4, app5])
    db.commit()
    for app in [app1, app2, app3, app4, app5]:
        db.refresh(app)

    print(f"✅ Created {5} applications")

    # ========== STEP 5: Create Interviews ==========
    print("\n📝 Creating interviews...")

    interviews = [
        # Interview for app1 (John Doe - Senior Software Engineer) - Upcoming
        Interview(
            application_id=app1.id,
            interview_date=date.today() + timedelta(days=3),
            interview_time=time(14, 0),  # 2:00 PM
            location="https://meet.google.com/abc-defg-hij",
            interview_type=InterviewType.VIDEO,
            status=InterviewStatus.SCHEDULED,
            interviewer_name="Sarah Chen, Engineering Manager",
            notes="Technical interview focusing on system design and coding challenges. Please prepare to discuss your previous projects and experience with microservices."
        ),

        # Interview for app3 (Mike Johnson - UX Designer) - Upcoming
        Interview(
            application_id=app3.id,
            interview_date=date.today() + timedelta(days=5),
            interview_time=time(10, 30),  # 10:30 AM
            location="https://zoom.us/j/123456789",
            interview_type=InterviewType.VIDEO,
            status=InterviewStatus.SCHEDULED,
            interviewer_name="Emily Rodriguez, Lead Designer",
            notes="Portfolio review and discussion about design process. Please be prepared to walk through 2-3 case studies from your portfolio."
        ),

        # Interview for app1 (First round, completed)
        Interview(
            application_id=app1.id,
            interview_date=date.today() - timedelta(days=10),
            interview_time=time(15, 0),  # 3:00 PM
            location="Phone: +1-555-0199",
            interview_type=InterviewType.PHONE,
            status=InterviewStatus.COMPLETED,
            interviewer_name="Tom Wilson, HR Recruiter",
            notes="Initial screening interview completed. Candidate showed strong communication skills and technical background."
        ),

        # Interview for app4 (DevOps - Completed, led to acceptance)
        Interview(
            application_id=app4.id,
            interview_date=date.today() - timedelta(days=35),
            interview_time=time(11, 0),  # 11:00 AM
            location="Conference Room A, 5th Floor",
            interview_type=InterviewType.IN_PERSON,
            status=InterviewStatus.COMPLETED,
            interviewer_name="Panel: David Kim, Lisa Wang, Robert Taylor",
            notes="Final round panel interview. Excellent performance on infrastructure design and security questions."
        ),

        # Cancelled interview example
        Interview(
            application_id=app3.id,
            interview_date=date.today() - timedelta(days=2),
            interview_time=time(9, 0),  # 9:00 AM
            location="https://meet.google.com/xyz-uvwx-rst",
            interview_type=InterviewType.VIDEO,
            status=InterviewStatus.CANCELLED,
            interviewer_name="Emily Rodriguez, Lead Designer",
            notes="Rescheduled due to interviewer availability conflict."
        )
    ]

    db.add_all(interviews)
    db.commit()

    print(f"✅ Created {len(interviews)} interviews")

    # ========== Summary ==========
    print("\n" + "="*50)
    print("🎉 Database seeding completed successfully!")
    print("="*50)
    print(f"\n📊 Summary:")
    print(f"   • Users: 5 (1 admin, 1 HR, 3 candidates)")
    print(f"   • Profiles: 3")
    print(f"   • Job Postings: {len(job_postings)} (5 active, 1 closed)")
    print(f"   • Applications: 5 (various statuses)")
    print(f"   • Interviews: {len(interviews)} (2 upcoming, 2 completed, 1 cancelled)")

    print(f"\n🔑 Login Credentials:")
    print(f"   • Admin: admin@hris.com / admin123")
    print(f"   • HR: hr@hris.com / hr123")
    print(f"   • Candidate: candidate@hris.com / candidate123")
    print(f"   • Jane: jane.smith@example.com / password123")
    print(f"   • Mike: mike.johnson@example.com / password123")

    print("\n✨ You can now log in and explore the full HRIS system!")
    print("="*50 + "\n")

    db.close()

if __name__ == "__main__":
    seed_database()
