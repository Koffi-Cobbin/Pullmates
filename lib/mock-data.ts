/**
 * Mock data for PullMates frontend development and testing.
 * Matches TypeScript types defined in lib/types.ts.
 */

import type {
  User,
  Skill,
  ProfileLink,
  Project,
  ProjectMember,
  JoinRequest,
  Update,
  Comment,
  Reaction,
  Notification,
} from './types';
import { ProjectStage } from './types';

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const mockSkills: Skill[] = [
  { id: 'skill-1', name: 'TypeScript' },
  { id: 'skill-2', name: 'React' },
  { id: 'skill-3', name: 'Next.js' },
  { id: 'skill-4', name: 'Node.js' },
  { id: 'skill-5', name: 'Python' },
  { id: 'skill-6', name: 'Django' },
  { id: 'skill-7', name: 'PostgreSQL' },
  { id: 'skill-8', name: 'Tailwind CSS' },
  { id: 'skill-9', name: 'GraphQL' },
  { id: 'skill-10', name: 'Docker' },
  { id: 'skill-11', name: 'AWS' },
  { id: 'skill-12', name: 'Figma' },
  { id: 'skill-13', name: 'UI/UX Design' },
  { id: 'skill-14', name: 'DevOps' },
  { id: 'skill-15', name: 'Machine Learning' },
];

// ---------------------------------------------------------------------------
// Profile Links
// ---------------------------------------------------------------------------

export const mockProfileLinks: ProfileLink[] = [
  { id: 'link-1', label: 'GitHub', url: 'https://github.com' },
  { id: 'link-2', label: 'Portfolio', url: 'https://portfolio.dev' },
  { id: 'link-3', label: 'Twitter', url: 'https://twitter.com' },
  { id: 'link-4', label: 'LinkedIn', url: 'https://linkedin.com' },
];

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'sarahdev',
    email: 'sarah@example.com',
    bio: 'Full-stack developer passionate about building tools for developers. Open source contributor.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    githubUsername: 'sarahdev',
    reputationScore: 1250,
    skills: [mockSkills[0], mockSkills[1], mockSkills[2], mockSkills[7]],
    links: [mockProfileLinks[0], mockProfileLinks[1]],
  },
  {
    id: 'user-2',
    username: 'mikecodes',
    email: 'mike@example.com',
    bio: 'Backend engineer specializing in Python and Django. Love working on APIs and data pipelines.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    githubUsername: 'mikecodes',
    reputationScore: 890,
    skills: [mockSkills[4], mockSkills[5], mockSkills[6], mockSkills[9]],
    links: [mockProfileLinks[0], mockProfileLinks[3]],
  },
  {
    id: 'user-3',
    username: 'emilyux',
    email: 'emily@example.com',
    bio: 'UI/UX designer turned developer. Creating beautiful, accessible interfaces.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    githubUsername: 'emilyux',
    reputationScore: 670,
    skills: [mockSkills[1], mockSkills[7], mockSkills[11], mockSkills[12]],
    links: [mockProfileLinks[0], mockProfileLinks[2]],
  },
  {
    id: 'user-4',
    username: 'alexcloud',
    email: 'alex@example.com',
    bio: 'DevOps engineer and cloud architect. Automating everything.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    githubUsername: 'alexcloud',
    reputationScore: 1100,
    skills: [mockSkills[3], mockSkills[9], mockSkills[10], mockSkills[13]],
    links: [mockProfileLinks[0], mockProfileLinks[1]],
  },
  {
    id: 'user-5',
    username: 'jordandata',
    email: 'jordan@example.com',
    bio: 'Data scientist and ML engineer. Building intelligent systems.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    githubUsername: 'jordandata',
    reputationScore: 950,
    skills: [mockSkills[4], mockSkills[14], mockSkills[6], mockSkills[0]],
    links: [mockProfileLinks[0], mockProfileLinks[3]],
  },
];

// Current user (for auth context)
export const mockCurrentUser = mockUsers[0];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    owner: mockUsers[0],
    title: 'DevFlow - Developer Workflow Manager',
    description:
      'A modern developer workflow tool that integrates with GitHub, GitLab, and Bitbucket. Track issues, manage PRs, and automate repetitive tasks with custom workflows.',
    stage: ProjectStage.BUILDING,
    visibility: 'public',
    repoUrl: 'https://github.com/sarahdev/devflow',
    repoSyncedData: {
      name: 'devflow',
      description: 'Modern developer workflow manager',
      stars: 234,
      forks: 45,
      language: 'TypeScript',
      languageBreakdown: { TypeScript: 78, JavaScript: 12, CSS: 10 },
      lastCommitAt: '2026-09-10T14:30:00Z',
      openIssues: [
        {
          title: 'Add GitLab integration',
          url: 'https://github.com/sarahdev/devflow/issues/23',
          labels: ['help wanted', 'enhancement'],
        },
        {
          title: 'Implement webhook notifications',
          url: 'https://github.com/sarahdev/devflow/issues/24',
          labels: ['good first issue'],
        },
      ],
      topics: ['developer-tools', 'github', 'workflow', 'automation'],
    },
    tags: ['TypeScript', 'React', 'GitHub API', 'Developer Tools'],
    rolesWanted: ['Backend Developer', 'DevOps Engineer'],
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-10T14:30:00Z',
    lastActivityAt: '2026-09-10T14:30:00Z',
  },
  {
    id: 'proj-2',
    owner: mockUsers[1],
    title: 'APIForge - REST API Generator',
    description:
      'Generate production-ready REST APIs from database schemas. Supports PostgreSQL, MySQL, and SQLite. Includes authentication, rate limiting, and documentation generation.',
    stage: ProjectStage.LAUNCHED,
    visibility: 'public',
    repoUrl: 'https://github.com/mikecodes/apiforge',
    repoSyncedData: {
      name: 'apiforge',
      description: 'Generate REST APIs from database schemas',
      stars: 567,
      forks: 89,
      language: 'Python',
      languageBreakdown: { Python: 85, JavaScript: 10, HTML: 5 },
      lastCommitAt: '2026-09-08T09:15:00Z',
      openIssues: [
        {
          title: 'Add MongoDB support',
          url: 'https://github.com/mikecodes/apiforge/issues/45',
          labels: ['help wanted', 'enhancement'],
        },
      ],
      topics: ['api', 'rest', 'generator', 'python', 'django'],
    },
    tags: ['Python', 'Django', 'REST API', 'Database'],
    rolesWanted: ['Technical Writer', 'Frontend Developer'],
    createdAt: '2026-06-20T08:00:00Z',
    updatedAt: '2026-09-08T09:15:00Z',
    lastActivityAt: '2026-09-08T09:15:00Z',
  },
  {
    id: 'proj-3',
    owner: mockUsers[2],
    title: 'PixelPerfect - Design System Builder',
    description:
      'Create and maintain design systems with built-in accessibility testing. Export to React, Vue, and Svelte components.',
    stage: ProjectStage.IDEA_PUBLIC,
    visibility: 'public',
    repoUrl: null,
    repoSyncedData: null,
    tags: ['Design System', 'UI/UX', 'Accessibility', 'Components'],
    rolesWanted: ['Frontend Developer', 'Designer', 'Accessibility Expert'],
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
    lastActivityAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'proj-4',
    owner: mockUsers[3],
    title: 'CloudDeploy - Zero-Config Deployment',
    description:
      'Deploy any application to any cloud provider with zero configuration. Automatic scaling, monitoring, and cost optimization.',
    stage: ProjectStage.BUILDING,
    visibility: 'public',
    repoUrl: 'https://github.com/alexcloud/clouddeploy',
    repoSyncedData: {
      name: 'clouddeploy',
      description: 'Zero-config deployment tool',
      stars: 189,
      forks: 32,
      language: 'Go',
      languageBreakdown: { Go: 90, Shell: 10 },
      lastCommitAt: '2026-09-12T16:45:00Z',
      openIssues: [],
      topics: ['deployment', 'cloud', 'devops', 'kubernetes'],
    },
    tags: ['Go', 'Docker', 'Kubernetes', 'Cloud', 'DevOps'],
    rolesWanted: ['Go Developer', 'Cloud Architect'],
    createdAt: '2026-07-10T09:00:00Z',
    updatedAt: '2026-09-12T16:45:00Z',
    lastActivityAt: '2026-09-12T16:45:00Z',
  },
  {
    id: 'proj-5',
    owner: mockUsers[4],
    title: 'DataLens - Data Visualization Platform',
    description:
      'Interactive data visualization platform with drag-and-drop interface. Connect to any database and create beautiful charts and dashboards.',
    stage: ProjectStage.BUILDING,
    visibility: 'public',
    repoUrl: 'https://github.com/jordandata/datalens',
    repoSyncedData: {
      name: 'datalens',
      description: 'Interactive data visualization platform',
      stars: 312,
      forks: 56,
      language: 'TypeScript',
      languageBreakdown: { TypeScript: 70, Python: 20, CSS: 10 },
      lastCommitAt: '2026-09-11T11:20:00Z',
      openIssues: [
        {
          title: 'Add chart export to PNG/PDF',
          url: 'https://github.com/jordandata/datalens/issues/34',
          labels: ['good first issue', 'enhancement'],
        },
      ],
      topics: ['data-visualization', 'charts', 'dashboard', 'analytics'],
    },
    tags: ['TypeScript', 'React', 'Data Visualization', 'D3.js'],
    rolesWanted: ['Data Engineer', 'Frontend Developer'],
    createdAt: '2026-07-25T14:00:00Z',
    updatedAt: '2026-09-11T11:20:00Z',
    lastActivityAt: '2026-09-11T11:20:00Z',
  },
  {
    id: 'proj-6',
    owner: mockUsers[0],
    title: 'CodeReview AI - Automated Code Review',
    description:
      'AI-powered code review tool that provides intelligent suggestions, detects bugs, and enforces coding standards.',
    stage: ProjectStage.IDEA_PRIVATE,
    visibility: 'private',
    repoUrl: null,
    repoSyncedData: null,
    tags: ['AI', 'Machine Learning', 'Code Review', 'Developer Tools'],
    rolesWanted: ['ML Engineer', 'Backend Developer'],
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z',
    lastActivityAt: '2026-09-10T08:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Project Members
// ---------------------------------------------------------------------------

export const mockProjectMembers: ProjectMember[] = [
  {
    id: 'member-1',
    project: 'proj-1',
    user: mockUsers[0],
    role: 'Owner',
    status: 'active',
    joinedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'member-2',
    project: 'proj-1',
    user: mockUsers[2],
    role: 'Frontend Developer',
    status: 'active',
    joinedAt: '2026-08-20T14:00:00Z',
  },
  {
    id: 'member-3',
    project: 'proj-2',
    user: mockUsers[1],
    role: 'Owner',
    status: 'active',
    joinedAt: '2026-06-20T08:00:00Z',
  },
  {
    id: 'member-4',
    project: 'proj-2',
    user: mockUsers[4],
    role: 'Contributor',
    status: 'active',
    joinedAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'member-5',
    project: 'proj-4',
    user: mockUsers[3],
    role: 'Owner',
    status: 'active',
    joinedAt: '2026-07-10T09:00:00Z',
  },
  {
    id: 'member-6',
    project: 'proj-5',
    user: mockUsers[4],
    role: 'Owner',
    status: 'active',
    joinedAt: '2026-07-25T14:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Join Requests
// ---------------------------------------------------------------------------

export const mockJoinRequests: JoinRequest[] = [
  {
    id: 'join-1',
    project: 'proj-1',
    user: mockUsers[3],
    message: "I'm a DevOps engineer and would love to help with the CI/CD pipeline and deployment automation.",
    status: 'pending',
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'join-2',
    project: 'proj-5',
    user: mockUsers[0],
    message: 'Interested in contributing to the data visualization components. I have experience with D3.js.',
    status: 'accepted',
    createdAt: '2026-09-08T15:00:00Z',
  },
  {
    id: 'join-3',
    project: 'proj-2',
    user: mockUsers[2],
    message: 'Would love to help design the documentation and API reference pages.',
    status: 'pending',
    createdAt: '2026-09-11T09:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Updates
// ---------------------------------------------------------------------------

export const mockUpdates: Update[] = [
  {
    id: 'update-1',
    project: 'proj-1',
    author: mockUsers[0],
    body: "Just shipped v0.3.0! Major changes:\n- Added GitHub OAuth integration\n- New dashboard with activity feed\n- Improved search functionality\n\nCheck it out and let me know what you think!",
    linkedCommitSha: 'a1b2c3d4e5f6',
    createdAt: '2026-09-10T14:00:00Z',
  },
  {
    id: 'update-2',
    project: 'proj-1',
    author: mockUsers[2],
    body: "Working on the new UI components. Here's a preview of the project card redesign. Feedback welcome!",
    linkedCommitSha: null,
    createdAt: '2026-09-08T11:00:00Z',
  },
  {
    id: 'update-3',
    project: 'proj-2',
    author: mockUsers[1],
    body: "APIForge v2.0 is now live! 🚀\n\nNew features:\n- GraphQL support\n- WebSocket subscriptions\n- Auto-generated SDK for JavaScript/Python\n\nDocumentation: https://apiforge.dev/docs",
    linkedCommitSha: 'f6e5d4c3b2a1',
    createdAt: '2026-09-05T09:00:00Z',
  },
  {
    id: 'update-4',
    project: 'proj-4',
    author: mockUsers[3],
    body: "Successfully deployed to AWS and Google Cloud! 🎉\n\nNext up: Azure support and Terraform integration.",
    linkedCommitSha: '1a2b3c4d5e6f',
    createdAt: '2026-09-12T16:00:00Z',
  },
  {
    id: 'update-5',
    project: 'proj-5',
    author: mockUsers[4],
    body: "Added new chart types: treemap, sunburst, and sankey diagrams. The visualization library is growing!",
    linkedCommitSha: null,
    createdAt: '2026-09-11T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    project: 'proj-1',
    update: 'update-1',
    author: mockUsers[2],
    body: 'This is amazing! The new dashboard looks great. Love the activity feed.',
    createdAt: '2026-09-10T15:00:00Z',
  },
  {
    id: 'comment-2',
    project: 'proj-1',
    update: 'update-1',
    author: mockUsers[3],
    body: "Nice work! I'd love to help with the CI/CD setup. Let me know if you need any DevOps support.",
    createdAt: '2026-09-10T16:00:00Z',
  },
  {
    id: 'comment-3',
    project: 'proj-2',
    update: 'update-3',
    author: mockUsers[0],
    body: 'GraphQL support is a game changer! This makes APIForge so much more versatile.',
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'comment-4',
    project: 'proj-4',
    update: 'update-4',
    author: mockUsers[1],
    body: 'Terraform integration would be incredible. Count me in for testing!',
    createdAt: '2026-09-12T17:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Reactions
// ---------------------------------------------------------------------------

export const mockReactions: Reaction[] = [
  {
    id: 'reaction-1',
    targetType: 'project',
    targetId: 'proj-1',
    user: mockUsers[1],
    reactionType: 'thumbsup',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'reaction-2',
    targetType: 'project',
    targetId: 'proj-1',
    user: mockUsers[2],
    reactionType: 'rocket',
    createdAt: '2026-09-01T11:00:00Z',
  },
  {
    id: 'reaction-3',
    targetType: 'project',
    targetId: 'proj-2',
    user: mockUsers[0],
    reactionType: 'thumbsup',
    createdAt: '2026-06-25T10:00:00Z',
  },
  {
    id: 'reaction-4',
    targetType: 'project',
    targetId: 'proj-2',
    user: mockUsers[3],
    reactionType: 'bulb',
    createdAt: '2026-07-01T12:00:00Z',
  },
  {
    id: 'reaction-5',
    targetType: 'project',
    targetId: 'proj-5',
    user: mockUsers[0],
    reactionType: 'rocket',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'reaction-6',
    targetType: 'update',
    targetId: 'update-1',
    user: mockUsers[2],
    reactionType: 'thumbsup',
    createdAt: '2026-09-10T15:00:00Z',
  },
  {
    id: 'reaction-7',
    targetType: 'update',
    targetId: 'update-3',
    user: mockUsers[0],
    reactionType: 'rocket',
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'reaction-8',
    targetType: 'update',
    targetId: 'update-4',
    user: mockUsers[1],
    reactionType: 'thumbsup',
    createdAt: '2026-09-12T17:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user: 'user-1',
    type: 'join_request',
    payload: {
      projectId: 'proj-1',
      projectTitle: 'DevFlow - Developer Workflow Manager',
      requesterUsername: 'alexcloud',
      requesterName: 'Alex Cloud',
    },
    readAt: null,
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'notif-2',
    user: 'user-1',
    type: 'new_comment',
    payload: {
      projectId: 'proj-1',
      projectTitle: 'DevFlow - Developer Workflow Manager',
      updateId: 'update-1',
      commenterUsername: 'mikecodes',
      commenterName: 'Mike Codes',
      commentPreview: "Nice work! I'd love to help with the CI/CD setup...",
    },
    readAt: null,
    createdAt: '2026-09-10T16:00:00Z',
  },
  {
    id: 'notif-3',
    user: 'user-1',
    type: 'join_accepted',
    payload: {
      projectId: 'proj-5',
      projectTitle: 'DataLens - Data Visualization Platform',
      ownerUsername: 'jordandata',
      ownerName: 'Jordan Data',
    },
    readAt: '2026-09-09T08:00:00Z',
    createdAt: '2026-09-08T16:00:00Z',
  },
  {
    id: 'notif-4',
    user: 'user-1',
    type: 'project_update',
    payload: {
      projectId: 'proj-4',
      projectTitle: 'CloudDeploy - Zero-Config Deployment',
      updaterUsername: 'alexcloud',
      updaterName: 'Alex Cloud',
      updatePreview: 'Successfully deployed to AWS and Google Cloud!',
    },
    readAt: '2026-09-13T09:00:00Z',
    createdAt: '2026-09-12T16:00:00Z',
  },
  {
    id: 'notif-5',
    user: 'user-1',
    type: 'reaction',
    payload: {
      targetType: 'project',
      targetId: 'proj-1',
      reactorUsername: 'mikecodes',
      reactorName: 'Mike Codes',
      reactionType: 'thumbsup',
    },
    readAt: '2026-09-02T10:00:00Z',
    createdAt: '2026-09-01T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Get projects by stage
 */
export function getProjectsByStage(stage: ProjectStage): Project[] {
  return mockProjects.filter((p) => p.stage === stage);
}

/**
 * Get projects by owner
 */
export function getProjectsByOwner(userId: string): Project[] {
  return mockProjects.filter((p) => p.owner.id === userId);
}

/**
 * Get projects where user is a member
 */
export function getProjectsByMember(userId: string): Project[] {
  const memberProjectIds = mockProjectMembers
    .filter((m) => m.user.id === userId && m.status === 'active')
    .map((m) => m.project);
  return mockProjects.filter((p) => memberProjectIds.includes(p.id));
}

/**
 * Get user by username
 */
export function getUserByUsername(username: string): User | undefined {
  return mockUsers.find((u) => u.username === username);
}

/**
 * Get project by ID
 */
export function getProjectById(projectId: string): Project | undefined {
  return mockProjects.find((p) => p.id === projectId);
}

/**
 * Get updates for a project
 */
export function getUpdatesByProject(projectId: string): Update[] {
  return mockUpdates
    .filter((u) => u.project === projectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get comments for an update
 */
export function getCommentsByUpdate(updateId: string): Comment[] {
  return mockComments
    .filter((c) => c.update === updateId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get reactions for a target
 */
export function getReactionsByTarget(targetType: string, targetId: string): Reaction[] {
  return mockReactions.filter(
    (r) => r.targetType === targetType && r.targetId === targetId,
  );
}

/**
 * Get unread notifications count
 */
export function getUnreadNotificationsCount(userId: string): number {
  return mockNotifications.filter((n) => n.user === userId && n.readAt === null).length;
}

/**
 * Get notifications for a user
 */
export function getNotificationsByUser(userId: string): Notification[] {
  return mockNotifications
    .filter((n) => n.user === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ---------------------------------------------------------------------------
// Export all mock data
// ---------------------------------------------------------------------------

export const mockData = {
  skills: mockSkills,
  profileLinks: mockProfileLinks,
  users: mockUsers,
  currentUser: mockCurrentUser,
  projects: mockProjects,
  projectMembers: mockProjectMembers,
  joinRequests: mockJoinRequests,
  updates: mockUpdates,
  comments: mockComments,
  reactions: mockReactions,
  notifications: mockNotifications,
} as const;
