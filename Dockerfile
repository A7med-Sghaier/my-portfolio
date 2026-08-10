# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:1.28-alpine
ARG PNPM_VERSION=9.15.0

FROM ${NODE_IMAGE} AS workspace-base
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
WORKDIR /workspace

RUN corepack enable \
  && corepack prepare "pnpm@${PNPM_VERSION}" --activate \
  && pnpm config set store-dir /pnpm/store

FROM workspace-base AS workspace-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.base.json ./
COPY apps/portfolio/package.json apps/portfolio/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/i18n/package.json packages/i18n/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN --mount=type=cache,id=portfolio-pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

FROM workspace-dependencies AS workspace-source
COPY . .

FROM workspace-source AS workspace-build
RUN pnpm --filter @portfolio/core build \
  && pnpm --filter @portfolio/api-client build

FROM workspace-build AS portfolio-build
# Empty VITE_API_URL keeps browser calls same-origin: the serving edge proxies
# /api to the API, so auth and CSRF cookies stay first-party.
ARG VITE_API_URL=""
ARG VITE_PUBLIC_SITE_URL=https://a7med-sghaier.app
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PUBLIC_SITE_URL=${VITE_PUBLIC_SITE_URL}
RUN pnpm --filter @portfolio/portfolio build

FROM ${NGINX_IMAGE} AS static-runtime
RUN rm -f /etc/nginx/conf.d/default.conf \
  && mkdir -p /tmp/client-body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi \
  && chown -R nginx:nginx /tmp/client-body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi
ENTRYPOINT []
USER nginx
EXPOSE 8080
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]

FROM static-runtime AS portfolio
LABEL org.opencontainers.image.title="Ahmed Sghaier Portfolio"
LABEL org.opencontainers.image.source="https://github.com/A7med-Sghaier/my-portfolio"
LABEL org.opencontainers.image.licenses="MIT"
COPY --chown=nginx:nginx docker/nginx/portfolio.conf /etc/nginx/nginx.conf
COPY --from=portfolio-build --chown=nginx:nginx /workspace/apps/portfolio/dist/ /usr/share/nginx/html/
