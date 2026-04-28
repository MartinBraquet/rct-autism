# Web Application

This folder contains the source code for https://rct-autism.vercel.app: the web page of the trial with layman's explanations and nice dynamic results of the study. Built with Next.js, React and TypeScript.

## Overview


## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 3.3.3
- **State Management**: React Context + Custom Hooks
- **Charts**: Recharts

## Project Structure

```
web/
├── components/            # React components
├── hooks/                 # Custom React hooks (50+)
├── lib/                   # Utilities and services
├── pages/                # Next.js pages
│   ├── api/              # API routes
│   ├── _app.tsx          # App wrapper
│   ├── _document.tsx     # Document setup
├── public/               # Static assets
├── styles/               # Global CSS
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 20.x or later
- Yarn 1.x


Install `yarn` (if not already installed):

```bash
npm install --global yarn
```

### Installation

```bash
# From root directory
yarn install
```

### Development

```bash
# Run web app with hot reload
yarn dev
```

Visit http://localhost:3000

### Build

```bash
# Production build
yarn build

# Start production server
yarn start
```

### Linting

```bash
# Check lint
yarn lint

# Fix lint issues
yarn lint-fix
```

## Key Concepts

### Components

Components are organized by feature in `/components`. Reusable widgets are in `/components/widgets`.

Example component:

```tsx
// components/profile/profile-card.tsx
import {User} from 'common/src/user'

interface ProfileCardProps {
  user: User
  onLike?: (userId: string) => void
}

export function ProfileCard({user, onLike}: ProfileCardProps) {
  return (
    <div className="profile-card">
      <img src={user.avatarUrl} alt={user.name} />
      <h3>{user.name}</h3>
      <button onClick={() => onLike?.(user.id)}>Like</button>
    </div>
  )
}
```

### Hooks

Use custom hooks for stateful logic. Common hooks:

- `useUser()` - Get current user
- `useAPIGetter()` - Fetch API data with caching
- `useMutation()` - Handle form submissions
- `usePersistentInMemoryState()` - Cache state across pages

```tsx
import {useAPIGetter} from 'web/hooks/use-api-getter'

function ProfileList() {
  const {data, refresh} = useAPIGetter('get-profiles', {})

  if (!data) return <Loading />

  return (
    <div>
      {data.profiles.map((profile) => (
        <ProfileCard key={profile.id} user={profile} />
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}
```


### Styling

Tailwind CSS is used for styling. Use utility classes:

```tsx
<div className="flex items-center justify-between p-4 bg-canvas-50 rounded-lg">
  <span className="text-ink-900 font-medium">Content</span>
</div>
```
