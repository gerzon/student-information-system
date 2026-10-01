# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

## Admin API integration

The Vite development server proxies `/api` requests to the ASP.NET Core API at
`http://localhost:5121`. Start that API before signing in through the admin login page.
The admin dashboard and console use the administrator login endpoint, then fetch the
summary and recent students from `GET /api/admin/dashboard` with the returned bearer token.
Only one active session is allowed per administrator account. Use Logout to release it;
otherwise the next sign-in is available after the one-hour token expires. The API requires
the `AdminLoginSessions` database migration before it can start with this session enforcement.
Apply the pending migrations from the API project directory with `dotnet ef database update`
before restarting the API.

The administrator console manages positions, designations, and access-level catalog entries
through the authenticated `/api/admin/catalogs/{catalogType}` endpoints (`positions`,
`designations`, and `access-levels`). These entries are reference data only; access levels do
not currently grant permissions or change authorization behavior.

System administrator creation remains under **System Administrators**. Create generic
front-end sign-in accounts separately under **Front-end Users**. Assign any number of
positions and designations using drag-and-drop on that page; assignments are optional and do
not grant administrator access. The shared sign-in endpoint authenticates these accounts with
a generic front-end role. Apply the `PortalUserProfiles` and `PortalUserCatalogAssignments`
migrations before creating front-end users.

For deployments where the API is hosted on a different origin, set `VITE_API_BASE_URL` to
the API origin (for example, `https://api.example.com`) and configure the API host to allow
the frontend origin. Leave it unset when using the local Vite proxy.
