-- =============================================================================
-- PullMates — 000004: Seed
-- Ports frontend/lib/mock-data.ts so the app has content immediately.
-- Demo users are auth.users rows created without a usable password (empty
-- encrypted_password on reserved @example.com emails) — they cannot be
-- signed into; the profile trigger generates their profile rows.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Skills
-- ---------------------------------------------------------------------------
insert into public.skills (id, name) values
  ('skill-1', 'TypeScript'),
  ('skill-2', 'React'),
  ('skill-3', 'Next.js'),
  ('skill-4', 'Node.js'),
  ('skill-5', 'Python'),
  ('skill-6', 'Django'),
  ('skill-7', 'PostgreSQL'),
  ('skill-8', 'Tailwind CSS'),
  ('skill-9', 'GraphQL'),
  ('skill-10', 'Docker'),
  ('skill-11', 'AWS'),
  ('skill-12', 'Figma'),
  ('skill-13', 'UI/UX Design'),
  ('skill-14', 'DevOps'),
  ('skill-15', 'Machine Learning')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Demo users (profile rows created by the on_auth_user_created trigger)
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'sarah@example.com', '', now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Sarah Dev","user_name":"sarahdev","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"}',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'mike@example.com', '', now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Mike Codes","user_name":"mikecodes","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=mike"}',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'emily@example.com', '', now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Emily UX","user_name":"emilyux","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=emily"}',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'alex@example.com', '', now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Alex Cloud","user_name":"alexcloud","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=alex"}',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'jordan@example.com', '', now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Jordan Data","user_name":"jordandata","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=jordan"}',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');

-- ---------------------------------------------------------------------------
-- Profile links + skills (joined via profiles populated by the trigger)
-- ---------------------------------------------------------------------------
insert into public.profile_links (id, user_id, label, url)
select v.id, p.id, v.label, v.url
from (values
  ('link-1', 'sarahdev', 'GitHub', 'https://github.com'),
  ('link-1b', 'sarahdev', 'Portfolio', 'https://portfolio.dev'),
  ('link-2', 'mikecodes', 'GitHub', 'https://github.com'),
  ('link-2b', 'mikecodes', 'LinkedIn', 'https://linkedin.com'),
  ('link-3', 'emilyux', 'GitHub', 'https://github.com'),
  ('link-3b', 'emilyux', 'Twitter', 'https://twitter.com'),
  ('link-4', 'alexcloud', 'GitHub', 'https://github.com'),
  ('link-4b', 'alexcloud', 'Portfolio', 'https://portfolio.dev'),
  ('link-5', 'jordandata', 'GitHub', 'https://github.com'),
  ('link-5b', 'jordandata', 'LinkedIn', 'https://linkedin.com')
) as v(id, username, label, url)
join public.profiles p on p.username = v.username
on conflict (id) do nothing;

insert into public.user_skills (user_id, skill_id)
select p.id, s.id
from (values
  ('sarahdev', 'skill-1'), ('sarahdev', 'skill-2'), ('sarahdev', 'skill-3'), ('sarahdev', 'skill-8'),
  ('mikecodes', 'skill-5'), ('mikecodes', 'skill-6'), ('mikecodes', 'skill-7'), ('mikecodes', 'skill-10'),
  ('emilyux', 'skill-2'), ('emilyux', 'skill-8'), ('emilyux', 'skill-12'), ('emilyux', 'skill-13'),
  ('alexcloud', 'skill-4'), ('alexcloud', 'skill-10'), ('alexcloud', 'skill-11'), ('alexcloud', 'skill-14'),
  ('jordandata', 'skill-5'), ('jordandata', 'skill-15'), ('jordandata', 'skill-7'), ('jordandata', 'skill-1')
) as v(username, skill_id)
join public.profiles p on p.username = v.username
join public.skills s on s.id = v.skill_id
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
insert into public.projects (
  id, owner_id, title, description, stage, visibility, repo_url, repo_synced_data,
  tags, roles_wanted, created_at, updated_at, last_activity_at
)
select v.id, p.id, v.title, v.description, v.stage, v.visibility, v.repo_url,
       nullif(v.repo_synced_data::jsonb, 'null'::jsonb),
       v.tags, v.roles_wanted,
       v.created_at::timestamptz, v.updated_at::timestamptz, v.last_activity::timestamptz
from (values
  ('proj-1', 'sarahdev',
   'DevFlow - Developer Workflow Manager',
   'A modern developer workflow tool that integrates with GitHub, GitLab, and Bitbucket. Track issues, manage PRs, and automate repetitive tasks with custom workflows.',
   'BUILDING', 'public', 'https://github.com/sarahdev/devflow',
   '{"name":"devflow","description":"Modern developer workflow manager","stars":234,"forks":45,"language":"TypeScript","languageBreakdown":{"TypeScript":78,"JavaScript":12,"CSS":10},"lastCommitAt":"2026-09-10T14:30:00Z","openIssues":[{"title":"Add GitLab integration","url":"https://github.com/sarahdev/devflow/issues/23","labels":["help wanted","enhancement"]},{"title":"Implement webhook notifications","url":"https://github.com/sarahdev/devflow/issues/24","labels":["good first issue"]}],"topics":["developer-tools","github","workflow","automation"]}',
   array['TypeScript','React','GitHub API','Developer Tools'],
   array['Backend Developer','DevOps Engineer'],
   '2026-08-15T10:00:00Z', '2026-09-10T14:30:00Z', '2026-09-10T14:30:00Z'),
  ('proj-2', 'mikecodes',
   'APIForge - REST API Generator',
   'Generate production-ready REST APIs from database schemas. Supports PostgreSQL, MySQL, and SQLite. Includes authentication, rate limiting, and documentation generation.',
   'LAUNCHED', 'public', 'https://github.com/mikecodes/apiforge',
   '{"name":"apiforge","description":"Generate REST APIs from database schemas","stars":567,"forks":89,"language":"Python","languageBreakdown":{"Python":85,"JavaScript":10,"HTML":5},"lastCommitAt":"2026-09-08T09:15:00Z","openIssues":[{"title":"Add MongoDB support","url":"https://github.com/mikecodes/apiforge/issues/45","labels":["help wanted","enhancement"]}],"topics":["api","rest","generator","python","django"]}',
   array['Python','Django','REST API','Database'],
   array['Technical Writer','Frontend Developer'],
   '2026-06-20T08:00:00Z', '2026-09-08T09:15:00Z', '2026-09-08T09:15:00Z'),
  ('proj-3', 'emilyux',
   'PixelPerfect - Design System Builder',
   'Create and maintain design systems with built-in accessibility testing. Export to React, Vue, and Svelte components.',
   'IDEA_PUBLIC', 'public', null, null,
   array['Design System','UI/UX','Accessibility','Components'],
   array['Frontend Developer','Designer','Accessibility Expert'],
   '2026-09-01T12:00:00Z', '2026-09-01T12:00:00Z', '2026-09-01T12:00:00Z'),
  ('proj-4', 'alexcloud',
   'CloudDeploy - Zero-Config Deployment',
   'Deploy any application to any cloud provider with zero configuration. Automatic scaling, monitoring, and cost optimization.',
   'BUILDING', 'public', 'https://github.com/alexcloud/clouddeploy',
   '{"name":"clouddeploy","description":"Zero-config deployment tool","stars":189,"forks":32,"language":"Go","languageBreakdown":{"Go":90,"Shell":10},"lastCommitAt":"2026-09-12T16:45:00Z","openIssues":[],"topics":["deployment","cloud","devops","kubernetes"]}',
   array['Go','Docker','Kubernetes','Cloud','DevOps'],
   array['Go Developer','Cloud Architect'],
   '2026-07-10T09:00:00Z', '2026-09-12T16:45:00Z', '2026-09-12T16:45:00Z'),
  ('proj-5', 'jordandata',
   'DataLens - Data Visualization Platform',
   'Interactive data visualization platform with drag-and-drop interface. Connect to any database and create beautiful charts and dashboards.',
   'BUILDING', 'public', 'https://github.com/jordandata/datalens',
   '{"name":"datalens","description":"Interactive data visualization platform","stars":312,"forks":56,"language":"TypeScript","languageBreakdown":{"TypeScript":70,"Python":20,"CSS":10},"lastCommitAt":"2026-09-11T11:20:00Z","openIssues":[{"title":"Add chart export to PNG/PDF","url":"https://github.com/jordandata/datalens/issues/34","labels":["good first issue","enhancement"]}],"topics":["data-visualization","charts","dashboard","analytics"]}',
   array['TypeScript','React','Data Visualization','D3.js'],
   array['Data Engineer','Frontend Developer'],
   '2026-07-25T14:00:00Z', '2026-09-11T11:20:00Z', '2026-09-11T11:20:00Z'),
  ('proj-6', 'sarahdev',
   'CodeReview AI - Automated Code Review',
   'AI-powered code review tool that provides intelligent suggestions, detects bugs, and enforces coding standards.',
   'IDEA_PRIVATE', 'private', null, null,
   array['AI','Machine Learning','Code Review','Developer Tools'],
   array['ML Engineer','Backend Developer'],
   '2026-09-10T08:00:00Z', '2026-09-10T08:00:00Z', '2026-09-10T08:00:00Z')
) as v(id, owner_username, title, description, stage, visibility, repo_url, repo_synced_data, tags, roles_wanted, created_at, updated_at, last_activity)
join public.profiles p on p.username = v.owner_username
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Members & join requests
-- ---------------------------------------------------------------------------
insert into public.project_members (id, project_id, user_id, role, status, joined_at)
select v.id, v.project_id, p.id, v.role, v.status, v.joined_at::timestamptz
from (values
  ('member-1', 'proj-1', 'sarahdev', 'Owner', 'active', '2026-08-15T10:00:00Z'),
  ('member-2', 'proj-1', 'emilyux', 'Frontend Developer', 'active', '2026-08-20T14:00:00Z'),
  ('member-3', 'proj-2', 'mikecodes', 'Owner', 'active', '2026-06-20T08:00:00Z'),
  ('member-4', 'proj-2', 'jordandata', 'Contributor', 'active', '2026-07-15T10:00:00Z'),
  ('member-5', 'proj-4', 'alexcloud', 'Owner', 'active', '2026-07-10T09:00:00Z'),
  ('member-6', 'proj-5', 'jordandata', 'Owner', 'active', '2026-07-25T14:00:00Z')
) as v(id, project_id, username, role, status, joined_at)
join public.profiles p on p.username = v.username
on conflict (id) do nothing;

insert into public.join_requests (id, project_id, user_id, message, status, created_at)
select v.id, v.project_id, p.id, v.message, v.status, v.created_at::timestamptz
from (values
  ('join-1', 'proj-1', 'alexcloud',
   'I''m a DevOps engineer and would love to help with the CI/CD pipeline and deployment automation.',
   'pending', '2026-09-12T10:00:00Z'),
  ('join-2', 'proj-5', 'sarahdev',
   'Interested in contributing to the data visualization components. I have experience with D3.js.',
   'accepted', '2026-09-08T15:00:00Z'),
  ('join-3', 'proj-2', 'emilyux',
   'Would love to help design the documentation and API reference pages.',
   'pending', '2026-09-11T09:00:00Z')
) as v(id, project_id, username, message, status, created_at)
join public.profiles p on p.username = v.username
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Updates
-- ---------------------------------------------------------------------------
insert into public.updates (id, project_id, author_id, body, linked_commit_sha, created_at)
select v.id, v.project_id, p.id, v.body, v.sha, v.created_at::timestamptz
from (values
  ('update-1', 'proj-1', 'sarahdev',
   E'Just shipped v0.3.0! Major changes:\n- Added GitHub OAuth integration\n- New dashboard with activity feed\n- Improved search functionality\n\nCheck it out and let me know what you think!',
   'a1b2c3d4e5f6', '2026-09-10T14:00:00Z'),
  ('update-2', 'proj-1', 'emilyux',
   'Working on the new UI components. Here''s a preview of the project card redesign. Feedback welcome!',
   null, '2026-09-08T11:00:00Z'),
  ('update-3', 'proj-2', 'mikecodes',
   E'APIForge v2.0 is now live! 🚀\n\nNew features:\n- GraphQL support\n- WebSocket subscriptions\n- Auto-generated SDK for JavaScript/Python\n\nDocumentation: https://apiforge.dev/docs',
   'f6e5d4c3b2a1', '2026-09-05T09:00:00Z'),
  ('update-4', 'proj-4', 'alexcloud',
   E'Successfully deployed to AWS and Google Cloud! 🎉\n\nNext up: Azure support and Terraform integration.',
   '1a2b3c4d5e6f', '2026-09-12T16:00:00Z'),
  ('update-5', 'proj-5', 'jordandata',
   'Added new chart types: treemap, sunburst, and sankey diagrams. The visualization library is growing!',
   null, '2026-09-11T10:00:00Z')
) as v(id, project_id, username, body, sha, created_at)
join public.profiles p on p.username = v.username
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------
insert into public.comments (id, project_id, update_id, author_id, body, created_at)
select v.id, v.project_id, v.update_id, p.id, v.body, v.created_at::timestamptz
from (values
  ('comment-1', 'proj-1', 'update-1', 'emilyux',
   'This is amazing! The new dashboard looks great. Love the activity feed.', '2026-09-10T15:00:00Z'),
  ('comment-2', 'proj-1', 'update-1', 'alexcloud',
   'Nice work! I''d love to help with the CI/CD setup. Let me know if you need any DevOps support.', '2026-09-10T16:00:00Z'),
  ('comment-3', 'proj-2', 'update-3', 'sarahdev',
   'GraphQL support is a game changer! This makes APIForge so much more versatile.', '2026-09-05T10:00:00Z'),
  ('comment-4', 'proj-4', 'update-4', 'mikecodes',
   'Terraform integration would be incredible. Count me in for testing!', '2026-09-12T17:00:00Z')
) as v(id, project_id, update_id, username, body, created_at)
join public.profiles p on p.username = v.username
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Reactions
-- ---------------------------------------------------------------------------
insert into public.reactions (id, target_type, target_id, user_id, reaction_type, created_at)
select v.id, v.target_type, v.target_id, p.id, v.reaction_type, v.created_at::timestamptz
from (values
  ('reaction-1', 'project', 'proj-1', 'mikecodes', 'thumbsup', '2026-09-01T10:00:00Z'),
  ('reaction-2', 'project', 'proj-1', 'emilyux', 'rocket', '2026-09-01T11:00:00Z'),
  ('reaction-3', 'project', 'proj-2', 'sarahdev', 'thumbsup', '2026-06-25T10:00:00Z'),
  ('reaction-4', 'project', 'proj-2', 'alexcloud', 'bulb', '2026-07-01T12:00:00Z'),
  ('reaction-5', 'project', 'proj-5', 'sarahdev', 'rocket', '2026-08-01T10:00:00Z'),
  ('reaction-6', 'update', 'update-1', 'emilyux', 'thumbsup', '2026-09-10T15:00:00Z'),
  ('reaction-7', 'update', 'update-3', 'sarahdev', 'rocket', '2026-09-05T10:00:00Z'),
  ('reaction-8', 'update', 'update-4', 'mikecodes', 'thumbsup', '2026-09-12T17:00:00Z')
) as v(id, target_type, target_id, username, reaction_type, created_at)
join public.profiles p on p.username = v.username
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Notifications (demo inbox for sarahdev)
-- ---------------------------------------------------------------------------
insert into public.notifications (id, user_id, type, payload, read_at, created_at)
select v.id, p.id, v.type, v.payload::jsonb, v.read_at::timestamptz, v.created_at::timestamptz
from (values
  ('notif-1', 'sarahdev', 'join_request',
   '{"projectId":"proj-1","projectTitle":"DevFlow - Developer Workflow Manager","requesterUsername":"alexcloud","requesterName":"Alex Cloud"}',
   null, '2026-09-12T10:00:00Z'),
  ('notif-2', 'sarahdev', 'new_comment',
   '{"projectId":"proj-1","projectTitle":"DevFlow - Developer Workflow Manager","updateId":"update-1","commenterUsername":"mikecodes","commenterName":"Mike Codes","commentPreview":"Nice work! I''d love to help with the CI/CD setup..."}',
   null, '2026-09-10T16:00:00Z'),
  ('notif-3', 'sarahdev', 'join_accepted',
   '{"projectId":"proj-5","projectTitle":"DataLens - Data Visualization Platform","ownerUsername":"jordandata","ownerName":"Jordan Data"}',
   '2026-09-09T08:00:00Z', '2026-09-08T16:00:00Z'),
  ('notif-4', 'sarahdev', 'project_update',
   '{"projectId":"proj-4","projectTitle":"CloudDeploy - Zero-Config Deployment","updaterUsername":"alexcloud","updaterName":"Alex Cloud","updatePreview":"Successfully deployed to AWS and Google Cloud!"}',
   '2026-09-13T09:00:00Z', '2026-09-12T16:00:00Z'),
  ('notif-5', 'sarahdev', 'reaction',
   '{"targetType":"project","targetId":"proj-1","reactorUsername":"mikecodes","reactorName":"Mike Codes","reactionType":"thumbsup"}',
   '2026-09-02T10:00:00Z', '2026-09-01T10:00:00Z')
) as v(id, username, type, payload, read_at, created_at)
join public.profiles p on p.username = v.username
on conflict (id) do nothing;
