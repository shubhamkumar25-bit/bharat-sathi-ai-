import { useState } from "react";
import jsPDF from "jspdf";
import { generateTaskOutput } from "@/services/backend";

export function ResumeBuilderPage() {

  const [loading, setLoading] = useState(false);

  const [resume, setResume] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    education: "",
    skills: "",
    experience: "",
    projects: "",
    summary: "",
  });
async function generateResume() {
  try {
    setLoading(true);

    const result = await generateTaskOutput({
      task: "Resume Builder",
      prompt: `
Create a professional ATS Resume.

Name: ${resume.name}

Title: ${resume.title}

Email: ${resume.email}

Phone: ${resume.phone}

Location: ${resume.location}

Education:
${resume.education}

Skills:
${resume.skills}

Experience:
${resume.experience}

Projects:
${resume.projects}

Summary:
${resume.summary}

Return only professional resume.
`,
    });

    setResume({
      ...resume,
      summary: result.answer,
    });

  } catch (err) {
    console.log(err);
    alert("Resume generation failed");
  } finally {
    setLoading(false);
  }
}
function downloadPDF() {

  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text(resume.name || "Your Name", 20, 20);

  doc.setFontSize(16);
  doc.text(resume.title || "", 20, 30);

  doc.setFontSize(12);

  doc.text(`Email: ${resume.email}`,20,45);
  doc.text(`Phone: ${resume.phone}`,20,55);
  doc.text(`Location: ${resume.location}`,20,65);

  doc.text("Professional Summary",20,85);

  doc.text(
    doc.splitTextToSize(resume.summary || "",170),
    20,
    95
  );

  doc.text("Education",20,140);

  doc.text(
    doc.splitTextToSize(resume.education || "",170),
    20,
    150
  );

  doc.addPage();

  doc.text("Skills",20,20);

  doc.text(
    doc.splitTextToSize(resume.skills || "",170),
    20,
    30
  );

  doc.text("Experience",20,90);

  doc.text(
    doc.splitTextToSize(resume.experience || "",170),
    20,
    100
  );

  doc.text("Projects",20,180);

  doc.text(
    doc.splitTextToSize(resume.projects || "",170),
    20,
    190
  );

  doc.save(`${resume.name || "Resume"}.pdf`);

}
  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-100 via-white to-indigo-100 p-8">

      {/* Resume Builder UI Yahan Aayega */}

<div className="max-w-7xl mx-auto">

  <h1 className="text-4xl font-bold mb-8">
    📄 AI Resume Builder
  </h1>

  <div className="grid lg:grid-cols-2 gap-8">

    {/* LEFT SIDE */}

    <div className="bg-white rounded-3xl shadow-xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Personal Information
      </h2>

      <input
        placeholder="Full Name"
        value={resume.name}
        onChange={(e)=>
          setResume({...resume,name:e.target.value})
        }
        className="w-full border rounded-xl p-3 mb-4"
      />

      <input
        placeholder="Professional Title"
        value={resume.title}
        onChange={(e)=>
          setResume({...resume,title:e.target.value})
        }
        className="w-full border rounded-xl p-3 mb-4"
      />

      <input
        placeholder="Email"
        value={resume.email}
        onChange={(e)=>
          setResume({...resume,email:e.target.value})
        }
        className="w-full border rounded-xl p-3 mb-4"
      />

      <input
        placeholder="Phone"
        value={resume.phone}
        onChange={(e)=>
          setResume({...resume,phone:e.target.value})
        }
        className="w-full border rounded-xl p-3 mb-4"
      />

      <input
        placeholder="Location"
        value={resume.location}
        onChange={(e)=>
          setResume({...resume,location:e.target.value})
        }
        className="w-full border rounded-xl p-3 mb-4"
      />

      <textarea
        rows={4}
        placeholder="Professional Summary"
        value={resume.summary}
        onChange={(e)=>
          setResume({...resume,summary:e.target.value})
        }
        className="w-full border rounded-xl p-3 mb-4"
      />
      <textarea
rows={4}
placeholder="Education"
value={resume.education}
onChange={(e)=>
setResume({
...resume,
education:e.target.value
})
}
className="w-full border rounded-xl p-3 mb-4"
/>

<textarea
rows={4}
placeholder="Skills"
value={resume.skills}
onChange={(e)=>
setResume({
...resume,
skills:e.target.value
})
}
className="w-full border rounded-xl p-3 mb-4"
/>

<textarea
rows={4}
placeholder="Experience"
value={resume.experience}
onChange={(e)=>
setResume({
...resume,
experience:e.target.value
})
}
className="w-full border rounded-xl p-3 mb-4"
/>

<textarea
rows={4}
placeholder="Projects"
value={resume.projects}
onChange={(e)=>
setResume({
...resume,
projects:e.target.value
})
}
className="w-full border rounded-xl p-3 mb-6"
/>

 <div className="flex gap-4">

<button
onClick={generateResume}
className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
>
{loading ? "Generating..." : "Generate Resume"}
</button>

<button
onClick={downloadPDF}
className="flex-1 bg-red-600 text-white py-3 rounded-xl"
>
Download PDF
</button>

</div>

    </div>

    {/* RIGHT SIDE */}

    <div className="bg-white rounded-3xl shadow-xl p-8">

      <h1 className="text-4xl font-bold">
        {resume.name || "Your Name"}
      </h1>

      <p className="text-xl text-blue-600 mt-2">
        {resume.title || "Professional Title"}
      </p>

      <div className="mt-5">

        <p>📧 {resume.email || "Email"}</p>

        <p>📱 {resume.phone || "Phone"}</p>

        <p>📍 {resume.location || "Location"}</p>

      </div>

      <div className="mt-8">

        <h2 className="text-xl font-bold">
          Professional Summary
        </h2>
<div className="mt-8">

<h2 className="text-xl font-bold">
Education
</h2>

<p className="mt-2 whitespace-pre-wrap">
{resume.education || "Education"}
</p>

</div>

<div className="mt-8">

<h2 className="text-xl font-bold">
Skills
</h2>

<p className="mt-2 whitespace-pre-wrap">
{resume.skills || "Skills"}
</p>

</div>

<div className="mt-8">

<h2 className="text-xl font-bold">
Experience
</h2>

<p className="mt-2 whitespace-pre-wrap">
{resume.experience || "Experience"}
</p>

</div>

<div className="mt-8">

<h2 className="text-xl font-bold">
Projects
</h2>

<p className="mt-2 whitespace-pre-wrap">
{resume.projects || "Projects"}
</p>

</div>
        <p className="mt-3 whitespace-pre-wrap">
          {resume.summary || "Write your professional summary here..."}
        </p>

      </div>

    </div>

  </div>

</div>
    </div>
  );
}