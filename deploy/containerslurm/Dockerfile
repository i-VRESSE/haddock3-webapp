# Dockerfile with slurm scheduler, sshd, haddock3, lightdock, gdock executables.
FROM ghcr.io/xenon-middleware/slurm:23

ARG HADDOCK3_GHORG=haddocking
ARG HADDOCK3_VERSION=main
ARG GDOCK_VERSION=main
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
RUN git clone --depth 1 -b ${GDOCK_VERSION} https://github.com/gdocking/gdock.git .
RUN pip install matplotlib==3.8.4  # dont install 3.9.0rc2
RUN python3.9 setup.py develop
RUN bash install.sh /opt/gdock
ENV GDOCK_PATH=/opt/gdock

# haddock3 ============================================================================================================
WORKDIR /opt/haddock3
RUN echo cachebust=3 && git clone --depth 1 -b ${HADDOCK3_VERSION} --recursive https://github.com/${HADDOCK3_GHORG}/haddock3.git .
WORKDIR /opt/haddock3/src/fcc/src
RUN make
WORKDIR /opt/haddock3/src/fast-rmsdmatrix/src
RUN chmod u+x Makefile && make fast-rmsdmatrix
WORKDIR /opt/haddock3
RUN grep -v kaleido requirements.txt > requirements.pruned.txt && /usr/local/bin/pip install -r requirements.pruned.txt
RUN /usr/local/bin/pip install . && \
    mkdir -p /usr/local/lib/python3.9/bin
WORKDIR /
