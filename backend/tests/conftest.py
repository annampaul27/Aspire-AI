import sys
from pathlib import Path
import pytest

# Ensure backend directory is in sys.path for app.* and features.* imports
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.db.database import init_db  # noqa: E402
from app.db.seed import seed_database_defaults  # noqa: E402

@pytest.fixture(autouse=True, scope="session")
def setup_test_suite_database():
    """Ensure database schema, all tables, and seed data are primed for the entire test session."""
    init_db()
    seed_database_defaults()
