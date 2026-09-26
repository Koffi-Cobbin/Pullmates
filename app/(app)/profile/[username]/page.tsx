import type { Metadata } from 'next';
import ProfileView from '@/components/profile/profile-view';
import { mockUsers } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Profile',
};

export function generateStaticParams() {
  return mockUsers.map((user) => ({ username: user.username }));
}

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return <ProfileView username={username} />;
}
