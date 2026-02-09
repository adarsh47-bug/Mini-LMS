# Quick Reference Guide

## Architecture Overview

### Project Structure
```
src/
├── components/          ← Reusable UI components
│   ├── App_notify/      ← Notification banner system
│   ├── Dropdown/        ← Custom dropdown with gestures
│   ├── NetworkStatus/   ← Offline/online indicators
│   ├── ConfirmModal.tsx
│   ├── ImagePickerModal.tsx
│   ├── ThemedButton.tsx
│   ├── ThemedInput.tsx
│   └── ThemeToggle.tsx
├── constants/           ← App config, colors, fonts
├── context/             ← Auth, notifications, theme providers
├── hooks/               ← Custom hooks (network, storage)
├── screens/             ← Screen components
├── services/            ← API client & auth service
├── stores/              ← Zustand stores (network state)
├── types/               ← TypeScript types & Zod schemas
└── utils/               ← Validation & date helpers
```

---

## Notifications (Unified System)

All app feedback uses a single notification system — no separate toast context.

```tsx
import { useNotification } from '@/src/context';

const notification = useNotification();

// Quick helpers
notification.success('Profile updated!');
notification.error('Something went wrong.');
notification.warning('Check your connection.');
notification.info('You have been signed out.');

// Full config
notification.showNotification({
  title: 'Post deleted',
  variant: 'delete',
  position: 'top',
  duration: 5000,
  actions: [{ label: 'Undo', onPress: handleUndo }],
});
```

---

## Auth Context

```tsx
import { useSession } from '@/src/context';

const { signIn, signUp, signOut, refreshUser, user, session, isLoading } = useSession();

// Pull-to-refresh user data
await refreshUser();
```

---

## Form Validation (Zod)

```tsx
import { validate } from '@/src/utils';
import { loginSchema } from '@/src/types';

const result = validate(loginSchema, { username, password });
if (!result.success) {
  setErrors(result.errors);
}
```

---

## Network Monitoring

```tsx
import { useNetworkStore } from '@/src/stores';

const isConnected = useNetworkStore(state => state.isConnected);
```

---

## Key Features

- **Pull-to-refresh** on Home and Profile screens
- **Image picker modal** — Camera or Gallery selection
- **Auto notifications** on login, register, sign-out
- **Token refresh** with automatic retry queue
- **Theme system** with light/dark/system modes
- **Network monitoring** with offline indicators

---

## Documentation

- Usage examples: [documentation/usage-examples.tsx](documentation/usage-examples.tsx)
- API docs: [documentation/FreeAPI_Authentication.md](documentation/FreeAPI_Authentication.md)
