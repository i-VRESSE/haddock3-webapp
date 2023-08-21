# base node image
FROM node:18-bullseye-slim

# set for base and all layer that inherit from it
ENV NODE_ENV production

WORKDIR /myapp

ADD package.json package-lock.json tsconfig.json ./

RUN npm install --production=false

ADD prisma ./prisma
