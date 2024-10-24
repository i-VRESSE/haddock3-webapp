# Contributing

We welcome contributions form everyone. Please use our [GitHub issue
tracker](https://github.com/i-VRESSE/haddock3-webapp/issues) for questions, ideas, bug
reports, or feature requests.

If you want to make a pull request:

1. discuss your idea first, before putting in a lot of effort
1. refer to the [developer
   documentation](https://github.com/i-VRESSE/haddock3-webapp/tree/main#development)
1. if needed, fork the repository to your own Github profile
1. work on your own feature branch
1. make sure the existing tests still work and add new tests (if necessary)
1. update or expand the documentation;
1. make sure your code follows the style guidelines
1. don't be afraid to ask help with any of the above steps. We're happy to help!

By participating in this project, you agree to abide by the [code of
conduct](https://github.com/i-VRESSE/haddock3-webapp/blob/main/CODE_OF_CONDUCT.md).

## Development

If you want to contribute to the development of the webapp, you can follow the instructions below.

### Develop inside devcontainer

You can develop inside a [devcontainer](https://containers.dev/) inside Visual Studio Code. The devcontainer includes all services required by the webapp.

When you exit VS code the containers will keep running, kill by running `docker compose -f .devcontainer/docker-compose.yml -p haddock3-webapp_devcontainer down` in the terminal or in VS Code reopen folder outside container.

### Development outside devcontainer

To develop the webapp ouside a devcontainer you have the following services running:

1. PostgreSQL database for user management
2. [Bartender web service](https://github.com/i-VRESSE/bartender/) for job executation and input/output storage.
3. [Haddock3 restraints web service]() for calculating restraints on scenario pages.

The PostgreSQL database can be started in a container with

```sh
npm run docker:dev
```

(Stores data in a Docker volume)
(You can get a psql shell with `npm run psql:dev`)
(On CTRL-C the database is stopped. To remove container and volume use `npm run docker:devrm`)

The database must be initialized with

```sh
npm run setup
# This will create tables
```

## Start development server

Start [remix](https://remix.run) development server from your terminal with:

```sh
npm run dev
```

This will refresh & rebuild assets on file changes.
Visiting a complicated page for the first time, will need a manual page reload, as the server optimizes dependencies.

## Other development commands

The database setup should be run only once for a fresh database.
Whenever you change the `app/drizzle/schema.server.ts` file you need to run [npm run generate:migration](https://orm.drizzle.team/kit-docs/commands#generate-migrations) to generate a migration, edit generated `app/drizzle/*.sql` file if needed and then run `npm run setup` to apply migration to database.

To format according to [prettier](https://prettier.io) run

```sh
npm run format
```

It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save.

To lint according [eslint](https://eslint.org) run

```sh
npm run lint
```

To check the Typescript types run

```sh
npm run typecheck
```

For testing see [docs/testing.md](docs/testing.md).

## Start production server

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
export $(cat .env |grep -v '#' |xargs)
npm start
```

## Creating a release

If you made changes to the webapp and want to create a new release, follow these steps:

1. Update the version in `package.json`
2. Goto the [releases page](https://github.com/i-VRESSE/haddock3-webapp/releases)
3. Copy the first line in the description of the latest release to you clipboard.
4. Click on the `Draft a new release` button
5. Paste the line from the clipboard into the `Tag version` field
6. Set tag and title to same version used in `package.json` with a `v` prefix.
7. Press `Generate release notes` button
8. Adjust description if needed
9. Press `Publish release` button
