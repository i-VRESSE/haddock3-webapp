# Docker file for haddock3-webapp
# base node image
FROM node:18-bookworm-slim as base

LABEL org.opencontainers.image.source=https://github.com/i-VRESSE/haddock3-webapp/blob/main/deploy/Dockerfile
LABEL org.opencontainers.image.licenses=Apache-2.0
LABEL org.opencontainers.image.description="Haddock3 webapplication image."

ARG HADDOCK3_WEBAPP_PREFIX=/

# set for base and all layer that inherit from it
ENV NODE_ENV production

RUN apt update && apt install -y libssl3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json tsconfig.json ./
RUN npm install --production=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production 

# Build the app
ENV HADDOCK3_WEBAPP_PREFIX=${HADDOCK3_WEBAPP_PREFIX}
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

EXPOSE 8080

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules

COPY --from=build /myapp/build/server /myapp/build/server
COPY --from=build /myapp/build/client /myapp/build/client
COPY --from=build /myapp/app/drizzle /myapp/app/drizzle

COPY --from=build /myapp/package.json /myapp/package.json

COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait

ENTRYPOINT [ "npm", "run", "start" ]

HEALTHCHECK --interval=30s --timeout=5s CMD curl --fail http://localhost:8080/ || exit 1
