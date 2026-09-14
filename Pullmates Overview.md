# Pullmates — Developer Collaboration & Showcase Platform Plan

## 1. Core Concept & Positioning

**Name:** Pullmates — a nod to Git "pull requests" + finding your teammates.

**Tagline direction:** "Where builders post ideas, in-progress work, or finished projects — and the right people find them."

**Two primary user types, one platform:**
- **Posters** — have an idea/project, want collaborators, feedback, or visibility
- **Browsers** — want to find something worth joining, learning from, or just watching

Both need first-class homepages. Don't make one an afterthought.

**Differentiators vs. existing players (Side Project World, DevList, Developerscope, dev.to, etc.):**
1. GitHub-native auto-fill (deep, not superficial)
2. Support for *pre-public* / private ideas, not just live repos
3. The platform stays involved after the match — it's not just a listing board

## 2. User Roles & Journeys

**Poster journey:**
1. Create a project (private idea → public showcase → active build, all one continuum)
2. Optionally link a GitHub repo for auto-fill
3. Define what help is wanted (roles, skills, specific tasks/issues)
4. Review interest, accept collaborators
5. Post updates over time; platform nudges them to

**Browser journey:**
1. Discover via feed/search/filters (tech stack, role needed, stage, activity level)
2. React/comment/follow a project
3. Request to join (with a note on what they bring)
4. Get accepted → becomes a contributor with visibility into the project's private space

Project **stage** should be a first-class field:
`Idea (private) → Idea (public) → Building → Launched → Maintained/Archived`

This lets one system handle both "pre-public idea" and "here's my live GitHub repo."

## 3. Data Model (rough)

```
User
 - id, username, bio, skills[], links (github, portfolio, etc.)
 - reputation_score, badges

Project
 - id, owner_id, title, description, stage (enum above)
 - visibility (private | public)
 - repo_url (nullable), repo_synced_data {stars, language, readme_excerpt, open_issues[], last_commit_at}
 - tags[], roles_wanted[] (e.g. "frontend", "ML", "designer")
 - created_at, updated_at

ProjectMember
 - project_id, user_id, role, status (pending | active | left), joined_at

JoinRequest
 - project_id, user_id, message, status (pending/accepted/declined)

Update (progress log / changelog post)
 - project_id, author_id, body, created_at, linked_commit_sha (optional)

Comment
 - project_id or update_id, author_id, body, created_at

Reaction
 - target_type (project|update), target_id, user_id, type (👍🚀💡 etc.)

Notification
 - user_id, type, payload, read_at
```

The `Update` model is the key to "staying involved" — treat it like a mini changelog/blog per project, not just a static post.

## 4. GitHub Auto-Fill — How to Actually Build It

Use the GitHub REST/GraphQL API (unauthenticated works for public repos, rate-limited; ask users to connect GitHub OAuth for higher limits and private repo support later).

On repo link paste, pull:
- Repo name, description, README (rendered, truncated with "read more")
- Primary language + language breakdown
- Star/fork count, last commit date (signals activity/freshness)
- Open issues labeled `good first issue` / `help wanted` → **surface these directly as "ways to contribute"** — this is the killer feature, not a gimmick
- License, topics/tags → auto-populate the tag system
- Optionally: contributor count, README badges

Re-sync periodically (webhook if the user connects GitHub OAuth + installs a lightweight GitHub App; otherwise poll on a schedule, e.g. every 24h) so the "last active" signal stays honest — stale projects should visibly look stale.

## 5. Engagement & Retention Mechanics

This is what most competitors skip — treat it as core, not a "phase 2" nice-to-have.

- **Progress updates**: prompt posters weekly/biweekly ("Anything new since last time?"). Projects with recent updates rank higher in discovery — this incentivizes posting.
- **Notifications that matter**: someone wants to join, someone commented, a project you follow shipped an update, a "help wanted" issue matching your skills just opened.
- **Contributor identity**: when someone joins and contributes, that shows on their profile permanently (like a lightweight portfolio) — strong incentive for browsers to convert into contributors, not just lurk.
- **Trending/Active feed**: rank by recent activity (updates, commits, new members) not just recency of posting, so effort is rewarded over one-time announcements.
- **Private project spaces**: once someone joins, give the team a private discussion thread — this is why they keep coming back to the platform instead of moving straight to Discord/Slack.

## 6. MVP Scope

Build this first, nothing more:

1. Auth + profile (skills, links)
2. Create project (title, description, stage, tags, repo_url optional)
3. GitHub auto-fill: README, language, stars, open "help wanted" issues
4. Public feed with filters (tag, stage, role wanted)
5. React + comment on projects
6. Join request → accept/decline
7. Basic project updates (poster can post an update; followers get notified)
8. Private/unlisted project visibility toggle

**Cut for MVP:** private team chat, reputation/badges, advanced search, webhooks/live sync (poll instead), mobile app.

## 7. Phased Roadmap

| Phase | Focus |
|---|---|
| 0 — MVP | Section 6 above, ship to a small seed community |
| 1 | Notifications, activity-based ranking, GitHub OAuth for higher rate limits + private repos |
| 2 | Private project workspace (threaded discussion per project), contributor profiles/portfolio |
| 3 | Reputation system, project webhooks for live sync, richer discovery (semantic/skill matching) |
| 4 | Teams/orgs, monetization (see below), API for embedding project cards elsewhere |

## 8. Growth Strategy

- Seed with real projects, not empty listings — recruit from communities like dev.to, IndieHackers, relevant Discords/subreddits before public launch, so day-one browsers see substance
- Let people embed a "find collaborators on Pullmates" badge in their GitHub README — free distribution
- Weekly digest email/newsletter of trending projects and open "help wanted" issues by tag

## 9. Monetization (later, don't lead with this)

- Free core product
- Paid tier for posters: private team spaces beyond N members, advanced analytics on project views/interest
- "Featured project" placement (clearly labeled, limited slots to preserve trust)
- Team/org accounts for companies recruiting open-source contributors

## 10. Tech Stack Suggestion

- Frontend: Next.js/React
- Backend: Node or Python (FastAPI), Postgres for relational data
- Auth: GitHub OAuth as a first-class login option (kills two birds — auth + repo linking)
- Background jobs: for periodic repo re-sync (queue like BullMQ or a cron worker)

## Competitive Landscape Notes

Existing players covering pieces of this space (as of research in September 2026):
- **Side Project World** — dedicated space to share ideas and find teammates with complementary skills
- **DevList** — developer directory and project showcase, browse by tech stack/region/category
- **Developerscope** — networking + project showcasing + collaboration tools
- **dev.to, Peerlist, IndieHackers** — adjacent communities with showcase/discovery features

None of them combine deep GitHub auto-fill + pre-public idea support + ongoing platform involvement after a match — that combination is the open wedge.
