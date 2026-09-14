import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Project | PullMates',
};

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Project</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Editing project <span className="font-mono text-sm">{id}</span> — form placeholder.
      </p>
    </div>
  );
}
