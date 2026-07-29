import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { appPaths } from '@/constants/paths';
import { ArrowRight, Bot, FileText, ShieldCheck, Sparkles, Mic, ChevronLeft, ChevronRight } from 'lucide-react';

const highlights = [
  {
    icon: Bot,
    title: 'AI Chatbot',
    description: 'Simple Hindi and English answers for students, job seekers, farmers, and workers.'
  },
  {
    icon: Mic,
    title: 'Voice Support',
    description: 'Speech input and output for hands-free guidance on any device.'
  },
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'Create a structured resume and career-ready summary in minutes.'
  },
  {
    icon: ShieldCheck,
    title: 'Scheme Finder',
    description: 'Find relevant government schemes with eligibility and document guidance.'
  }
];





const impactImages = [
  {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=600&fit=crop',
    alt: 'Students learning together in classroom'
  },
  {
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop',
    alt: 'Worker using phone for career guidance'
  },
  {
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&h=600&fit=crop',
    alt: 'Farmer using smartphone in field'
  },
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=600&fit=crop',
    alt: 'Youth from diverse backgrounds using technology'
  }
];

function ImpactGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % impactImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + impactImages.length) % impactImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % impactImages.length);
  };

  return (
    <section className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
      <div className="relative aspect-[2/1] sm:aspect-[21/9]">
        {impactImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        ))}
        
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg transition hover:bg-white hover:scale-110 dark:bg-slate-900/90 dark:text-white"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg transition hover:bg-white hover:scale-110 dark:bg-slate-900/90 dark:text-white"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {impactImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="space-y-10 py-8 sm:py-12">
      <section className="hero-frame relative overflow-hidden p-8 sm:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.16),transparent_36%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              BharatSaathi AI helps people find guidance, jobs, schemes, and next steps in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
              A ready foundation for AI chat, voice support, career guidance, resume building, and government scheme discovery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={appPaths.chat}
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Start AI Chat
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={appPaths.dashboard}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-saffron-300 hover:text-saffron-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-saffron-700"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/75 p-5 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="rounded-2xl bg-slate-950 p-5 text-white dark:bg-slate-950">
              <p className="text-sm text-slate-300">Project focus</p>
              <p className="mt-2 text-2xl font-semibold">AI + Voice + Career Tools</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Designed for students, workers, and farmers with simple Hindi-first support.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['6+', 'Ready screens'],
                ['1', 'Responsive shell'],
                ['5', ' days']
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ImpactGallery />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="glass rounded-3xl p-6 transition hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}