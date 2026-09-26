import ProjectDetailClient from '@/components/project/project-detail';
import { mockProjects } from '@/lib/mock-data';

export function generateStaticParams() {
  return mockProjects.map((project) => ({ id: project.id }));
}

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  return <ProjectDetailClient id={id} />;
}
