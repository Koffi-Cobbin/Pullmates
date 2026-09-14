import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | PullMates',
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Notifications</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Notifications page placeholder — alerts and activity updates.
      </p>
    </div>
  );
}
