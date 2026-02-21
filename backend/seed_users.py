"""
Seed database with test users
Run with: python seed_users.py
"""
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def seed_users():
    db = SessionLocal()

    # Check if users already exist
    existing_users = db.query(User).count()
    if existing_users > 0:
        print(f"Database already has {existing_users} users. Skipping seed.")
        db.close()
        return

    # Create test users
    test_users = [
        User(
            email="admin@hris.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active="true"
        ),
        User(
            email="hr@hris.com",
            hashed_password=get_password_hash("hr123"),
            full_name="HR Manager",
            role=UserRole.HR,
            is_active="true"
        ),
        User(
            email="candidate@hris.com",
            hashed_password=get_password_hash("candidate123"),
            full_name="John Candidate",
            role=UserRole.CANDIDATE,
            is_active="true"
        ),
    ]

    db.add_all(test_users)
    db.commit()

    print(f"✅ Successfully seeded database with {len(test_users)} test users")
    print("\nTest Credentials:")
    print("=" * 50)
    print("Admin:     admin@hris.com / admin123")
    print("HR:        hr@hris.com / hr123")
    print("Candidate: candidate@hris.com / candidate123")
    print("=" * 50)

    db.close()

if __name__ == "__main__":
    seed_users()
