import { useState } from "react";
import { Search, Copy, ExternalLink, Loader2 } from "lucide-react";

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "United Arab Emirates",
  "Singapore"
];

export function JobSearchPage() {
  // Country & Location States
  const [country, setCountry] = useState("India");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  
  // Job Preference States
  const [qualification, setQualification] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [jobType, setJobType] = useState("Full Time");
  const [language, setLanguage] = useState("English");
  
  // UI & Response States
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [rawJsonResult, setRawJsonResult] = useState("");
  const [jobSearchUrl, setJobSearchUrl] = useState("");

  // Simulated RAG Document Retrieval Mock
  async function fetchRAGContext(query: string) {
    // Replace this string with an actual fetch request to your vector database if needed
    return `[Context: Live vector database match embeddings for query metadata: ${query}]`;
  }

  async function searchJobs() {
    try {
      setLoading(true);
      setJobs([]);
      setRawJsonResult("");

      const queryPayload = `${skills} ${city} ${stateName} ${country} ${jobType}`;
      const encodedKeyword = encodeURIComponent(queryPayload);
      setJobSearchUrl(encodedKeyword);

      // 1. RAG Context Stage
      const ragContextDocs = await fetchRAGContext(queryPayload);

      // 2. Direct HTTP Fetch to Groq API (No SDK required)
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || ""; 
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Fast, accurate model supporting JSON Mode
          response_format: { type: "json_object" }, // Forces valid programmatic JSON output
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `You are BharatSaathi AI. Find 10 real job opportunities based on the RAG context provided. 
              You must return ONLY a valid JSON object matching the requested schema. No markdown wrapping blocks.`
            },
            {
              role: "user",
              content: `
              Criteria:
              - Country: ${country}
              - State: ${stateName || "Any"}
              - City: ${city || "Any"}
              - Qualification: ${qualification}
              - Skills: ${skills}
              - Experience: ${experience}
              - Job Type: ${jobType}
              - Language Output: ${language}

              RAG Vector Matches:
              ${ragContextDocs}

              Return JSON object format:
              {
                "jobs": [
                  {
                    "title": "",
                    "company": "",
                    "location": "",
                    "salary": "",
                    "type": "",
                    "description": "",
                    "linkedin": "",
                    "naukri": "",
                    "indeed": ""
                  }
                ]
              }
              `
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content || "{}";
      
      setRawJsonResult(responseText);
      const parsedData = JSON.parse(responseText);
      setJobs(parsedData.jobs || []);

    } catch (error) {
      console.error("Processing Failed:", error);
      alert(error instanceof Error ? error.message : "Job Fetch Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        🤖 AI Job Search <span className="text-sm font-normal bg-gray-100 text-gray-700 px-3 py-1 rounded-full border">Groq REST RAG Pipeline</span>
      </h1>

      {/* Input panel */}
      <div className="grid md:grid-cols-2 gap-5 bg-gray-50 p-6 rounded-2xl border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            className="w-full border bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countries.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State / Region</label>
          <input
            className="w-full border bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Maharashtra, California"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            className="w-full border bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Mumbai, London"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
          <input
            className="w-full border bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. React, Node.js, Python"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
          <input
            className="w-full border bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. B.Tech Computer Science"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
          <input
            className="w-full border bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Freshers, 3 Years"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Commitment</label>
          <select
            className="w-full border bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option>Full Time</option>
            <option>Part Time</option>
            <option>Internship</option>
            <option>Remote</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AI Preferred Language</label>
          <select
            className="w-full border bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>

      <button
        onClick={searchJobs}
        disabled={loading}
        className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl px-6 py-3.5 flex items-center gap-2 shadow-lg transition"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        {loading ? "Parsing Documents via Groq..." : "Perform Intelligent Search"}
      </button>

      {/* Results View Container */}
      {(rawJsonResult || loading) && (
        <div className="mt-10 rounded-2xl border bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">🎯 AI Matches</h2>
            {rawJsonResult && (
              <button
                onClick={() => navigator.clipboard.writeText(rawJsonResult)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
              >
                <Copy size={16} /> Copy Raw Data
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="font-medium animate-pulse">Running semantic contextual generation framework...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {jobs.map((job: any, index: number) => (
                <div key={index} className="rounded-2xl border p-5 shadow-sm bg-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">💼 {job.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>🏢 <strong>Company:</strong> {job.company}</p>
                      <p>📍 <strong>Location:</strong> {job.location}</p>
                      <p>💰 <strong>Salary:</strong> {job.salary || "Not Disclosed"}</p>
                      <p>🕒 <strong>Type:</strong> {job.type}</p>
                    </div>
                    <p className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-dashed">
                      {job.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t flex gap-2 flex-wrap text-xs font-semibold">
                    {job.linkedin && (
                      <a href={job.linkedin} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1">
                        LinkedIn <ExternalLink size={12} />
                      </a>
                    )}
                    {job.naukri && (
                      <a href={job.naukri} target="_blank" rel="noreferrer" className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center gap-1">
                        Naukri <ExternalLink size={12} />
                      </a>
                    )}
                    {job.indeed && (
                      <a href={job.indeed} target="_blank" rel="noreferrer" className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-1">
                        Indeed <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 text-amber-800 p-5 font-medium">
              No matching data objects could be verified. Modify inputs and try again.
            </div>
          )}

          {/* Backup External Engine Searches */}
          {jobSearchUrl && (
            <div className="mt-10 pt-6 border-t">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Fallback Global Directories</h4>
              <div className="flex gap-3 flex-wrap">
                <a href={`https://www.linkedin.com/jobs/search/?keywords=${jobSearchUrl}`} target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl">
                  Search LinkedIn
                </a>
                <a href={`https://www.naukri.com/${jobSearchUrl}-jobs`} target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl">
                  Search Naukri
                </a>
                <a href={`https://in.indeed.com/jobs?q=${jobSearchUrl}`} target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl">
                  Search Indeed
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}