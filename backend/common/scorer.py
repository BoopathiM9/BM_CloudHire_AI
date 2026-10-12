"""
Deterministic 100-Point Scoring Engine
Calculates transparent candidate match scores based on Bedrock extracted evidence.
Rubric:
- Required Skills: 40 pts
- Relevant Experience: 25 pts
- Relevant Projects: 20 pts
- Preferred Skills: 10 pts
- Education / Certifications: 5 pts
"""

from typing import Dict, Any

DEFAULT_WEIGHTS = {
    "required_skills": 40,
    "experience": 25,
    "projects": 20,
    "preferred_skills": 10,
    "education_certs": 5
}

class CandidateScorer:
    def __init__(self, custom_weights: Dict[str, int] = None):
        self.weights = custom_weights or DEFAULT_WEIGHTS.copy()
        # Verify weights sum to 100 or normalize
        total = sum(self.weights.values())
        if total != 100 and total > 0:
            # Normalize to 100
            for k in self.weights:
                self.weights[k] = round((self.weights[k] / total) * 100)

    def calculate_score(self, candidate: Dict[str, Any], job: Dict[str, Any], bedrock_evidence: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes the candidate's transparent score out of 100 using deterministic arithmetic.
        """
        # 1. Required Skills Match (Max: self.weights["required_skills"])
        job_req = job.get("requiredSkills", [])
        matched_req = bedrock_evidence.get("matched_required_skills", [])
        missing_req = bedrock_evidence.get("missing_required_skills", [])

        if job_req:
            req_ratio = len(matched_req) / len(job_req)
            score_req = round(req_ratio * self.weights["required_skills"])
        else:
            score_req = self.weights["required_skills"]

        # 2. Relevant Experience (Max: self.weights["experience"])
        target_years = int(job.get("minExperienceYears", 2))
        cand_years = int(bedrock_evidence.get("verified_experience_years", candidate.get("experienceYears", 0)))

        max_exp = self.weights["experience"]
        if cand_years >= target_years + 2:
            score_exp = max_exp
        elif cand_years >= target_years:
            score_exp = round(max_exp * 0.88)
        elif cand_years >= target_years - 1:
            score_exp = round(max_exp * 0.60)
        else:
            score_exp = max(4, round((cand_years / max(1, target_years)) * max_exp * 0.60))

        # 3. Relevant Projects (Max: self.weights["projects"])
        max_proj = self.weights["projects"]
        projects = bedrock_evidence.get("relevant_projects", [])
        if len(projects) >= 2:
            score_proj = max_proj
        elif len(projects) == 1:
            score_proj = round(max_proj * 0.70)
        else:
            score_proj = round(max_proj * 0.40)

        # 4. Preferred Skills Match (Max: self.weights["preferred_skills"])
        job_pref = job.get("preferredSkills", [])
        matched_pref = bedrock_evidence.get("matched_preferred_skills", [])
        max_pref = self.weights["preferred_skills"]
        if job_pref:
            pref_ratio = len(matched_pref) / len(job_pref)
            score_pref = round(pref_ratio * max_pref)
        else:
            # If job has no preferred skills, award full marks or normalized
            score_pref = round(max_pref * 0.5)

        # 5. Education & Certifications (Max: self.weights["education_certs"])
        max_edu = self.weights["education_certs"]
        certs = candidate.get("certifications", [])
        has_relevant_cert = any("aws" in c.lower() or "cka" in c.lower() or "developer" in c.lower() for c in certs)
        if has_relevant_cert or len(certs) > 0:
            score_edu = max_edu
        else:
            score_edu = round(max_edu * 0.6)  # Degree baseline

        total_score = min(100, score_req + score_exp + score_proj + score_pref + score_edu)

        breakdown = {
            "requiredSkills": {
                "score": score_req,
                "max": self.weights["required_skills"],
                "matched": matched_req,
                "missing": missing_req
            },
            "experience": {
                "score": score_exp,
                "max": self.weights["experience"],
                "years": cand_years,
                "requiredYears": target_years
            },
            "projects": {
                "score": score_proj,
                "max": self.weights["projects"],
                "matchedProjects": projects
            },
            "preferredSkills": {
                "score": score_pref,
                "max": self.weights["preferred_skills"],
                "matched": matched_pref
            },
            "education": {
                "score": score_edu,
                "max": self.weights["education_certs"],
                "certifications": certs
            }
        }

        return {
            "jobId": job.get("jobId"),
            "candidateId": candidate.get("candidateId"),
            "candidateName": candidate.get("name"),
            "totalScore": total_score,
            "breakdown": breakdown,
            "strengths": bedrock_evidence.get("strengths", []),
            "concerns": bedrock_evidence.get("concerns", []),
            "explanation": bedrock_evidence.get("recruiter_justification", ""),
            "rubricWeights": self.weights
        }
