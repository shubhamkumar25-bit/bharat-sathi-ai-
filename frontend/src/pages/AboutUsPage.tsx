import logo from '../assets/logo.png.png';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-hero-gradient py-12 sm:py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <img
                src={logo}
                alt="BharatSaathi AI Logo"
                className="h-16 w-16 object-contain"
              />
              <h1 className="text-4xl font-bold text-slate-950 dark:text-white sm:text-5xl">
                BharatSaathi AI
              </h1>
            </div>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              AI-Powered Career & Education Platform for India
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950 sm:p-12">
            <section>
              <h2 className="mb-4 text-2xl font-semibold text-slate-950 dark:text-white">
                About BharatSaathi AI
              </h2>
              <p className="text-base leading-7 text-slate-700 dark:text-slate-200">
                <strong className="text-slate-950 dark:text-white">BharatSaathi AI</strong> is an AI-powered career and education platform built to empower students, job seekers, fresh graduates, and underserved communities across India. Our mission is to bridge the gap between talent and opportunity by making career guidance, employment resources, skill development, and government welfare information accessible through a single, easy-to-use platform.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-200">
                We understand that millions of people struggle with choosing the right career path, creating ATS-friendly resumes, discovering relevant job opportunities, preparing for interviews, and understanding government schemes due to scattered information, language barriers, and limited access to guidance. BharatSaathi AI brings all these essential services together in one place.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-200">
                Our platform offers personalized AI-powered career guidance, professional resume building, interview preparation, job and internship discovery, skill recommendations, scholarship and government scheme assistance, and multilingual support to help users confidently navigate every stage of their career journey.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-200">
                Designed with accessibility and inclusivity at its core, BharatSaathi AI supports learners from both urban and rural India, enabling them to make informed decisions, improve employability, and unlock opportunities regardless of their background.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-200">
                Whether you're a student exploring career options, a fresher preparing for your first job, a professional looking to upskill, or someone seeking government benefits, BharatSaathi AI is your trusted digital companion—helping you learn, grow, and succeed.
              </p>
            </section>

            <div className="grid gap-6 sm:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 text-xl font-semibold text-slate-950 dark:text-white">
                  Our Vision
                </h3>
                <p className="text-base leading-7 text-slate-700 dark:text-slate-200">
                  To build an inclusive AI-powered ecosystem where every individual in India has equal access to career guidance, learning opportunities, jobs, and government resources.
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 text-xl font-semibold text-slate-950 dark:text-white">
                  Our Mission
                </h3>
                <p className="text-base leading-7 text-slate-700 dark:text-slate-200">
                  Empower every learner and job seeker with personalized AI assistance, practical career tools, and trusted information, making career success accessible to everyone.
                </p>
              </section>
            </div>

            <section>
              <h3 className="mb-4 text-xl font-semibold text-slate-950 dark:text-white">
                What We Offer
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  'AI-powered career guidance',
                  'Professional resume building',
                  'Interview preparation',
                  'Job and internship discovery',
                  'Skill recommendations',
                  'Government scheme assistance',
                  'Scholarship information',
                  'Multilingual support'
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-base text-slate-700 dark:text-slate-200">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-saffron-500"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Made with ❤️ for India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
