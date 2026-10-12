// Deterministic Transparent Scoring Engine (100 Points Total)
// Formula:
// 1. Required Skills Match: 40 pts
// 2. Relevant Experience: 25 pts
// 3. Relevant Projects: 20 pts
// 4. Preferred Skills Match: 10 pts
// 5. Education & Certifications: 5 pts

export function evaluateCandidateMatch(candidate, job) {
  const reqSkills = job.requiredSkills || [];
  const prefSkills = job.preferredSkills || [];
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase());

  // 1. Required Skills (40 pts)
  const matchedRequired = [];
  const missingRequired = [];
  reqSkills.forEach(req => {
    const isMatched = candSkills.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs));
    if (isMatched) {
      matchedRequired.push(req);
    } else {
      missingRequired.push(req);
    }
  });

  const reqRatio = reqSkills.length > 0 ? matchedRequired.length / reqSkills.length : 1;
  const scoreRequired = Math.round(reqRatio * 40);

  // 2. Relevant Experience (25 pts)
  const minYears = job.minExperienceYears || 2;
  const candYears = candidate.experienceYears || 0;
  let scoreExp = 0;
  if (candYears >= minYears + 2) {
    scoreExp = 25;
  } else if (candYears >= minYears) {
    scoreExp = 22;
  } else if (candYears >= minYears - 1) {
    scoreExp = 15;
  } else {
    scoreExp = Math.max(5, Math.round((candYears / minYears) * 20));
  }

  // 3. Relevant Projects (20 pts)
  const projects = candidate.projects || [];
  let matchingProjectsCount = 0;
  const matchedProjectsList = [];
  projects.forEach(p => {
    const pLower = p.toLowerCase();
    const hasReqSkillInProject = reqSkills.some(s => pLower.includes(s.toLowerCase()));
    if (hasReqSkillInProject) {
      matchingProjectsCount++;
      matchedProjectsList.push(p);
    }
  });
  const scoreProjects = Math.min(20, Math.round((matchingProjectsCount >= 2 ? 20 : matchingProjectsCount === 1 ? 14 : 8)));

  // 4. Preferred Skills (10 pts)
  const matchedPreferred = [];
  prefSkills.forEach(pref => {
    const isMatched = candSkills.some(cs => cs.includes(pref.toLowerCase()) || pref.toLowerCase().includes(cs));
    if (isMatched) {
      matchedPreferred.push(pref);
    }
  });
  const prefRatio = prefSkills.length > 0 ? matchedPreferred.length / prefSkills.length : 0;
  const scorePreferred = Math.round(prefRatio * 10);

  // 5. Education & Certifications (5 pts)
  let scoreEdu = 2; // baseline for recognized degree
  const certs = candidate.certifications || [];
  const hasAwsCert = certs.some(c => c.toLowerCase().includes("aws") || c.toLowerCase().includes("cka") || c.toLowerCase().includes("developer"));
  if (hasAwsCert || certs.length > 0) {
    scoreEdu = 5;
  }

  // Total
  const totalScore = Math.min(100, scoreRequired + scoreExp + scoreProjects + scorePreferred + scoreEdu);

  // Recruiter Strengths & Concerns
  const strengths = [];
  const concerns = [];

  if (matchedRequired.length === reqSkills.length) {
    strengths.push(`100% match on all mandatory skills (${matchedRequired.join(", ")})`);
  } else if (matchedRequired.length > 0) {
    strengths.push(`Demonstrated mastery in key core areas: ${matchedRequired.slice(0, 3).join(", ")}`);
  }

  if (candYears >= minYears) {
    strengths.push(`Strong seniority with ${candYears} years experience (surpasses ${minYears} yr requirement)`);
  } else {
    concerns.push(`Slightly below target experience: has ${candYears} yrs vs required ${minYears} yrs`);
  }

  if (matchedProjectsList.length > 0) {
    strengths.push(`Proven portfolio with production project: "${matchedProjectsList[0]}"`);
  } else {
    concerns.push("No direct portfolio projects named matching exact tech stack");
  }

  if (missingRequired.length > 0) {
    concerns.push(`Missing / unverified mandatory skills: ${missingRequired.join(", ")}`);
  }

  if (certs.length > 0) {
    strengths.push(`Industry certified: ${certs[0]}`);
  }

  // Natural Language Recruiter Justification
  const explanation = `${candidate.name} scored ${totalScore}/100 for ${job.title}. ` +
    `Demonstrated ${matchedRequired.length}/${reqSkills.length} required competencies with ${candYears} years hands-on experience. ` +
    (matchedRequired.length === reqSkills.length ? `Complete technical alignment with strong delivery evidence in ${matchedProjectsList[0] || 'relevant projects'}.` :
      `Partially qualified with strength in ${matchedRequired.slice(0, 2).join(', ')}, but requires verification on ${missingRequired.slice(0, 2).join(', ')}.`);

  return {
    jobId: job.id,
    candidateId: candidate.id,
    candidateName: candidate.name,
    totalScore,
    breakdown: {
      requiredSkills: { score: scoreRequired, max: 40, matched: matchedRequired, missing: missingRequired },
      experience: { score: scoreExp, max: 25, years: candYears, requiredYears: minYears },
      projects: { score: scoreProjects, max: 20, matchedProjects: matchedProjectsList },
      preferredSkills: { score: scorePreferred, max: 10, matched: matchedPreferred },
      education: { score: scoreEdu, max: 5, certs }
    },
    strengths,
    concerns,
    explanation,
    analyzedAt: new Date().toISOString()
  };
}
