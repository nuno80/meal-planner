# Nuno's Next.js Starter Kit 2.0

A comprehensive Next.js 15 starter kit designed to accelerate the setup process for new web applications. It provides a pre-configured environment with Docker for development, pnpm, TypeScript, Tailwind CSS, shadcn/ui (base), BetterSQLite for local database, and Clerk for authentication.

---

## 🚀 Quickstart Guide

Get your project up and running quickly with these steps:

1. **Clone & Navigate:**

   ```bash
   git clone https://github.com/nuno80/nuno-starter-kit-2.0.git my-new-app
   cd my-new-app
   # IMPORTANT: This is now YOUR project. See "Post-Clone Customization" section below.
   # You'll likely want to re-initialize Git for your new project (see "Using as a Starter...").
   ```

2. **Set Up Node.js (v20.x Recommended):**
   This starter is optimized for Node.js v20.x.

   ```bash
   # Example using nvm:
   nvm install 20
   nvm use 20
   ```

3. **Install Dependencies:**

   ```bash
   pnpm install
   ```

   - ⚠️ **Lockfile & Node Version:** Align local Node.js with v20.x. If issues arise with a different Node version, regenerate lockfile: `rm -f pnpm-lock.yaml && rm -rf node_modules && pnpm install`.

4. **Configure Environment Variables:**
   Copy or create `.env.local`. Add your Clerk API keys:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   CLERK_SECRET_KEY=sk_test_YOUR_KEY
   ```

5. **Database Setup & Management:**

   - **Define Initial Schema:** Open `database/schema.sql` and write your `CREATE TABLE IF NOT EXISTS ...` statements.
   - **Initialize Database (Apply Schema):**

     ```bash
     pnpm run db:migrate
     ```

   - **DB Scripts Overview:**
     - `db:migrate`: Applies `schema.sql` (initial setup, new tables).
     - `db:apply-changes`: Executes `database/adhoc_changes.sql` (backs up DB first).
     - `db:reset`: Wipes and recreates DB from `schema.sql` (backs up DB first).
     - `db:backup`: Manually creates a backup.
       (See "Database Management" section for details).

6. **Run Development Server:**

   - **Local:** `pnpm run dev`
   - **Docker:** `cd Docker && docker compose build --no-cache app && docker compose up`
     Access at `http://localhost:3000`.

7. **Initial Git Setup for YOUR New Project (After Cloning Starter):**
   Once you've cloned the starter and are ready to make it your own project:

   ```bash
   # Inside your new project directory (e.g., my-new-app)
   rm -rf .git                     # Remove starter's Git history
   git init                        # Initialize a new Git repository
   git branch -m main              # Ensure main branch
   # Make your initial customizations (package.json name, README title, etc.)
   git add .
   git commit -m "Initial commit for My New App (based on nuno-starter-kit-2.0)"
   # Go to GitHub, create a NEW EMPTY repository for your project
   git remote add origin <URL_OF_YOUR_NEW_GITHUB_REPO>
   git push -u origin main
   ```

---

---

## 🚀 Post-Clone Customization (Important First Steps!)

After cloning this starter kit to begin **your new project**, it's crucial to update several project-specific names and configurations. This ensures your project is independent, correctly branded, and avoids conflicts if you manage multiple projects based on this starter.

Follow these steps in your new project's directory:

1. **Update Project Name and Details in `package.json`:**

   - Open `package.json` in the root of your project.
   - **`name`**: Change this from `nuno-starter-kit-2.0` (or the current starter name) to your new project's unique name (e.g., `my-new-app`). It's conventional to use kebab-case (all lowercase, words separated by hyphens).
   - **`description`**: Write a brief description specific to your new project.
   - **`author`**: Update with your name/organization if desired.
   - _(Optional)_ Review and update other fields like `repository`, `bugs`, `homepage` if you plan for this project to have its own public presence or issue tracking.

2. **Configure Docker Container Name in `Docker/docker-compose.yml`:**

   - Open `Docker/docker-compose.yml`.
   - Find the `services: > app: > container_name:` section.
   - Change the value from `nuno_next_starter_2_dev` to a unique name for your project's Docker container (e.g., `my_new_app_dev`). This helps in easily identifying your project's container when running `docker ps` or managing multiple Dockerized projects.

     ```yaml
     # Docker/docker-compose.yml
     services:
       app:
         # ... other configurations ...
         container_name: my_new_app_dev # <-- CHANGE THIS
         # ...
     ```

   - _(Optional)_ You can also rename the service key `app:` itself if you prefer, but remember this will change how you reference the service in `docker compose` commands (e.g., `docker compose build my-service-name`). Keeping it as `app` is generally fine.

3. **Customize `README.md` (This File):**

   - You are currently reading the starter kit's README.
   - **Update the main title** (e.g., `# My New App`).
   - **Review and adapt all sections** to be relevant to _your_ new project. Remove or modify any instructions or descriptions that are specific to _using the starter kit itself_ and not to _using your application_.
   - Ensure the "Project Purpose" and "Technology Stack" (if you add/remove technologies) accurately describe your new application.

4. **Update Application Title & Metadata in `src/app/layout.tsx`:**

   - Open `src/app/layout.tsx`.
   - Modify the `metadata` object to reflect your application's identity:

     ```typescript
     // src/app/layout.tsx
     export const metadata: Metadata = {
       title: "My New App", // Your application's title for browser tabs, etc.
       description: "The best new App!", // Your app's description
       // You can add more metadata here: icons, openGraph, etc.
     };
     ```

5. **Replace Public Assets (`public/` directory):**

   - The `public/` directory contains static assets like `favicon.ico`, logos, or placeholder images.
   - Replace these with your project's own branding and assets. At a minimum, update `favicon.ico`.

6. **Database Name (Optional - `src/lib/db/index.ts`):**

   - The default database filename used by this starter is `starter_default.db`. If you wish to use a different filename for your project (e.g., `my_new_app.db`):
     1. Open `src/lib/db/index.ts`.
     2. Find the line: `const dbFileName = "starter_default.db";`
     3. Change `"starter_default.db"` to your desired filename.
     4. Ensure your `.gitignore` file still correctly ignores the new `.db` filename pattern (e.g., `*.db` or `database/*.db` should cover it).
     5. Remember this new name if you ever need to manually interact with or delete the database file.

7. **Clerk Application Keys & Configuration (`.env.local` and Clerk Dashboard):**

   - You should have already created a `.env.local` file and added your Clerk API keys during the initial setup.
   - **Crucially, ensure these keys belong to a Clerk application instance dedicated to _your new project_, not a generic or shared starter kit instance.**
   - Review settings in your [Clerk Dashboard](https://dashboard.clerk.com/) for this new application, such as redirect URLs, enabled authentication methods, session lifetimes, etc.

8. **Initialize Your Own Git Repository & Remote:**

   - The "Quickstart Guide" and "Using as a Starter for New Projects" sections detail how to remove the starter kit's Git history and initialize a new repository for your project, linking it to your own new GitHub (or other Git provider) repository. **This is a critical step to make the project truly yours.**

     ```bash
     # In your new project's root directory
     rm -rf .git
     git init
     git branch -m main
     git add .
     git commit -m "Initial commit for My new App"
     # Create a new empty repository on GitHub
     git remote add origin <URL_OF_YOUR_NEW_GITHUB_REPO>
     git push -u origin main
     ```

Completing these customization steps will ensure your new project is properly set up, uniquely identified, and ready for your specific development needs.

## Table of Contents

- [Quickstart Guide](#-quickstart-guide)
- [Project Purpose](#project-purpose)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Directory Structure](#directory-structure)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables-1)
  - [Database Management](#database-management)
  - [Running Locally](#running-locally)
  - [Running with Docker](#running-with-docker)
- [Authentication (Clerk)](#authentication-clerk)
- [Code Quality & Formatting](#code-quality--formatting)
- [GitHub Workflow (CI)](#github-workflow-ci)
- [Using as a Starter for New Projects](#using-as-a-starter-for-new-projects)
- [Resources](#resources)

## Project Purpose

This project serves as a robust foundation for building modern web applications using Next.js. It aims to:

- Streamline initial project setup.
- Provide a pre-configured, Dockerized development environment.
- Integrate essential tools for styling, data management, and authentication.
- Emphasize code quality through linting, formatting, and TypeScript.
- Include a basic CI workflow for GitHub Actions.

This starter kit uses **Clerk** for authentication and **BetterSQLite** (via `better-sqlite3`) for local database management.

## Technology Stack

### Core & Development

- **Next.js 15** (App Router)
- **TypeScript**
- **pnpm**
- **Docker & Docker Compose**

### Styling & UI

- **Tailwind CSS**
- **shadcn/ui (Base)** (Setup for theming, add components via `pnpm dlx shadcn-ui@latest add ...`)
- **next-themes** (Dark/Light mode)
- **lucide-react** (Icons)

### Database

- **SQLite** (via `better-sqlite3`)

### Authentication

- **Clerk** (`@clerk/nextjs`)

### Code Quality

- **ESLint** (with `next/core-web-vitals`, `next/typescript`)
- **Prettier** (with import sorting and Tailwind class sorting)
- `eslint-plugin-check-file` (Naming conventions)

_(Note: The original starter kit from which this was derived included other libraries like NextUI, Drizzle, NextAuth, etc. This version has been streamlined to focus on the stack listed above. You can integrate other tools as needed.)_

## Key Features

- Dockerized Development Environment.
- BetterSQLite Integration with manual schema migration.
- pnpm for package management.
- Clerk Authentication base setup.
- Path Aliases (`@/*`) configured.
- Tailwind CSS Theming base.

## Directory Structure

```

nuno-starter-kit-2.0/
├── Docker/ # Docker configuration (Dockerfile, docker-compose.yml)
├── database/ # Database files (schema.sql, .gitkeep; .db file is gitignored)
├── public/ # Static assets
├── src/ # Application source code
│ ├── app/ # Next.js App Router
│ ├── components/ # Reusable React components (ui/ for shadcn)
│ ├── lib/ # Core libraries (db connection in lib/db/index.ts)
│ ├── db/ # Database scripts (migrate.ts, reset.ts, utils.ts)
│ └── types/ # TypeScript definitions
├── .dockerignore
├── .env.local.example # Example environment variables
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── components.json # shadcn/ui config
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json

```

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (be sure to update to v20.x to be aligned with Dockerfile)
- [pnpm](https://pnpm.io/installation)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/nuno80/nuno-starter-kit-2.0.git my-app
   cd my-app
   ```

2. **Choose Your Development Approach:**

   - **Option A: Docker-Only Development (Recommended for consistency)**
     If you plan to develop exclusively within the Docker environment, you **do not need to run `pnpm install` on your local machine (WSL).** Docker will handle dependency installation. Proceed to "Environment Variables" and then to the "Running with Docker" section. The database migration script will also be run inside the Docker container.

   - **Option B: Local Development (or Hybrid with Docker)**
     If you want to run `pnpm run dev` directly on your local machine (WSL) or need local `node_modules` for IDE tooling:

     1. **Align Your Local Node.js Version (v20.x Recommended):**
        (Mantieni le istruzioni per nvm e il warning sul lockfile come prima)

        ```bash
        # Example using nvm:
        nvm install 20
        nvm use 20
        ```

     2. **Install Dependencies Locally:**

        ```bash
        pnpm install
        pnpm add -D tsx # Ensures tsx is available for local DB scripts
        ```

        ⚠️ **Warning:** Ensure your local Node.js version matches the project's target (v20.x) to keep `pnpm-lock.yaml` consistent with the Docker environment. If you use a different Node version and regenerate `pnpm-lock.yaml`, it might cause issues with the Docker build

3. **Set up Environment Variables:**

   1. Create a `.env.local` file in the project root (you can copy `.env.local.example` if it exists).
   2. Add your Clerk keys:

      ```env
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
      CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY
      # Optional: NEXT_PUBLIC_APP_URL=http://localhost:3000
      # Optional: Clerk redirect URLs (can also be set in Clerk Dashboard)
      ```

      Get keys from the [Clerk Dashboard](https://dashboard.clerk.com/).

4. **Initialize the Database Schema:**

   - **If using Docker-Only Development:** You will run the migration script _inside_ the Docker container after it's up and running for the first time:

     ```bash
     # After 'docker compose up -d'
     docker compose exec app pnpm run db:migrate
     ```

   - **If using Local Development:**

     ```bash
     pnpm run db:migrate
     ```

### Database Management (SQLite via BetterSQLite3)

This starter kit uses SQLite, accessed directly with `better-sqlite3`. The database schema is primarily defined in `database/schema.sql`. Management scripts are provided via pnpm to initialize, update, and reset your local development database.

1. **Core Files:**

   - **`database/starter_default.db`**: Your local SQLite database file. It's created in the `database/` directory. **This file is gitignored and should not be committed.**
   - **`database/schema.sql`**: The **source of truth for your complete database structure**. Define all `CREATE TABLE IF NOT EXISTS ...`, `CREATE INDEX IF NOT EXISTS ...`, etc., statements here. This file _is_ committed to version control.
   - **`database/adhoc_changes.sql`**: A temporary "scratchpad" file for SQL queries (`ALTER TABLE`, `UPDATE`, `DELETE`) that modify an existing database structure or data. **This file should be cleared or its contents commented out after use.** Its changes should ideally be reflected in `schema.sql` if they alter the final desired structure. This file _can_ be committed if you want to track a specific set of ad-hoc changes, but it's generally for one-time operations.
   - **`database/backups/`**: This directory is automatically created to store timestamped backups of your database. **This directory is gitignored.**

2. **Available pnpm Scripts for Database Management:**

   - **`pnpm run db:backup`**

     - **Purpose:** Manually creates a timestamped backup of your current `starter_default.db` file (and its `-shm`, `-wal` helper files) into the `database/backups/` directory.
     - **When to Use:** Before making significant manual changes to the database or schema, or whenever you want a snapshot of your local development data.

   - **`pnpm run db:migrate`**

     - **Purpose:** Applies the entire `database/schema.sql` to your `starter_default.db`. If the database file doesn't exist, it will be created.
     - **When to Use:**
       - **Initial Setup:** After cloning and `pnpm install`, run this to create your database tables for the first time.
       - **Adding New Tables/Indexes:** If you've added new `CREATE TABLE IF NOT EXISTS ...` or `CREATE INDEX IF NOT EXISTS ...` statements to `schema.sql`.
     - **Behavior:** Re-applies the full schema. Safe for additive changes using `IF NOT EXISTS`. **It will not automatically `ALTER` or `DROP` existing tables/columns** just because they are changed or removed in `schema.sql`.

   - **`pnpm run db:apply-changes`**

     - **Purpose:** Executes the SQL queries currently present in the `database/adhoc_changes.sql` file.
     - **Safety:** **Automatically creates a backup** in `database/backups/` before running the queries.
     - **When to Use:** To apply specific DML (`UPDATE`, `INSERT`, `DELETE`) or DDL (`ALTER TABLE`) commands to your existing database that are not covered by `db:migrate` (e.g., adding a column to an existing table).
     - **Important Workflow:**
       1. Write your `ALTER TABLE ...`, `UPDATE ...`, etc., queries in `database/adhoc_changes.sql`.
       2. Run `pnpm run db:apply-changes`.
       3. Verify the changes in your database.
       4. **Crucially, if you made structural changes (like `ALTER TABLE`), update `database/schema.sql` to reflect the new, complete table structure.** This keeps `schema.sql` as the definitive source for a fresh database setup.
       5. Clear or comment out the queries in `database/adhoc_changes.sql` to prevent re-running them unintentionally.

   - **`pnpm run db:reset`**
     - **Purpose:** Completely wipes your local `starter_default.db` and recreates it from scratch using the current `database/schema.sql`.
     - **Safety:** **Automatically creates a backup** in `database/backups/` before deleting the database.
     - **When to Use:**
       - When you want a fresh, empty database structured according to the latest `schema.sql`.
       - If `schema.sql` has major structural changes (including added columns in `CREATE TABLE` definitions, or dropped tables) and you want to apply them to a clean slate.
       - For troubleshooting database inconsistencies in development.
     - **Warning:** This command **deletes all data** in your local `starter_default.db`.

3. **Initial Database Setup Steps for a New Clone:**

   1. Ensure `tsx` is a dev dependency (it should be after `pnpm install` if listed in `package.json`, or run `pnpm add -D tsx`).
   2. Define your initial table structure in `database/schema.sql`.
   3. Run the migration script to create tables:

      ```bash
      pnpm run db:migrate
      ```

   4. Verify table creation using a SQLite browser.

4. **Workflow for Modifying Schema on an Existing Database:**
   - **Adding a new table/index:**
     1. Add `CREATE TABLE IF NOT EXISTS ...` or `CREATE INDEX IF NOT EXISTS ...` to `database/schema.sql`.
     2. Run `pnpm run db:migrate`.
   - **Adding a column, changing a type, or other `ALTER` operations (preserving data):**
     1. (Optional but recommended) Run `pnpm run db:backup`.
     2. Write your `ALTER TABLE ...` command(s) in `database/adhoc_changes.sql`.
     3. Run `pnpm run db:apply-changes`.
     4. Verify the change.
     5. **Update `database/schema.sql`** to reflect the new column in the `CREATE TABLE` definition.
     6. Clear `database/adhoc_changes.sql`.
   - **Major refactor or starting fresh (will wipe data):**
     1. Update `database/schema.sql` to the desired final state.
     2. Run `pnpm run db:reset` (a backup will be made automatically).

This workflow provides a balance casualties of simplicity for initial setup and a controlled way to apply ad-hoc changes, backed by automatic backups for a safety net during development. For production environments or complex, multi-developer schema evolution, a fully versioned migration system would be the next step.

### Running Locally

```bash
pnpm run dev
```

Access at `http://localhost:3000`. Ensure you've run `pnpm run db:migrate` at least once.

### Running with Docker

(Recommended for a consistent environment)

1. **Ensure Docker Desktop is running.**
2. Navigate to the `Docker/` directory: `cd Docker`
3. **Build image (first time or after Dockerfile/config changes):**

   ```bash
   docker compose build --no-cache app
   ```

4. **Run containers:**

   ```bash
   docker compose up
   ```

   (For detached mode, use `docker compose up -d`. View logs with `docker compose logs -f app`.)
   Access at `http://localhost:3000`.

5. **Hot Reloading:** Code changes in `src/` and `public/` on your local machine should reflect immediately in the browser due to Docker volume mounts. If not, try uncommenting `WATCHPACK_POLLING: "true"` in `docker-compose.yml`.

6. **Stopping Containers:** Press `Ctrl+C` in the terminal running `docker compose up`, or run `docker compose down` (use `docker compose down -v` for full cleanup including anonymous volumes).

7. **Production Optimization:** Refer to [`guida_ottimizzazione_docker.md`](./guida_ottimizzazione_docker.md) for creating smaller production images.

## Authentication (Clerk)

(Questa sezione sembra già buona, la lascio com'era nel tuo file)
User authentication is handled by [Clerk](https://clerk.com/).

- Sign-up, sign-in, user profiles, and session management are managed by Clerk components and APIs.
- Ensure your Clerk instance is configured in the [Clerk Dashboard](https://dashboard.clerk.com/) with the correct redirect URLs and any social providers you wish to use.

### Access Control Pages

- `/devi-autenticarti`: Displayed when authentication is required.

- `/no-access`: Displayed when an authenticated user lacks permissions for a route.

### Route Protection

Route protection is implemented via `src/middleware.ts` using `clerkMiddleware`.

- **Public Routes**: (e.g., `/`, `/about`) - Accessible to all.
- **Authenticated Routes**: (e.g., `/features`, `/user-dashboard`) - Require login.
- **Admin Routes**: (e.g., `/dashboard`, `/admin/*`, `/api/admin/*`) - Require login and 'admin' role (defined in user's `publicMetadata.role` on Clerk and checked in `sessionClaims.metadata.role`).
  The `/dashboard` page is an example of an admin-only page.

## Code Quality & Formatting

(Questa sezione sembra già buona)

- **ESLint** and **Prettier** are configured for linting and code formatting.
- **Naming Conventions**: Enforced by `eslint-plugin-check-file` (KEBAB_CASE for files and folders in `src`).
- To format code:

  ```bash
  pnpm run format
  ```

- Linting is typically integrated with your IDE and also run during the CI process.

## GitHub Workflow (CI)

(Questa sezione sembra già buona e aggiornata per pnpm)
A basic CI workflow can be set up using GitHub Actions. Create `.github/workflows/ci.yaml`:

```yaml
name: CI
# ... (contenuto YAML come l'avevi, è corretto per pnpm)
# ... (assicurati che node-version in setup-node sia '18' o '20' per coerenza col Dockerfile)
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8 # Or your target pnpm version

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20" # Match your project's Node.js version (e.g., from Dockerfile)
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm tsc --noEmit # Or your specific typecheck script

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm run build
```

## Using as a Starter for New Projects

(Questa sezione sembra già buona)

1. Create a new repository on GitHub (e.g., `my-new-project`). **Do not** initialize it with a README or other files.
2. Clone this starter kit repository (`nuno-starter-kit-2.0`) to your local machine.
3. Navigate into the cloned directory.
4. Remove the existing Git remote:

   ```bash
   git remote remove origin
   ```

5. (Optional, for a clean history in your new project) Remove the `.git` folder and re-initialize Git:

   ```bash
   rm -rf .git
   git init
   git branch -m main
   git add .
   git commit -m "Initial commit from nuno-starter-kit-2.0"
   ```

6. Add your new GitHub repository as the remote:

   ```bash
   git remote add origin <URL_OF_YOUR_NEW_GITHUB_REPO>
   ```

7. Push to your new repository:

   ```bash
   git push -u origin main
   ```

8. Follow the [Development Setup](#development-setup) steps for your new project.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)

- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [BetterSQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [pnpm Documentation](https://pnpm.io/motivation)
