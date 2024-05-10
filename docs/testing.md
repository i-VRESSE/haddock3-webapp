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
# TODO remove build-args when merged https://github.com/haddocking/haddock3/pull/841 is nerged
docker compose -f deploy/arq/docker-compose.yml -p playwright build --build-arg HADDOCK3_VERSION=web-service --build-arg HADDOCK3_GHORG=i-VRESSE
# Make sure tests start in a fresh state
docker compose -f deploy/arq/docker-compose.yml -p playwright down -v
# Install browsers
npx playwright install
# Run tests on all browsers
npx playwright test
# or for interactive mode, use `await page.pause()` in tests
npx playwright test --headed --timeout 0
# or to run with webkit
npx playwright test --project webkit
```

Playwright can not be run when you are inside a devcontainer. You need to run it on your host machine.

## Component testing and development

Use [Storybook](https://storybook.js.org) to develop and test components in isolation.

```sh
npm run storybook
```
