from app.models.ats import ResumeSchema, JDSchema, ComparisonResultSchema
from app.core.matching_engine import normalize_skill

def _skills_match(r_skill: str, j_skill: str) -> bool:
    r = normalize_skill(r_skill)
    j = normalize_skill(j_skill)
    if not r or not j:
        return False
    if r == j:
        return True
    if "react" in r and "react" in j:
        return True
    return bool((r in j and len(r) >= 5) or (j in r and len(j) >= 5))

def compare_resume_to_jd(resume: ResumeSchema, jd: JDSchema) -> ComparisonResultSchema:
    """
    Deterministic Skill Gap Analysis & Weighted Deficit Resistance Model (E2, E3, E4).
    Categorizes skills into Critical (weight=3.0) and Optional (weight=1.0).
    Segments candidate into Job-Ready (>=85%), Bridgeable (60-84%), or Mismatch (<60%).
    """
    # Clean inputs
    resume_skills = [s.strip() for s in resume.skills if s.strip()]
    jd_mandatory = [s.strip() for s in jd.mandatory_skills if s.strip()]
    jd_nice = [s.strip() for s in jd.nice_to_have_skills if s.strip()]
    
    # 1. Match Mandatory Skills
    matched_skills = []
    missing_skills = []
    for j_req in jd_mandatory:
        matched = False
        for r_sk in resume_skills:
            if _skills_match(r_sk, j_req):
                matched = True
                matched_skills.append(j_req)
                break
        if not matched:
            missing_skills.append(j_req)
            
    # 2. Match Nice-to-Have Skills
    matched_nice_count = 0
    for j_opt in jd_nice:
        for r_sk in resume_skills:
            if _skills_match(r_sk, j_opt):
                matched_nice_count += 1
                break
                
    # 3. Bonus Skills (Candidate skills that do not match mandatory or optional)
    bonus_skills = []
    all_jd_skills = jd_mandatory + jd_nice
    for r_sk in resume_skills:
        if not any(_skills_match(r_sk, j) for j in all_jd_skills):
            bonus_skills.append(r_sk)
    
    # Weighted Score calculation (E2: Critical weight=3.0 (80%), Optional weight=1.0 (20%))
    mandatory_score = (len(matched_skills) / len(jd_mandatory)) * 80.0 if jd_mandatory else 80.0
    nice_to_have_score = (matched_nice_count / len(jd_nice)) * 20.0 if jd_nice else 20.0
        
    total_score = round(mandatory_score + nice_to_have_score, 2)
    
    # Tier Segmentation (E4)
    if total_score >= 85.0:
        tier = "job_ready"
    elif total_score >= 60.0:
        tier = "bridgeable"
    else:
        tier = "mismatch"
    
    return ComparisonResultSchema(
        match_score=total_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        bonus_skills=bonus_skills,
        tier=tier
    )
