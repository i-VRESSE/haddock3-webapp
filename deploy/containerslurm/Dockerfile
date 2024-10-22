# Dockerfile with slurm scheduler, sshd, haddock3, lightdock, gdock executables.
FROM ghcr.io/xenon-middleware/slurm:23

ARG HADDOCK3_GHORG=haddocking
ARG HADDOCK3_VERSION=main
ARG GDOCK_VERSION=main
ARG LIGHTDOCK_VERSION=0.9.4
ARG OPENMM_VERSION=8.1.2
ARG PDBFIXER_VERSION=1.9

USER root

# Common dependencies =================================================================================================

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential git ca-certificates curl libgfortran5 \
  wget software-properties-common gpg-agent \
  python3-pip python3.10-dev \
  libgfortran5 cmake swig cython3 doxygen \
  && \
  pip install --upgrade pip wheel \
  && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# lightdock ==========================================================================================================

RUN pip install lightdock==${LIGHTDOCK_VERSION}

# gdock =============================================================================================================

# Gdock installation kaput currently, so skipping, see https://github.com/gdocking/gdock/issues/44 for details
# WORKDIR /opt/gdock
# RUN git clone --depth 1 -b ${GDOCK_VERSION} https://github.com/gdocking/gdock.git .
# RUN pip install matplotlib==3.8.4  # dont install 3.9.0rc2
# RUN python3 setup.py develop
# RUN bash install.sh /opt/gdock
# ENV GDOCK_PATH=/opt/gdock

# openmm =============================================================================================================

WORKDIR /opt/openmm
RUN wget https://github.com/openmm/openmm/archive/refs/tags/${OPENMM_VERSION}.tar.gz && \
    tar -xzf ${OPENMM_VERSION}.tar.gz && \
    cd openmm-${OPENMM_VERSION} && \
    mkdir build && \
    cd build && \
    cmake .. -DCMAKE_INSTALL_PREFIX=/venv && \
    make -j4 && \
    make install && \
    make PythonInstall
RUN pip install https://github.com/openmm/pdbfixer/archive/refs/tags/${PDBFIXER_VERSION}.tar.gz

# haddock3 ============================================================================================================
WORKDIR /opt/haddock3
RUN echo cachebust=9 && git clone --depth 1 -b ${HADDOCK3_VERSION} https://github.com/${HADDOCK3_GHORG}/haddock3.git .
RUN pip install .
WORKDIR /
