import { generateGeminiResponse } from "./geminiService.js";

export async function searchJobs(searchParams = {}) {
  const {
    country = "India",
    stateName = "",
    city = "",
    qualification = "",
    skills = "",
    experience = "",
    jobType = "Full Time",
    language = "English",
  } = typeof searchParams === "object" ? searchParams : { skills: String(searchParams || "") };

  const apiKey = process.env.RAPIDAPI_KEY;
  let liveJobs = [];
  let isLive = false;

  // Try live job API if RapidAPI key exists
  if (apiKey) {
    try {
      const query = [skills, city, stateName, country, jobType].filter(Boolean).join(" ");
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.data) && data.data.length > 0) {
          liveJobs = data.data.slice(0, 10).map((item) => ({
            title: item.job_title || "Not specified",
            company: item.employer_name || "Not specified",
            location: [item.job_city, item.job_state, item.job_country].filter(Boolean).join(", ") || "Not specified",
            salary: item.job_min_salary && item.job_max_salary
              ? `${item.job_min_salary} - ${item.job_max_salary} ${item.job_salary_currency || ""}`
              : "Not specified",
            type: item.job_employment_type || "Not specified",
            description: item.job_description ? `${item.job_description.slice(0, 280)}...` : "Not specified",
            applyUrl: item.job_apply_link || item.employer_website || null,
            source: item.job_publisher || "Verified External Portal",
          }));
          isLive = liveJobs.length > 0;
        }
      }
    } catch (error) {
      console.warn("RapidAPI search error:", error.message);
    }
  }

  // Generate AI Career & Profile Guidance using Gemini
  let aiRecommendation = {
    matchingRoles: [],
    whyMatched: "",
    missingSkills: [],
    suggestedSkills: [],
    resumeTips: "",
    interviewPrep: "",
    searchKeywords: [],
    jobCategories: [],
  };

  try {
    const prompt = `Analyze this job seeker profile and return a JSON object with AI career recommendations. Respond in ${language} language for all explanations.

Profile:
- Country: ${country}
- State: ${stateName || "Any"}
- City: ${city || "Any"}
- Skills: ${skills || "Not specified"}
- Qualification: ${qualification || "Not specified"}
- Experience: ${experience || "Freshers"}
- Job Type: ${jobType}

Return STRICT JSON only without markdown codeblocks:
{
  "matchingRoles": ["Role 1", "Role 2", "Role 3"],
  "whyMatched": "Explanation in ${language}",
  "missingSkills": ["Skill 1", "Skill 2"],
  "suggestedSkills": ["Suggested Skill 1", "Suggested Skill 2"],
  "resumeTips": "Actionable ATS resume advice in ${language}",
  "interviewPrep": "Key interview topics to practice in ${language}",
  "searchKeywords": ["Keyword 1", "Keyword 2"],
  "jobCategories": ["Category 1", "Category 2"]
}`;

    const rawResponse = await generateGeminiResponse({ prompt });
    const cleanJson = rawResponse.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

    const parsed = JSON.parse(cleanJson);
    aiRecommendation = {
      matchingRoles: Array.isArray(parsed.matchingRoles) ? parsed.matchingRoles : [],
      whyMatched: parsed.whyMatched || "",
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      suggestedSkills: Array.isArray(parsed.suggestedSkills) ? parsed.suggestedSkills : [],
      resumeTips: parsed.resumeTips || "",
      interviewPrep: parsed.interviewPrep || "",
      searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords : [],
      jobCategories: Array.isArray(parsed.jobCategories) ? parsed.jobCategories : [],
    };
  } catch (err) {
    console.warn("AI recommendation generation fallback:", err.message);
  }

  return {
    isLive,
    liveJobs,
    aiRecommendation,
  };
}