import { Link } from 'react-router-dom';
import { appPaths } from '@/constants/paths';
import { MapPin } from 'lucide-react';

export default function TeamPage() {
  const teamMembers = [
    {
      name: 'Shubham Kumar',
      role: 'Founder & Lead Developer',
      image: '/images/team-photo.jpg',
      bio: 'Visionary technologist building AI-powered solutions to bridge the digital divide in rural India. Spearheading the technical architecture and development of BharatSaathi AI platform.'
    },
    {
      name: 'Muktai Indraksha',
      role: 'Co-Founder & Head of PBL',
      image: '/images/id-card-photo.png',
      bio: 'Strategic leader driving Project-Based Learning initiatives and community engagement. Championing inclusive education and social impact through technology across India.'
    }
  ];

  return (
    <div className="min-h-screen bg-hero-gradient py-12 sm:py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-slate-950 dark:text-white sm:text-5xl">
              Our Team
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Meet the passionate individuals behind BharatSaathi AI
            </p>
          </div>

          {/* Team Members Grid */}
          <section className="mb-16">
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="glass rounded-2xl overflow-hidden transition hover:-translate-y-1">
                  <div className="relative h-96 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{member.name}</h3>
                    <p className="mt-2 text-base font-semibold text-saffron-600 dark:text-saffron-400 uppercase tracking-wide">{member.role}</p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Join Us CTA */}
          <section className="glass rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">Join Our Team</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              We're always looking for passionate individuals who want to make a difference.
            </p>
            <Link
              to={appPaths.careers}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              View Open Positions
              <MapPin className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
