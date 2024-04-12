# Testing

## Unit Testing

To run unit tests (`app/**/*.test.ts`) with [Vitest](https://vitest.dev) use

```sh
# In watch mode
npm run test
# or in single run mode with coverage
npm run test -- run --coverage
```

## End-to-End Testing

To run end-to-end tests (`tests/*.spec.ts`) with [Playwright](https://playwright.dev) use

```sh
docker compose -f deploy/arq/docker-compose.yml -p playwright build
# Make sure tests start in a fresh state
docker compose -f deploy/arq/docker-compose.yml -p playwright down -v
npx playwright test
```
