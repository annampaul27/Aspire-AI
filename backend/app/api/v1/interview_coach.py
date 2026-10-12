import os
import sys
from fastapi import APIRouter

# Ensure services directory is discoverable
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from services.interview_coach.api.routes import router as core_router  # noqa: E402

router = APIRouter()
# Include all endpoints from autonomous microservice
router.include_router(core_router)


@router.post("/panel-evaluate", summary="Alias for /panel/evaluate")
def panel_evaluate_alias(req: dict):
    from services.interview_coach.api.routes import evaluate_panel_session, PanelEvaluationRequest
    return evaluate_panel_session(PanelEvaluationRequest(**req))

