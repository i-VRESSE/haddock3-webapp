# Haddock3 webapp with single worker

```shell
# Install docker compose, see https://docs.docker.com/compose/install/
# From the root of this locally cloned repository
# Pull, create and start webapp and its services with the following command
docker compose -f deploy/arq/docker-compose.yml up
```

The haddock3 webapp should be running on http://localhost:8080

Next steps are to go to http://localhost:8080/register to register and finally submit a job.

## Updating existing deployment

If you already did an up once before, you might have an old version of the images.
To get the latest version of the images use:

```shell
git pull
docker compose -f deploy/arq/docker-compose.yml pull
docker compose -f deploy/arq/docker-compose.yml up
```

## Cpu usage

The webapp is configured to run a single haddock3 job at a time, later jobs will be queued.
Each haddock3 job will use 4 cpu cores.

To better use your hardware, you can configure the deployment in 2 places

1. In the docker-compose.yml file, change the `HADDOCK3_NCORES` value of the `haddock3` service to increase the number of cores used by a single haddock3 job.
2. In the bartender-config.yaml file, change `max_jobs` to increase the number of jobs that can be run at the same time.

## Alternative versions

The commands above uses the latest released version of the repositories.
If you are interested in using a different version of the repositories,
for example if you want to try out a feature in a haddock3 pull request,
you can change the version of each repository by setting environment variables.

To use published images of the main branch use the following command:

```shell
WEBAPP_TAG=main BARTENDER_TAG=main CERTMAKER_TAG=main docker compose -f deploy/arq/docker-compose.yml up --pull always
```

To use images from certain pull requests use the following command:

```shell
WEBAPP_TAG=pr-104 BARTENDER_TAG=pr-104 CERTMAKER_TAG=pr-104 docker compose -f deploy/arq/docker-compose.yml up --pull always
```

To use image from a certain released version use the following command:

```shell
WEBAPP_TAG=0.2.1 BARTENDER_TAG=0.2.1 CERTMAKER_TAG=0.2.1 docker compose -f deploy/arq/docker-compose.yml up --pull always
```

The application by default assumes to be running at / path.
To build with prefix /haddock3/ use the following command:

```shell
docker compose -f deploy/arq/docker-compose.yml build --build-arg HADDOCK3WEBAPP_PREFIX=/haddock3/
```

To use build with another haddock3 version use

```shell
docker compose -f deploy/arq/docker-compose.yml build bartender --build-arg HADDOCK3_VERSION=pr-107
```

(Optionally use `--build-arg HADDOCK3_GHORG=i-VRESSE` to use a fork)
