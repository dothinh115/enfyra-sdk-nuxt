# @enfyra/sdk-nuxt

Nuxt SDK for Enfyra CMS

## Installation

```bash
npm install @enfyra/sdk-nuxt
```

## Usage

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@enfyra/sdk-nuxt'
  ],
  runtimeConfig: {
    public: {
      enfyraSDK: {
        appUrl: 'http://localhost:3000',
        apiUrl: process.env.API_URL,
        apiPrefix: '/api',
      },
    },
  },
})
```

## Composables

### useEnfyraApi

```typescript
const { data, error, pending, execute } = useEnfyraApi('/users')
```

### useEnfyraAuth

```typescript
const { me, login, logout, fetchUser } = useEnfyraAuth()
```