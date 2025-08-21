# AI Mock Interview

AI Mock Interview is a platform that helps users practice for their upcoming interviews. Users can take mock interviews, get feedback on their performance, and track their progress over time.

## Features

*   **User Authentication:** Secure user authentication using Clerk.
*   **Mock Interviews:** Take mock interviews with AI-powered questions.
*   **Feedback:** Get detailed feedback on your performance, including a transcript of your answers and suggestions for improvement.
*   **Dashboard:** Track your progress over time with a personalized dashboard.
*   **Responsive Design:** The application is fully responsive and works on all devices.

## Tech Stack

### Frontend

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
*   **UI Components:** [Radix UI](https://www.radix-ui.com/)
*   **State Management:** React Hooks
*   **Animations:** [Lucide React](https://lucide.dev/guide/react) for icons

### Backend

*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **AI:** [Google Gemini](https://ai.google.dev/)

### Authentication

*   **Provider:** [Clerk](https://clerk.com/)

### Deployment

*   **Platform:** [Vercel](https://vercel.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v20 or later)
*   npm
*   PostgreSQL

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/ai-mock-interview.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables by creating a `.env.local` file in the root of the project and adding the following:
    ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

    DATABASE_URL=your_database_url
    ```
4.  Run the database migrations
    ```sh
    npm run drizzle-kit:generate
    ```
5.  Start the development server
    ```sh
    npm run dev
    ```

## Project Structure

```
.
├── app
│   ├── (main)
│   │   ├── dashboard
│   │   │   ├── interview
│   │   │   │   └── [interviewId]
│   │   │   │       ├── feedback
│   │   │   │       └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── _actions
│   │   │       ├── feedback.ts
│   │   │       └── interview.ts
│   │   └── layout.tsx
│   ├── api
│   │   └── ...
│   ├── components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── HeaderButtons.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── styles
│       └── globals.css
├── components
│   └── ui
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── code-editor.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── sonner.tsx
│       └── textarea.tsx
├── drizzle.config.ts
├── lib
│   └── utils.ts
├── middleware.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── public
├── tailwind.config.js
└── tsconfig.json
```

## Configuration

*   `drizzle.config.ts`: Configuration for Drizzle ORM.
*   `next.config.js`: Configuration for Next.js.
*   `postcss.config.js`: Configuration for PostCSS.
*   `tailwind.config.js`: Configuration for Tailwind CSS.
*   `tsconfig.json`: Configuration for TypeScript.

## Deployment

The application is deployed on [Vercel](https://vercel.com/). Any push to the `main` branch will trigger a new deployment.