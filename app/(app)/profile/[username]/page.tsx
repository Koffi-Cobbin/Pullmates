import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | PullMates',
};

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Viewing profile <span className="font-mono text-sm">@{username}</span> — placeholder.
      </p>
    </div>
  );
}
