import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Pullmates - Where Developers Find Their Perfect Team',
  description:
    'A collaborative platform for developers to showcase projects, find collaborators, and build amazing things together.',
};

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    title: 'Showcase Your Projects',
    description: 'Share your ideas, work-in-progress, or finished projects. From private ideas to public showcases.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Find Collaborators',
    description: 'Connect with developers who share your vision. Find the perfect teammates for your next project.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'GitHub Auto-Fill',
    description: 'Link your repo and instantly populate project details. Stars, issues, README - all synced automatically.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Track Progress',
    description: 'Post updates, share milestones, and keep your community engaged throughout the development journey.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: 'Real-time Collaboration',
    description: 'Discuss ideas, comment on updates, and collaborate seamlessly with your team members.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Verified Profiles',
    description: 'Build trust with GitHub-linked profiles. See contribution history and skills at a glance.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up with GitHub and showcase your skills, experience, and previous projects.',
  },
  {
    step: '02',
    title: 'Post a Project',
    description: 'Share your idea or link an existing repo. Define what help you need and what roles are open.',
  },
  {
    step: '03',
    title: 'Find Your Team',
    description: 'Browse projects, request to join, and start collaborating with developers who share your interests.',
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-50 via-gray-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-orange-200/40 to-pink-200/40 dark:from-orange-500/10 dark:to-pink-500/10 blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 animate-pulse" />
            Now in Early Access
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight text-navy-800 dark:text-white sm:text-7xl">
            Where Developers
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"> Find Their Team</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
            A collaborative platform for developers to showcase projects, find collaborators, 
            and build amazing things together. From private ideas to public launches.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/api/auth/signin"
              className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:from-orange-600 hover:to-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/feed"
              className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 transition-colors"
            >
              Browse Projects
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Free for open source projects. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 sm:py-32 lg:px-8 bg-white/50 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-800 dark:text-white sm:text-4xl">
              Everything you need to collaborate
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Pullmates combines project showcases, team matching, and real-time collaboration 
              into one seamless experience.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-8 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/50 dark:to-pink-900/50 text-orange-600 dark:text-orange-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-navy-800 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-800 dark:text-white sm:text-4xl">
              How Pullmates works
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Get started in three simple steps and start building with your perfect team.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {steps.map((step) => (
                <div key={step.step} className="relative text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-2xl font-bold text-white shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-navy-800 dark:text-white">{step.title}</h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-24 sm:py-32 lg:px-8 bg-white/50 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-800 dark:text-white sm:text-4xl">
              Trusted by developers worldwide
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">500+</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Active Developers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">1,200+</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Projects Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">3,000+</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Collaborations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy-800 dark:text-white sm:text-4xl">
            Ready to find your team?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Join thousands of developers who are building amazing projects together.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/api/auth/signin"
              className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:from-orange-600 hover:to-pink-600 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Pullmates"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-navy-800 dark:text-white">Pullmates</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Pullmates. Build together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
