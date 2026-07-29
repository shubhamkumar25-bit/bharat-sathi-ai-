import { Link } from 'react-router-dom';
import { appPaths } from '@/constants/paths';
import { ArrowRight, Briefcase, GraduationCap, Target, TrendingUp, Users, Zap, Code } from 'lucide-react';

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-hero-gradient py-12 sm:py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-slate-950 dark:text-white sm:text-5xl">
              Career Opportunities at BharatSaathi AI
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Join us in building technology that empowers millions of Indians
            </p>
          </div>

          {/* Why Join Us */}
          <section className="mb-16">
            <h2 className="mb-8 text-2xl font-semibold text-slate-950 dark:text-white">Why Join Us?</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Target,
                  title: 'Impactful Work',
                  description: 'Build products that help students, farmers, and workers across India'
                },
                {
                  icon: TrendingUp,
                  title: 'Growth',
                  description: 'Work with cutting-edge AI technologies and grow your skills'
                },
                {
                  icon: Users,
                  title: 'Inclusive Culture',
                  description: 'Be part of a diverse team that values every perspective'
                },
                {
                  icon: Zap,
                  title: 'Innovation',
                  description: 'Solve real problems with creative solutions'
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="glass rounded-2xl p-6 transition hover:-translate-y-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Open Positions */}
          <section className="mb-16">
            <h2 className="mb-8 text-2xl font-semibold text-slate-950 dark:text-white">Open Positions</h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Frontend Developer',
                  department: 'Engineering',
                  location: 'Remote',
                  type: 'Full-time',
                  icon: Code
                },
                {
                  title: 'Backend Developer',
                  department: 'Engineering',
                  location: 'Remote',
                  type: 'Full-time',
                  icon: Briefcase
                },
                {
                  title: 'AI/ML Engineer',
                  department: 'Engineering',
                  location: 'Remote',
                  type: 'Full-time',
                  icon: GraduationCap
                },
                {
                  title: 'Product Designer',
                  department: 'Design',
                  location: 'Remote',
                  type: 'Full-time',
                  icon: Target
                }
              ].map((job, index) => {
                const Icon = job.icon;
                return (
                  <div key={index} className="glass rounded-2xl p-6 transition hover:-translate-y-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{job.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{job.department}</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{job.location}</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{job.type}</span>
                          </div>
                        </div>
                      </div>
                      <button className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
                        Apply Now
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Our Culture */}
          <section className="mb-16">
            <h2 className="mb-8 text-2xl font-semibold text-slate-950 dark:text-white">Our Culture</h2>
            <div className="glass rounded-2xl p-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">What We Value</h3>
                  <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                      <span>Transparency and open communication</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                      <span>Continuous learning and improvement</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                      <span>User-centric problem solving</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                      <span>Collaboration over competition</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">Benefits</h3>
                  <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                      <span>Competitive salary and equity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                      <span>Flexible work hours and remote-first culture</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                      <span>Learning and development budget</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                      <span>Health insurance and wellness benefits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="glass rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">Ready to Make an Impact?</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Join our team and help us build technology that matters.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={appPaths.dashboard}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://www.codechef.com/users/muktai_123"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-saffron-300 hover:text-saffron-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-saffron-700"
              >
                Check CodeChef Profile
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://www.skillsbuilder.uk/universal-framework"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-saffron-300 hover:text-saffron-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-saffron-700"
              >
                Skills Builder Framework
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
