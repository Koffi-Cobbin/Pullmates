'use client';

import Link from 'next/link';
import { mockProjects } from '@/lib/mock-data';
import { ProjectStage } from '@/lib/types';
import { useState } from 'react';

type FilterType = 'all' | 'ideas' | 'building' | 'launched';

function getStageBadge(stage: ProjectStage) {
  const styles: Record<ProjectStage, string> = {
    [ProjectStage.IDEA_PRIVATE]: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    [ProjectStage.IDEA_PUBLIC]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    [ProjectStage.BUILDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    [ProjectStage.LAUNCHED]: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    [ProjectStage.MAINTAINED]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  };
  
  const labels: Record<ProjectStage, string> = {
    [ProjectStage.IDEA_PRIVATE]: 'Private Idea',
    [ProjectStage.IDEA_PUBLIC]: 'Public Idea',
    [ProjectStage.BUILDING]: 'Building',
    [ProjectStage.LAUNCHED]: 'Launched',
    [ProjectStage.MAINTAINED]: 'Maintained',
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[stage]}`}>
      {labels[stage]}
    </span>
  );
}

function filterProjects(projects: typeof mockProjects, filter: FilterType) {
  const publicProjects = projects.filter(p => p.visibility === 'public');
  
  switch (filter) {
    case 'ideas':
      return publicProjects.filter(p => p.stage === ProjectStage.IDEA_PRIVATE || p.stage === ProjectStage.IDEA_PUBLIC);
    case 'building':
      return publicProjects.filter(p => p.stage === ProjectStage.BUILDING);
    case 'launched':
      return publicProjects.filter(p => p.stage === ProjectStage.LAUNCHED || p.stage === ProjectStage.MAINTAINED);
    default:
      return publicProjects;
  }
}

function getFilterButtonStyle(isActive: boolean) {
  if (isActive) {
    return 'rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm';
  }
  return 'rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
}

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const filteredProjects = filterProjects(mockProjects, activeFilter);
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Projects</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Browse all public projects on PullMates.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
          >
            + New Project
          </Link>
        </div>
        
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={getFilterButtonStyle(activeFilter === 'all')}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('ideas')}
            className={getFilterButtonStyle(activeFilter === 'ideas')}
          >
            Ideas
          </button>
          <button
            onClick={() => setActiveFilter('building')}
            className={getFilterButtonStyle(activeFilter === 'building')}
          >
            Building
          </button>
          <button
            onClick={() => setActiveFilter('launched')}
            className={getFilterButtonStyle(activeFilter === 'launched')}
          >
            Launched
          </button>
        </div>
        
        {/* Project List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all hover:border-orange-200 dark:hover:border-orange-500/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Stage Badge */}
                  <div className="mb-2">
                    {getStageBadge(project.stage)}
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {project.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 5 && (
                      <span className="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
                        +{project.tags.length - 5}
                      </span>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {/* Owner */}
                    <div className="flex items-center gap-2">
                      <img
                        src={project.owner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.owner.username}`}
                        alt={project.owner.username}
                        className="h-5 w-5 rounded-full"
                      />
                      <span>{project.owner.username}</span>
                    </div>
                    
                    {/* Roles Wanted */}
                    {project.rolesWanted.length > 0 && (
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        Looking for: {project.rolesWanted.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Repo Stats */}
                {project.repoSyncedData && (
                  <div className="flex flex-col items-end gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {(project.repoSyncedData as { stars?: number }).stars && (
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {(project.repoSyncedData as { stars: number }).stars}
                      </span>
                    )}
                    {(project.repoSyncedData as { language?: string }).language && (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        {(project.repoSyncedData as { language: string }).language}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No projects found</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Be the first to create a project!
            </p>
            <Link
              href="/projects/new"
              className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
            >
              Create Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
