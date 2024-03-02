# Dockerfile with slurm scheduler, sshd, haddock3, lightdock, gdock executables.
FROM ghcr.io/xenon-middleware/slurm:23

ARG HADDOCK3_VERSION=main
ARG GDOCK_VERSION=master
ARG LIGHTDOCK_VERSION=0.9.4

USER root

# Common dependencies =================================================================================================

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential git ca-certificates curl libgfortran5 \
  wget software-properties-common gpg-agent \
  &&  \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# python 3.9 + /usr/local/bin/pip ==========================================================================================================

RUN add-apt-repository -y ppa:deadsnakes/ppa && \
    DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt install -y python3.9 python3.9-dev python3.9-distutils && \
    wget https://bootstrap.pypa.io/get-pip.py && \
    python3.9 get-pip.py && \
    rm get-pip.py && \
    pip install -U pip==23.3.2

# lightdock ==========================================================================================================

RUN /usr/local/bin/pip install lightdock==${LIGHTDOCK_VERSION}

# gdock =============================================================================================================

WORKDIR /opt/gdock
RUN git clone https://github.com/gdocking/gdock.git . && git checkout ${GDOCK_VERSION}
RUN python3.9 setup.py develop
RUN bash install.sh /opt/gdock
ENV GDOCK_PATH=/opt/gdock

# haddock3 ============================================================================================================
WORKDIR /opt/haddock3
RUN git clone --recursive https://github.com/haddocking/haddock3.git . && git checkout ${HADDOCK3_VERSION}
WORKDIR /opt/haddock3/src/fcc/src
RUN make
WORKDIR /opt/haddock3
RUN /usr/local/bin/pip install -r requirements.txt && /usr/local/bin/pip install . && \
 mkdir -p /usr/local/lib/python3.9/bin
COPY cns /usr/local/lib/python3.9/bin/cns
WORKDIR /
