# Deployment Guide (Vercel)

This application is built with Next.js and Prisma (SQLite). 

## Prerequisites

1.  **GitHub Account**: You must push this code to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Kakao Maps API Key**: You need your JavaScript Key from Kakao Developers.

## ⚠️ Important Note About Database

This project currently uses **SQLite** (`file:./dev.db`).
-   **Vercel is Serverless**: The filesystem is ephemeral (temporary).
-   **Issue**: If you deploy with SQLite to Vercel, **any data you add will disappear** when the server function restarts (which happens often).
-   **Solution**: For a real production app, you should switch to **PostgreSQL** or **MySQL** (e.g., Supabase, PlanetScale, or Vercel Postgres).

**However, for a simple demo or read-only deployment, you can proceed below.**

## Deployment Steps

1.  **Push to GitHub**
    -   Create a new repository on GitHub.
    -   Push your code:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin <YOUR_REPO_URL>
        git push -u origin main
        ```

2.  **Import to Vercel**
    -   Go to Vercel Dashboard -> "Add New..." -> "Project".
    -   Select your GitHub repository.

3.  **Environment Variables**
    -   In the "Environment Variables" section, add:
        -   `DATABASE_URL`: `file:./dev.db` (For SQLite demo) OR your Postgres connection string.
    -   **Critical**: You cannot use `.env` files committed to git for secrets.

4.  **Register Domain (Kakao Maps)**
    -   Once Vercel gives you a domain (e.g., `your-app.vercel.app`), go to [Kakao Developers Console](https://developers.kakao.com/).
    -   Select your app -> Platform -> Web.
    -   Add `https://your-app.vercel.app` to "Site Domain".
    -   **Without this, the map will not load.**

5.  **Build & Deploy**
    -   Click "Deploy".
    -   Wait for the build to finish.

## Switching to Vercel Postgres (Recommended)

1.  Create a Vercel Postgres database in the Vercel dashboard.
2.  Get the credentials (`POSTGRES_PRISMA_URL` etc.).
3.  Update `prisma/schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("POSTGRES_PRISMA_URL") // or DATABASE_URL
    }
    ```
4.  Run `npx prisma generate`.
5.  Push changes to GitHub.
