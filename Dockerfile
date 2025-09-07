FROM ghcr.io/realraum/r3voc-base:latest AS base

# First, set up the intro-outro-generator
FROM base AS generator

WORKDIR /app/intro-outro-generator

COPY intro-outro-generator ./

RUN python3.9 -m venv env && \
    ./env/bin/python -m pip install -r requirements.txt

# Then, set up r3voc-mgmt-ui

FROM base AS ui

WORKDIR /app/r3voc-mgmt-ui

COPY r3voc-mgmt-ui/package.json ./
COPY r3voc-mgmt-ui/yarn.lock ./
COPY r3voc-mgmt-ui/tsconfig.json ./
COPY r3voc-mgmt-ui/schedule.mjs ./

RUN mkdir -p src

RUN yarn install --frozen-lockfile

COPY r3voc-mgmt-ui ./

RUN yarn build

# Finally, set up r3voc-mgmt-backend

FROM base AS backend

WORKDIR /app/r3voc-mgmt-backend

COPY r3voc-mgmt-backend/package.json ./
COPY r3voc-mgmt-backend/yarn.lock ./
COPY r3voc-mgmt-backend/tsconfig.json ./
COPY r3voc-mgmt-backend/schedule.mjs ./

RUN mkdir -p src

RUN yarn install --frozen-lockfile

COPY r3voc-mgmt-backend ./

# Now create the final image with everything set up

FROM base AS final

WORKDIR /app

COPY --from=generator /app/intro-outro-generator ./intro-outro-generator
COPY --from=ui /app/r3voc-mgmt-ui ./r3voc-mgmt-ui
COPY --from=backend /app/r3voc-mgmt-backend ./r3voc-mgmt-backend

COPY scripts ./scripts

# Expose ports for the UI and backend (express and vite)
EXPOSE 3000 4173

# Start both the UI and backend using a simple script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENV R3VOC_REPO_LOCATION=/app

ARG COMMIT_SHA
ENV COMMIT_SHA=${COMMIT_SHA}

ARG CI_RUN_ID
ENV CI_RUN_ID=${CI_RUN_ID}

CMD ["./entrypoint.sh"]
