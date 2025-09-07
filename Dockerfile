FROM archlinux:base AS base

WORKDIR /app

RUN pacman -Syu --noconfirm \
    inkscape \
    imagemagick \
    nodejs \
    yarn \
    archlinux-keyring \
    ffmpeg

# ffmpeg-headless
# RUN useradd -m aur && \
#     echo "aur ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
# 
# USER aur
# WORKDIR /home/aur
# 
# # Install ffmpeg-headless from normal AUR
# RUN git clone https://aur.archlinux.org/ffmpeg-headless.git && \
#     cd ffmpeg-headless && \
#     makepkg -si --noconfirm --skippgpcheck && \
#     cd .. && rm -rf ffmpeg-headless

RUN ffmpeg -version

USER root
WORKDIR /app

# # Cleanup pacman cache and aur user
# RUN pacman -Scc --noconfirm && \
#     userdel -r aur

# # Uninstall base-devel
# RUN pacman -Rns --noconfirm base-devel git

# Setup chaotic aur
RUN pacman-key --init && \
    pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com && \
    pacman-key --lsign-key 3056513887B78AEB && \
    pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' && \
    pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst' && \
    echo -e "\n[chaotic-aur]\nInclude = /etc/pacman.d/chaotic-mirrorlist" | tee -a /etc/pacman.conf

# Install python 3.9 from chaotic aur
RUN pacman -Syu --noconfirm python39

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

CMD ["./entrypoint.sh"]
