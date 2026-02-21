"""
Dashboard endpoints for statistics and overview
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.db.database import get_db
from app.models.user import User
from app.models.job_posting import JobPosting, JobStatus
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get dashboard statistics
    Returns total counts for users, job postings, and interviews
    """
    # Count total users
    total_users = db.query(User).count()

    # Count total job postings
    total_jobs = db.query(JobPosting).count()

    # Count active job postings
    active_jobs = db.query(JobPosting).filter(JobPosting.status == JobStatus.ACTIVE).count()

    # TODO: Add interviews count when Interview model is created in Phase 5
    total_interviews = 0

    return {
        "total_users": total_users,
        "total_job_postings": total_jobs,
        "active_job_postings": active_jobs,
        "total_interviews": total_interviews,
        "user": {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        }
    }


@router.get("/categories")
def get_job_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get job posting categories with counts
    Groups job postings by category/department
    """
    # Get all job postings
    job_postings = db.query(JobPosting).all()

    # Group by department (using department as category)
    categories: Dict[str, int] = {}
    for job in job_postings:
        dept = job.department or "Other"
        categories[dept] = categories.get(dept, 0) + 1

    # Convert to list of dictionaries
    result = [
        {
            "name": category,
            "count": count,
            "icon": get_category_icon(category)
        }
        for category, count in categories.items()
    ]

    # Sort by count (descending)
    result.sort(key=lambda x: x["count"], reverse=True)

    return result


def get_category_icon(category: str) -> str:
    """
    Map category/department names to icon names
    Using Lucide React icon names
    """
    icon_map = {
        "Engineering": "code",
        "Technology": "code",
        "IT": "laptop",
        "Marketing": "megaphone",
        "Sales": "trending-up",
        "Human Resources": "users",
        "HR": "users",
        "Finance": "dollar-sign",
        "Operations": "settings",
        "Customer Support": "headphones",
        "Support": "headphones",
        "Design": "palette",
        "Product": "package",
        "Legal": "scale",
        "Other": "briefcase"
    }

    return icon_map.get(category, "briefcase")
