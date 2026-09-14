# Pullmates — Backend (Django)

This document describes how to build the Pullmates backend using Django and Django REST Framework. It covers stack choices, app structure, data models, API design, GitHub sync, auth, and background jobs, aligned with the MVP scope in the main project plan.

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Django 5.x | Mature ORM, admin panel (useful for early moderation/support), batteries-included |
| API layer | Django REST Framework (DRF) | Serializers, viewsets, permissions map cleanly onto the data model |
| Database | PostgreSQL | Relational integrity for users/projects/memberships; JSONField for flexible repo-synced data |
| Auth | `django-allauth` (GitHub provider) + `djangorestframework-simplejwt` | GitHub OAuth for login/signup, JWT for stateless API auth consumed by the Next.js frontend |
| Background jobs | Celery + Redis (broker & result backend) | Periodic GitHub re-sync, notification fan-out, digest emails |
| Realtime | Django Channels (optional, phase 1+) | WebSocket push for notifications; MVP can use polling instead |
| Task scheduling | Celery Beat | Cron-style periodic repo re-sync (e.g. every 24h) |
| Storage | S3-compatible bucket (via `django-storages`) | Avatar uploads, any cached repo assets |
| Search (phase 2+) | Postgres full-text search initially; consider Elasticsearch/Meilisearch when scale demands it | Avoid overbuilding search for MVP |

## 2. Project Structure

```
backend/
  config/
    settings/
      base.py
      dev.py
      prod.py
    urls.py
    celery.py
    asgi.py                     # For Channels, if/when enabled
    wsgi.py
  apps/
    users/
      models.py                  # Custom User model, Skill, ProfileLink
      serializers.py
      views.py
      urls.py
    projects/
      models.py                  # Project, ProjectMember, JoinRequest, Update
      serializers.py
      views.py                   # ViewSets: ProjectViewSet, UpdateViewSet, JoinRequestViewSet
      permissions.py             # IsProjectOwner, IsProjectMemberOrPublic, etc.
      filters.py                 # django-filter FilterSets for tag/stage/role
      urls.py
    engagement/
      models.py                  # Comment, Reaction
      serializers.py
      views.py
      urls.py
    notifications/
      models.py                  # Notification
      services.py                 # notify(user, type, payload) helper used across apps
      views.py
      urls.py
    github_sync/
      client.py                   # Thin wrapper around GitHub REST/GraphQL API
      services.py                 # fetch_repo_snapshot(repo_url) -> normalized dict
      tasks.py                    # Celery tasks: sync_project_repo, sync_all_stale_repos
    core/
      pagination.py
      exceptions.py
      mixins.py
  manage.py
  requirements/
    base.txt
    dev.txt
    prod.txt
```

Each Django app maps closely to a bounded concern from the data model in the main plan, which keeps permissions and serializers easy to reason about independently.

## 3. Data Models

```python
# apps/users/models.py
class User(AbstractUser):
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    github_username = models.CharField(max_length=255, blank=True)
    reputation_score = models.IntegerField(default=0)

class Skill(models.Model):
    name = models.CharField(max_length=64, unique=True)

class UserSkill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

class ProfileLink(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="links")
    label = models.CharField(max_length=64)   # "GitHub", "Portfolio", "X"
    url = models.URLField()
```

```python
# apps/projects/models.py
class Project(models.Model):
    class Stage(models.TextChoices):
        IDEA_PRIVATE = "idea_private", "Idea (private)"
        IDEA_PUBLIC = "idea_public", "Idea (public)"
        BUILDING = "building", "Building"
        LAUNCHED = "launched", "Launched"
        MAINTAINED = "maintained", "Maintained/Archived"

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_projects")
    title = models.CharField(max_length=200)
    description = models.TextField()
    stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.IDEA_PRIVATE)
    visibility = models.CharField(max_length=10, choices=[("private", "Private"), ("public", "Public")], default="private")
    repo_url = models.URLField(blank=True, null=True)
    repo_synced_data = models.JSONField(blank=True, null=True)   # stars, language, readme_excerpt, open_issues[], last_commit_at
    tags = models.JSONField(default=list, blank=True)             # simple string list for MVP; normalize to M2M later if needed
    roles_wanted = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity_at = models.DateTimeField(auto_now_add=True)     # bumped by updates/commits, drives feed ranking

    class Meta:
        indexes = [
            models.Index(fields=["visibility", "stage"]),
            models.Index(fields=["-last_activity_at"]),
        ]

class ProjectMember(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        LEFT = "left", "Left"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="project_memberships")
    role = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "user")

class JoinRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="join_requests")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="join_requests")
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

class Update(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="updates")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    linked_commit_sha = models.CharField(max_length=64, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

```python
# apps/engagement/models.py
class Comment(models.Model):
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="comments", null=True, blank=True)
    update = models.ForeignKey("projects.Update", on_delete=models.CASCADE, related_name="comments", null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Reaction(models.Model):
    class TargetType(models.TextChoices):
        PROJECT = "project", "Project"
        UPDATE = "update", "Update"

    target_type = models.CharField(max_length=10, choices=TargetType.choices)
    target_id = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=16)   # "thumbsup", "rocket", "bulb", etc.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("target_type", "target_id", "user", "reaction_type")
```

```python
# apps/notifications/models.py
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=32)   # "join_request", "join_accepted", "new_comment", "project_update", ...
    payload = models.JSONField(default=dict)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

## 4. API Design (DRF)

Use `ModelViewSet`s registered with a `DefaultRouter`, plus a few custom actions for non-CRUD operations.

```
GET    /api/projects/                     # list, filterable via query params (tag, stage, role, q)
POST   /api/projects/                     # create
GET    /api/projects/{id}/                # retrieve (403/404 enforced by visibility + membership)
PATCH  /api/projects/{id}/                # update (owner only)
DELETE /api/projects/{id}/                # owner only

POST   /api/projects/{id}/join-requests/  # request to join
POST   /api/projects/{id}/join-requests/{req_id}/accept/
POST   /api/projects/{id}/join-requests/{req_id}/decline/

GET    /api/projects/{id}/updates/
POST   /api/projects/{id}/updates/

POST   /api/projects/{id}/reactions/      # body: { reaction_type }
DELETE /api/projects/{id}/reactions/{id}/

GET    /api/projects/{id}/comments/
POST   /api/projects/{id}/comments/

POST   /api/github/preview/               # body: { repo_url } -> normalized preview, used by "create project" flow before saving
POST   /api/projects/{id}/github/resync/  # manual re-sync trigger (rate-limited)

GET    /api/notifications/
GET    /api/notifications/unread-count/
POST   /api/notifications/{id}/read/

GET    /api/users/{username}/             # public profile
PATCH  /api/users/me/                     # own profile

POST   /api/auth/github/                  # exchange NextAuth-provided GitHub token for backend JWT
POST   /api/auth/token/refresh/
```

**Filtering:** use `django-filter` for `tag`, `stage`, `role_wanted` on the `ProjectViewSet` list endpoint, combined with DRF's `SearchFilter` for free-text search over `title`/`description`.

**Ordering:** default ordering is `-last_activity_at` (supports the "trending/active" ranking from the plan), with `?ordering=-created_at` available for "newest" sort.

**Pagination:** cursor pagination (`CursorPagination`) on the feed endpoint for stable infinite scroll.

## 5. Permissions

```python
# apps/projects/permissions.py
class IsProjectOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id

class CanViewProject(BasePermission):
    """Public projects: anyone. Private projects: owner or active member only."""
    def has_object_permission(self, request, view, obj):
        if obj.visibility == "public":
            return True
        if not request.user.is_authenticated:
            return False
        return obj.owner_id == request.user.id or obj.members.filter(
            user=request.user, status="active"
        ).exists()
```

Apply `CanViewProject` on retrieve, `IsProjectOwner` on update/delete, and a member-or-owner check on posting updates.

## 6. GitHub Auto-Fill & Sync Service

```python
# apps/github_sync/services.py
def fetch_repo_snapshot(repo_url: str) -> dict:
    """
    Calls the GitHub API (REST for simple fields, GraphQL for combined
    queries where it reduces round trips) and returns a normalized dict:
    {
        "name": str, "description": str, "readme_excerpt": str,
        "language_breakdown": dict, "stars": int, "forks": int,
        "last_commit_at": iso_datetime, "license": str,
        "open_issues": [{"title": str, "url": str, "labels": [str]}],
        "topics": [str],
    }
    Filters open_issues to those labeled "good first issue" or "help wanted".
    """
```

- **Unauthenticated calls** (public repos, no linked GitHub account) hit GitHub's public REST API — subject to the standard 60 requests/hour unauthenticated rate limit, fine for on-demand previews but not for frequent re-sync at scale.
- **Authenticated calls** (via the user's OAuth token, obtained through `django-allauth`'s GitHub provider) raise the rate limit substantially and are required for private repo support in later phases.
- **Preview endpoint** (`POST /api/github/preview/`) is called synchronously from the "create project" flow — keep it fast (single GraphQL query combining repo metadata + issues) and cache the result briefly (e.g. Redis, 5 min TTL) in case the user retries the form.
- **Re-sync** is handled by Celery, not inline on every page view:

```python
# apps/github_sync/tasks.py
@shared_task
def sync_project_repo(project_id: int):
    project = Project.objects.get(id=project_id)
    snapshot = fetch_repo_snapshot(project.repo_url)
    project.repo_synced_data = snapshot
    project.last_activity_at = max(project.last_activity_at, snapshot["last_commit_at"])
    project.save(update_fields=["repo_synced_data", "last_activity_at"])

@shared_task
def sync_all_stale_repos():
    """Celery Beat, runs every 24h. Re-syncs projects not synced in the last day."""
    stale_cutoff = timezone.now() - timedelta(hours=24)
    for project in Project.objects.filter(repo_url__isnull=False).exclude(
        repo_synced_data__last_synced_at__gte=stale_cutoff
    ):
        sync_project_repo.delay(project.id)
```

- Phase 1+: replace polling with a **GitHub App webhook** subscription (push, issues events) for projects where the owner has granted it, updating `repo_synced_data` and `last_activity_at` in near real time instead of waiting for the daily poll.

## 7. Notifications

```python
# apps/notifications/services.py
def notify(user, type: str, payload: dict):
    Notification.objects.create(user=user, type=type, payload=payload)
    # If Channels is enabled, also push over the user's WebSocket group here.
    # Otherwise the frontend picks it up via polling /unread-count/.
```

Call `notify(...)` from the relevant model signal or view logic — e.g. on `JoinRequest` creation (notify the project owner), on `JoinRequest` acceptance (notify the requester), on new `Comment` (notify the thread participants), on new `Update` (notify all active `ProjectMember`s and anyone "following" the project).

For phase 0 (MVP), a simple `post_save` signal on `JoinRequest` and `Update` is enough; avoid over-engineering an event bus before there's a second consumer of these events.

## 8. Auth Flow (backend side)

1. Frontend (NextAuth) completes GitHub OAuth and calls `POST /api/auth/github/` with the GitHub access token.
2. Backend verifies the token against GitHub's `GET /user` endpoint, creates or fetches the matching `User` (matched on `github_username` / GitHub numeric ID stored separately to survive username changes), and returns a JWT pair (access + refresh) via `simplejwt`.
3. Subsequent API requests from the frontend carry `Authorization: Bearer <access_token>`.
4. Store the GitHub OAuth token itself (encrypted at rest) only if needed for later authenticated GitHub API calls (private repo access, webhook setup) — don't pass it back to the frontend.

## 9. Settings & Environment

```
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=False
DATABASE_URL=postgres://user:pass@host:5432/pullmates
REDIS_URL=redis://host:6379/0
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SIGNING_KEY=...
AWS_STORAGE_BUCKET_NAME=...
CORS_ALLOWED_ORIGINS=https://pullmates.dev
```

Use `django-environ` to load these from `.env` in dev and real environment variables in prod. Split settings into `base.py` / `dev.py` / `prod.py` rather than branching on `DEBUG` inline.

## 10. Testing

- **Unit tests:** `pytest-django` for models, serializers, and services (especially `fetch_repo_snapshot` — mock the GitHub API client, don't hit the network in tests).
- **API tests:** DRF's `APITestCase` / `APIClient` for permission boundaries — explicitly test that a private project returns 404 for a non-member, that only the owner can accept join requests, etc.
- **Celery tasks:** run with `CELERY_TASK_ALWAYS_EAGER=True` in the test settings to execute synchronously and assert on side effects.

## 11. Deployment

- Containerize with Docker; separate services for `web` (Gunicorn/Uvicorn), `worker` (Celery), `beat` (Celery Beat), and `redis`/`postgres` as managed services in staging/prod.
- Run migrations as a release step (`python manage.py migrate`) before the new web container receives traffic.
- Use `django-storages` with S3 (or equivalent) for any user-uploaded media; don't rely on local filesystem storage in a multi-instance deployment.

## 12. Build Order (maps to MVP scope in the plan)

1. `users` app + GitHub OAuth login (`POST /api/auth/github/`)
2. `projects` app: model + basic CRUD, visibility permission checks
3. `github_sync`: preview endpoint (synchronous), wired into project creation
4. `engagement`: reactions + comments
5. Join request flow (create, accept, decline) + membership model
6. `Update` model + endpoints (poster update composer)
7. `notifications`: model, signals, unread-count endpoint (polling-friendly)
8. Celery + Beat: periodic re-sync task
9. Filtering/search/ordering on the project list endpoint
