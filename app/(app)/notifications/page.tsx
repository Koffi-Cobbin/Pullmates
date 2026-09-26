import type { Metadata } from 'next';
import AuthGuard from '@/components/auth-guard';
import NotificationsList from '@/components/notifications/notifications-list';

export const metadata: Metadata = {
  title: 'Notifications',
};

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsList />
    </AuthGuard>
  );
}
