import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project | PullMates',
};

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Project Detail</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Viewing project <span className="font-mono text-sm">{id}</span> — placeholder.
      </p>
    </div>
  );
}
