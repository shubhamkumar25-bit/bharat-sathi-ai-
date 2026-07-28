import logo from '../assets/logo.png.png';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactUsPage() {
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
                Contact Us
              </h1>
            </div>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Get in touch with the BharatSaathi AI team
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950 sm:p-12">
            <section>
              <h2 className="mb-6 text-2xl font-semibold text-slate-950 dark:text-white">
                Contact Information
              </h2>
              
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {/* Phone Numbers */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-950 dark:text-white">
                        Phone Numbers
                      </h3>
                      <div className="space-y-1">
                        <a href="tel:+918840091758" className="block text-base text-slate-700 hover:text-saffron-600 dark:text-slate-200 dark:hover:text-saffron-400">
                          +91 8840091758
                        </a>
                        <a href="tel:+918605211354" className="block text-base text-slate-700 hover:text-saffron-600 dark:text-slate-200 dark:hover:text-saffron-400">
                          +91 8605211354
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-950 dark:text-white">
                        Email
                      </h3>
                      <a href="mailto:shubhamkumar25@navgurukul.org" className="block text-base text-slate-700 hover:text-saffron-600 dark:text-slate-200 dark:hover:text-saffron-400">
                        shubhamkumar25@navgurukul.org
                      </a>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 sm:col-span-1 md:col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-400">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-950 dark:text-white">
                        Location
                      </h3>
                      <p className="text-base text-slate-700 dark:text-slate-200">
                        Pune, Maharashtra, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Form */}
            <section className="mt-8">
              <h2 className="mb-6 text-2xl font-semibold text-slate-950 dark:text-white">
                Send us a Message
              </h2>
              
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="How can we help?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </form>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We'll get back to you as soon as possible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
