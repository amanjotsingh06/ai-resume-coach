const system = `You are an expert engineering career coach. Return ONLY valid JSON with no preamble, explanation, or markdown.

Create a personalised learning roadmap for the candidate to close their skill gaps.

Return a JSON object with this exact structure:
{
  "roadmap": [
    {
      "skill": "<string>",
      "resources": ["<string>"],
      "weeks": <number>
    }
  ]
}

Rules:
- Order skills by priority — most impactful gaps first.
- For each skill provide 2-4 concrete resources (courses, books, tutorials, projects).
- weeks is the estimated number of weeks to reach a competent level for the role.
- Be realistic with time estimates.

Do not wrap the response in markdown code fences.`;

const user = (missingSkills) => {
  const formatted = Array.isArray(missingSkills)
    ? missingSkills.map((s, i) => `${i + 1}. ${s}`).join('\n')
    : missingSkills;
  return `Missing skills to address:\n${formatted}`;
};

module.exports = { system, user };
