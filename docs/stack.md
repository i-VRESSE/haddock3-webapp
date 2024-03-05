# Stack

We want to make a haddock3 web application that uses

- [bartender](https://github.com/i-VRESSE/bartender) for job execution.
- [workflow-builder](https://github.com/i-VRESSE/workflow-builder) to construct a Haddock3 workflow config file.
- [haddock3](https://github.com/haddocking/haddock3) to compute

As the workflow-builder is written in TypeScript, so we will use TypeScript for the web application.
We are using NodeJS for runtime.

## OpenAPI client

The bartender web service provides an OpenAPI specification.
To talk to the bartender web service, we use an OpenAPI client.

A client can be generated with different tools.

- [openapi-generator-cli](https://github.com/OpenAPITools/openapi-generator-cli)
  - NodeJS wrapper around Java based [openapi-generator](https://github.com/OpenAPITools/openapi-generator)
- [swagger-js](https://github.com/swagger-api/swagger-js), dynamic client
  - has no TypeScript support
- [swagger-codegen](https://github.com/swagger-api/swagger-codegen)
  - must download jar file self

Picked `openapi-generator-cli` because it is easy to install and use.

## Meta framework

A meta framework is a framework around a UI framework like React to build a web application with server side rendering (SSR).

As workflow-builder is written in React we need to use a meta framework that is compatible with React.

Looked at suggestions at <https://react.dev/learn/start-a-new-react-project>

- [Next.js](https://nextjs.org/)
  - unable to intergrate workflow builder as it uses wasm import which webpack wants to resolve at build time instead of runtime.
- [Remix](https://remix.run/)
  - workflow builder works without jumping through hoops
- Gatsby

Picked Remix.

## ORM

- [Prisma](https://www.prisma.io/)
  - does joins in client instead of database, so if we need to do a lot of joins we will want to switch to something else.
- TypeOrm
- Kysely
- db client
- Drizzle ORM

Picked Drizzle ORM because it is more SQL-like and has less magic than prisma like dts generation or rust backend.

## Validation

- zod
- valibot

Picked valibot as it newer.
