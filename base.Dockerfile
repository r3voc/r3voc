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
