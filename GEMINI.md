# Closer CRM - Project Instructions

## Architecture & Patterns
- **Framework:** React 19 + Vite.
- **Routing:** React Router DOM v7 with code-splitting (`React.lazy` and `Suspense`) for optimized loading.
- **State Management:** React Context API with `useMemo` and `useCallback` to prevent unnecessary re-renders.
- **Backend:** Firebase (Auth and Firestore).
- **Styling:** CSS Modules + Global CSS variables in `index.css`.

## Development Standards
- **Data Safety:** Always enable Firestore offline persistence in `firebase.js`.
- **Performance:** Avoid `await` on simple Firestore writes (add/update/delete) when immediate UI navigation is required; rely on Firebase latency compensation.
- **Accessibility:** Maintain WCAG contrast standards in Dark Mode by using the defined palette variables in `index.css`.
- **Security:** Sign-up is disabled. All users must be manually invited/created via Admin or external Auth management.

## UI Components
- **Buttons:** Use the standard `Button.jsx` component.
- **Dialogs:** Use `ConfirmDialog.jsx` for all destructive actions.
- **Status:** Use `InlineStatus.jsx` for lead status management in tables.

## Deployment
- **Hosting:** Firebase Hosting.
- **Cache Control:** `index.html` is configured to never cache (via `firebase.json`) to ensure users always see the latest version after a deploy.
