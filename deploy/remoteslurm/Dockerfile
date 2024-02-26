# Dockerfile for slurm scheduler with sshd, haddock3, lightdock, gdock executables.
# Used for running as remote slurm machine against the docker-compose.yml

# Build with:
# cd deploy
# docker build --tag ghcr.io/i-vresse/slurm -f remoteslurm/Dockerfile .
# Run with:
# docker run --publish 10022:22 ghcr.io/i-vresse/slurm

FROM xenonmiddleware/slurm:20

ARG HADDOCK3_VERSION=main
ARG GDOCK_VERSION=master
ARG LIGHTDOCK_VERSION=0.9.4

USER root

# Common dependencies =================================================================================================

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential git ca-certificates curl libgfortran3 \
  wget \
  &&  \
  apt-get clean && rm -rf /var/lib/apt/lists/* \
  && \
  pip install --upgrade pip

# TODO install python 3.9 from mamba or src

# haddock3 ============================================================================================================
WORKDIR /opt/haddock3
RUN git clone --recursive https://github.com/haddocking/haddock3.git . && git checkout ${HADDOCK3_VERSION}
WORKDIR /opt/haddock3/src/fcc/src
RUN make
WORKDIR /opt/haddock3
RUN pip install -r requirements.txt && python setup.py develop
COPY ./cns /opt/haddock3/bin/cns
WORKDIR /
ENV PYTHONPATH=/opt/haddock3/src

# lightdock ==========================================================================================================

RUN pip install lightdock==${LIGHTDOCK_VERSION}

# gdock =============================================================================================================

WORKDIR /opt/gdock
RUN git clone https://github.com/gdocking/gdock.git . && git checkout ${GDOCK_VERSION}
RUN python setup.py develop
RUN bash install.sh /opt/gdock
ENV GDOCK_PATH=/opt/gdock

# All commands from here on will be run as the xenon user and not as root.
USER xenon

RUN mkdir /home/xenon/.ssh && chmod 700 /home/xenon/.ssh
