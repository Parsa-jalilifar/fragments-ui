# Dockerfile for Fragments UI

# Stage 0: install node + dependncies
FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS dependencies

# LABEL adds metadata to an image
LABEL maintainer="Parsa Jalilifar <pjalilifar@myseneca.ca>" \
    description="fragments-ui web app for testing"

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json ./

RUN npm ci

#######################################################################

# Stage 1: use dependencies to build the site
FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS builder

WORKDIR /app

# Copy cached dependencies from stage 0 to stage 1 so we don't have to download them again
COPY --from=dependencies /app /app

# Copy source code into the image
COPY . .

# Build the site
RUN npm run build

#######################################################################

# Stage 2: nginx web server to host the built site
FROM nginx:stable-alpine@sha256:0a88a14a264f46562e2d1f318fbf0606bc87e72727528b51613a5e96f483a0f6 AS deploy

# Put our build/ into /usr/share/nginx/html/ and host static files
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl --fail localhost:80 || exit 1