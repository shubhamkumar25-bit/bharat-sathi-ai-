import { Link } from 'react-router-dom';
import { appPaths } from '@/constants/paths';
import { ArrowRight, Calendar, Clock, User, Tag, TrendingUp, BookOpen, Lightbulb, Heart } from 'lucide-react';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: 'Building AI Solutions for Rural India',
      excerpt: 'How BharatSaathi AI is bridging the digital divide and bringing AI-powered assistance to farmers, students, and workers in rural communities.',
      author: 'Muktai Indraksha',
      date: 'July 2024',
      readTime: '5 min read',
      category: 'Technology',
      icon: TrendingUp
    },
    {
      id: 2,
      title: 'The Future of Career Guidance in India',
      excerpt: 'Exploring how AI and machine learning are transforming career counseling and helping job seekers make informed decisions.',
      author: 'Muktai Indraksha',
      date: 'June 2024',
      readTime: '4 min read',
      category: 'Career',
      icon: BookOpen
    },
    {
      id: 3,
      title: 'Government Schemes Made Simple',
      excerpt: 'A comprehensive guide to understanding and accessing government schemes for education, agriculture, and employment.',
      author: 'Muktai Indraksha',
      date: 'May 2024',
      readTime: '6 min read',
      category: 'Government',
      icon: Lightbulb
    },
    {
      id: 4,
      title: 'Empowering Women Through Digital Literacy',
      excerpt: 'Stories of how digital tools and AI assistance are helping women entrepreneurs and self-help groups across India.',
      author: 'Muktai Indraksha',
      date: 'April 2024',
      readTime: '5 min read',
      category: 'Social Impact',
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-hero-gradient py-12 sm:py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-slate-950 dark:text-white sm:text-5xl">
              Blog
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Insights, stories, and updates from the BharatSaathi AI team
            </p>
          </div>

          {/* Featured Post */}
          <section className="mb-16">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="bg-gradient-to-br from-saffron-500/20 to-indigo-500/20 p-8 lg:p-12">
                  <span className="inline-flex items-center gap-2 rounded-full bg-saffron-100 px-3 py-1 text-sm font-medium text-saffron-700 dark:bg-saffron-900/50 dark:text-saffron-300">
                    <TrendingUp className="h-4 w-4" />
                    Featured
                  </span>
                  <h2 className="mt-6 text-2xl font-bold text-slate-950 dark:text-white lg:text-3xl">
                    Building AI Solutions for Rural India
                  </h2>
                  <p className="mt-4 text-slate-600 dark:text-slate-300">
                    How BharatSaathi AI is bridging the digital divide and bringing AI-powered assistance to farmers, students, and workers in rural communities.
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Muktai Indraksha</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>July 2024</span>
                    </div>
                  </div>
                  <a
                    href="https://muktaiindraksha.edublogs.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    Read Full Article
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="relative hidden lg:block">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
                  <div className="relative h-full flex items-center justify-center p-12">
                    <div className="text-center">
                      <BookOpen className="mx-auto h-24 w-24 text-saffron-500" />
                      <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
                        Latest Insights
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="mb-16">
            <h2 className="mb-8 text-2xl font-semibold text-slate-950 dark:text-white">Recent Posts</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {blogPosts.map((post) => {
                const Icon = post.icon;
                return (
                  <article key={post.id} className="glass rounded-2xl p-6 transition hover:-translate-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{post.category}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">{post.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Categories */}
          <section className="mb-16">
            <h2 className="mb-8 text-2xl font-semibold text-slate-950 dark:text-white">Categories</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Technology', count: 12, icon: TrendingUp },
                { name: 'Career', count: 8, icon: BookOpen },
                { name: 'Government Schemes', count: 6, icon: Lightbulb },
                { name: 'Social Impact', count: 10, icon: Heart }
              ].map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={index} className="glass rounded-xl p-4 transition hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-950 dark:text-white">{category.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{category.count} posts</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="glass rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">Visit Our Full Blog</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Read more articles, insights, and stories on our Edublogs platform.
            </p>
            <a
              href="https://muktaiindraksha.edublogs.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              Visit Edublogs
              <ArrowRight className="h-4 w-4" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
