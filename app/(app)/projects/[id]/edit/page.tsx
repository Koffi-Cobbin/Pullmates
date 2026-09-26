import type { Metadata } from 'next';
import { mockProjects } from '@/lib/mock-data';
import AuthGuard from '@/components/auth-guard';
import ProjectEditForm from '@/components/project/project-edit-form';

export const metadata: Metadata = {
  title: 'Edit Project',
};

export function generateStaticParams() {
  return mockProjects.map((project) => ({ id: project.id }));
}

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;

  return (
    <AuthGuard>
      <ProjectEditForm id={id} />
    </AuthGuard>
  );
}
