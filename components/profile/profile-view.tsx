'use client';

import Link from 'next/link';
import { ProjectStage } from '@/lib/types';
import { useProfile, useProfileProjects } from '@/lib/supabase/hooks';

const stageBadgeStyles: Record<ProjectStage, string> = {
  [ProjectStage.IDEA_PRIVATE]: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  [ProjectStage.IDEA_PUBLIC]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  [ProjectStage.BUILDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  [ProjectStage.LAUNCHED]: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  [ProjectStage.MAINTAINED]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
};

const stageLabels: Record<ProjectStage, string> = {
  [ProjectStage.IDEA_PRIVATE]: 'Private Idea',
  [ProjectStage.IDEA_PUBLIC]: 'Public Idea',
  [ProjectStage.BUILDING]: 'Building',
  [ProjectStage.LAUNCHED]: 'Launched',
  [ProjectStage.MAINTAINED]: 'Maintained',
};

export default function ProfileView({ username }: { username: string }) {
  const { data: profile, isLoading } = useProfile(username);
  const ownerId = profile?.user.id;
  const { data: projects = [], isLoading: projectsLoading } = useProfileProjects(ownerId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <div className="h-48 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
        <div className="h-40 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">User not found</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            @{username} doesn&apos;t exist or isn&apos;t available.
          </p>
          <Link
            href="/feed"
            className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const { user, fullName, skills, links } = profile;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Profile header */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          <img
            src={
              user.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
            }
            alt={user.username}
            className="h-16 w-16 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {fullName || `@${user.username}`}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</span>
            </div>
            {fullName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
            )}
            {user.bio && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {user.bio}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.11-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.67.8.55A10.52 10.52 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
                </svg>
                {user.githubUsername}
              </a>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/50 px-2.5 py-1 font-medium text-orange-700 dark:text-orange-300">
                {user.reputationScore} reputation
              </span>
            </div>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mt-5 border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Links</h3>
            <div className="flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Their projects */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Projects by @{user.username}
        </h2>
        {projectsLoading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
            <div className="h-24 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">No projects yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group block rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all hover:border-orange-200 dark:hover:border-orange-500/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stageBadgeStyles[project.stage]}`}
                  >
                    {stageLabels[project.stage]}
                  </span>
                  {project.visibility === 'private' && (
                    <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      Private
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                )}
                {project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
