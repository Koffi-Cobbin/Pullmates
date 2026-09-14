'use client';

import Link from 'next/link';
import { ProjectStage } from '@/lib/types';
import { useState } from 'react';

const stageOptions = [
  { value: ProjectStage.IDEA_PRIVATE, label: 'Private Idea', description: 'Only you can see this project' },
  { value: ProjectStage.IDEA_PUBLIC, label: 'Public Idea', description: 'Visible to everyone, looking for collaborators' },
  { value: ProjectStage.BUILDING, label: 'Building', description: 'Actively development in progress' },
  { value: ProjectStage.LAUNCHED, label: 'Launched', description: 'Project is live and available' },
  { value: ProjectStage.MAINTAINED, label: 'Maintained', description: 'Ongoing maintenance and updates' },
];

export default function NewProjectPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addRole = () => {
    if (roleInput.trim() && !roles.includes(roleInput.trim())) {
      setRoles([...roles, roleInput.trim()]);
      setRoleInput('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setRoles(roles.filter(role => role !== roleToRemove));
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Share your project idea and find collaborators to build with.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            placeholder="My Awesome Project"
            required
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Describe your project, its goals, and what you're building..."
            rows={4}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Stage */}
        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Stage
          </label>
          <select
            id="stage"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
          >
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                defaultChecked
                className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
            </label>
          </div>
        </div>

        {/* Repository URL */}
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Repository URL
          </label>
          <input
            type="url"
            id="repoUrl"
            placeholder="https://github.com/username/repo"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/50 px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Press Enter or click Add to add a tag</p>
        </div>

        {/* Roles Wanted */}
        <div>
          <label htmlFor="roles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Roles Wanted
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 rounded-full bg-pink-100 dark:bg-pink-900/50 px-3 py-1 text-sm font-medium text-pink-700 dark:text-pink-300"
              >
                {role}
                <button
                  type="button"
                  onClick={() => removeRole(role)}
                  className="ml-1 hover:text-pink-900 dark:hover:text-pink-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="roles"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
              placeholder="Add a role..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={addRole}
              className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">What roles are you looking for?</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/projects"
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}
