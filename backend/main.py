import ollama
import pymysql

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_db_connection


app = FastAPI(
    title="Hydroniq API",
    description="AI-powered water problem reporting platform",
    version="1.0.0"
)


# Frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Request model
class ReportCreate(BaseModel):
    issue_type: str = Field(min_length=1, max_length=100)
    area: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1)
    reporter_name: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to Hydroniq API",
        "status": "running"
    }


# Backend health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Hydroniq API"
    }


# Submit a new water problem report
@app.post("/api/reports")
def create_report(report: ReportCreate):
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                """
                INSERT INTO reports (
                    issue_type,
                    area,
                    description,
                    reporter_name,
                    state,
                    district
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    report.issue_type.strip(),
                    report.area.strip(),
                    report.description.strip(),
                    report.reporter_name.strip()
                    if report.reporter_name else None,
                    report.state.strip() if report.state else None,
                    report.district.strip() if report.district else None
                )
            )

            report_id = cursor.lastrowid

        connection.commit()

        return {
            "message": "Water report submitted successfully",
            "report_id": report_id,
            "status": "Pending"
        }

    except Exception as error:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not submit report: {str(error)}"
        )

    finally:
        if connection:
            connection.close()


# AI-powered report analysis
@app.post("/api/ai/analyze")
def analyze_report(report: ReportCreate):
    prompt = f"""
You are an AI assistant for Hydroniq, a water problem reporting platform.

Analyze the following citizen report.

Issue type: {report.issue_type}
Area: {report.area}
State: {report.state or "Not provided"}
District: {report.district or "Not provided"}
Description: {report.description}

Please provide:
1. Suggested issue category.
2. A short summary of the reported problem.
3. Important missing information, if any.
4. A practical next step for a human reviewer.

Do not claim that the problem has been independently verified.
Do not invent facts or claim that a repair has been completed.
Clearly state that your analysis is only a suggestion and requires
human review before any official action.
"""

    try:
        response = ollama.chat(
            model="gemma3:4b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return {
            "analysis": response["message"]["content"],
            "model": "gemma3:4b",
            "requires_human_review": True
        }

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI analysis is currently unavailable. "
                f"Please check Ollama and the Gemma model. Details: {str(error)}"
            )
        )


# Dashboard statistics
@app.get("/api/dashboard/stats")
def dashboard_stats():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    COUNT(*) AS total,
                    COALESCE(
                        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END),
                        0
                    ) AS pending,
                    COALESCE(
                        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END),
                        0
                    ) AS resolved
                FROM reports
                """
            )

            result = cursor.fetchone()

        return {
            "total": result["total"],
            "pending": result["pending"],
            "resolved": result["resolved"]
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch dashboard statistics: {str(error)}"
        )

    finally:
        if connection:
            connection.close()


# Analytics: count reports by issue type
@app.get("/api/analytics/issues")
def issue_analytics():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                """
                SELECT issue_type, COUNT(*) AS count
                FROM reports
                GROUP BY issue_type
                ORDER BY count DESC
                """
            )

            results = cursor.fetchall()

        return results

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch issue analytics: {str(error)}"
        )

    finally:
        if connection:
            connection.close()


# Get all reports, including state and district
@app.get("/api/reports")
def get_reports():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    issue_type,
                    area,
                    description,
                    reporter_name,
                    state,
                    district,
                    status,
                    created_at
                FROM reports
                ORDER BY created_at DESC
                """
            )

            reports = cursor.fetchall()

        for report in reports:
            if report.get("created_at"):
                report["created_at"] = report["created_at"].isoformat()

        return reports

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch reports: {str(error)}"
        )

    finally:
        if connection:
            connection.close()


# Update report status
@app.patch("/api/reports/{report_id}/status")
def update_report_status(report_id: int, status: str):
    allowed_statuses = ["Pending", "In Progress", "Resolved"]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Use Pending, In Progress, or Resolved."
        )

    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                "SELECT id FROM reports WHERE id = %s",
                (report_id,)
            )

            existing_report = cursor.fetchone()

            if not existing_report:
                raise HTTPException(
                    status_code=404,
                    detail="Report not found"
                )

            cursor.execute(
                """
                UPDATE reports
                SET status = %s
                WHERE id = %s
                """,
                (status, report_id)
            )

        connection.commit()

        return {
            "message": "Report status updated successfully",
            "report_id": report_id,
            "status": status
        }

    except HTTPException:
        raise

    except Exception as error:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not update report status: {str(error)}"
        )

    finally:
        if connection:
            connection.close()
