# My Blog

A minimal personal blog built with Next.js, Material UI, Better Auth, Prisma, and SQLite. Published posts are public. Visitors can create an account without email verification to like and comment. The author uses one private role to manage drafts and published posts.

## Local setup

1. Install packages with `bun install`.
2. Copy `.env.example` to `.env` and set a private `BETTER_AUTH_SECRET` (for example, `openssl rand -base64 32`), your owner email, and a unique owner password of at least 12 characters.
3. Generate Prisma Client and apply the SQLite migration:

   ```bash
   bun run db:generate
   bun run db:migrate
   ```

4. Create the owner account before making public registration available:

   ```bash
   bun run db:owner
   ```

5. Start the app with `bun dev` and open <http://localhost:3000>.

The owner account is created separately from public registration, so a reader cannot claim author privileges by choosing the same email address. Reader signups receive the `reader` role; only the setup command creates an author.

## Features

- One editor page for drafts and published posts, with autosave and publish/unpublish controls.
- Public home and article pages, with “load more” pagination.
- Better Auth email/password registration and sign-in.
- Comments with editing and deletion for their author, and deletion by the blog owner.
- One like per account per article, with repeat clicks to remove a like.
- Comment rate limit of five comments per account per minute.

The SQLite file is stored at `prisma/dev.db` by default. A deployed instance needs a persistent writable disk for that file and the generated Prisma client at build time.
