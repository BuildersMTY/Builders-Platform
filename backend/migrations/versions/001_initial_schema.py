"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-12
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel  # noqa: F401 — required so SQLModel types are available

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "enrollments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("course_slug", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("difficulty", sa.String(), nullable=False),
        sa.Column("locale", sa.String(), nullable=False, server_default="es"),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "course_slug", "language"),
    )
    op.create_index("ix_enrollments_user_id", "enrollments", ["user_id"])

    op.create_table(
        "working_files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("course_slug", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("filepath", sa.String(), nullable=False),
        sa.Column("content", sa.String(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "course_slug", "language", "filepath"),
    )
    op.create_index("ix_working_files_user_id", "working_files", ["user_id"])

    op.create_table(
        "progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("course_slug", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("submodule_id", sa.String(), nullable=False),
        sa.Column("passed_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "course_slug", "language", "submodule_id"),
    )
    op.create_index("ix_progress_user_id", "progress", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_progress_user_id", table_name="progress")
    op.drop_table("progress")
    op.drop_index("ix_working_files_user_id", table_name="working_files")
    op.drop_table("working_files")
    op.drop_index("ix_enrollments_user_id", table_name="enrollments")
    op.drop_table("enrollments")
