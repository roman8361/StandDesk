# School Desk Manager (Конторки)

## Overview

A web service for teachers to manage student records for adjustable standing-desk school furniture (конторки). Built as a pnpm monorepo with TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Authentication**: Clerk (Replit-managed)
- **Frontend**: React + Vite + TailwindCSS v4 + shadcn/ui

## Artifacts

- `artifacts/api-server` — Express 5 REST API (served at `/api`)
- `artifacts/school-desk` — React + Vite frontend (served at `/`)

## User Roles

- **Teacher**: Creates/manages their own classes and students
- **Admin**: Views all teachers, classes, and students; full edit/delete access

## Student Fields

ФИО (full name), Возраст (age), Рост (height), Зрение (vision), Вес (weight)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `users` — id, clerk_id, name, email, role (teacher/admin), created_at
- `classes` — id, name, student_count, teacher_id, created_at, updated_at
- `students` — id, class_id, full_name, age, height, vision, weight

## API Routes

- `GET /api/auth/me` — get current user (creates if first login)
- `GET/POST /api/classes` — list/create classes
- `GET/PATCH/DELETE /api/classes/:id` — get/update/delete class
- `GET/POST /api/classes/:id/students` — list/add students
- `GET/PATCH/DELETE /api/students/:id` — get/update/delete student
- `GET /api/admin/teachers` — admin: list all teachers
- `GET /api/admin/stats` — admin: dashboard stats

## Making a User Admin

To promote a user to admin, run SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
