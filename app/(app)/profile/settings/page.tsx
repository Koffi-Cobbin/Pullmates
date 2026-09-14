'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications'>('profile');

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Please sign in</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">You need to be signed in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'account'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Notifications
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h2>
            <div className="flex items-center gap-6">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="h-20 w-20 rounded-full"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <button className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Change Photo
                </button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  defaultValue={session.user?.name || ''}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GitHub Username
                </label>
                <input
                  type="text"
                  id="github"
                  defaultValue={session.user?.name?.toLowerCase().replace(/\s/g, '') || ''}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
                />
              </div>
              <div className="pt-4">
                <button className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add skills to help others find you for collaboration.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['React', 'TypeScript', 'Node.js', 'Python'].map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/50 px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-300"
                >
                  {skill}
                  <button className="ml-1 hover:text-orange-900 dark:hover:text-orange-100">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill..."
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
              />
              <button className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-8">
          {/* Email */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Address</h2>
            <div className="flex items-center gap-4">
              <input
                type="email"
                defaultValue={session.user?.email || ''}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-colors"
              />
              <button className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Update
              </button>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connected Accounts</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">GitHub</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connected</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Project Updates</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when projects you follow are updated</p>
                </div>
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-orange-500 transition-colors cursor-pointer" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Join Requests</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone wants to join your project</p>
                </div>
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-orange-500 transition-colors cursor-pointer" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New Messages</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive new messages</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-orange-500 transition-colors cursor-pointer" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Push Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Browser Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in your browser</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-orange-500 transition-colors cursor-pointer" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm">
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
