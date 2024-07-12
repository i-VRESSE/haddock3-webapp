# Haddock3 webapp with single worker

```shell
# Must be in root of repo
cd ../..
# Need cns executable in deploy directory, so it can be mounted into the Docker container
cp <cns executable> deploy/cns
# Pull, create and start webapp and its services
docker compose -f deploy/arq/docker-compose.yml up
```

The haddock3 webapp should be running on http://localhost:8080

Next steps are to go to http://localhost:8080/register to register as admin and finally submit a job.

## Alternative versions

The command above uses the latest released version or main branch of the repositories.
If you are interested in using a different version of the repositories, 
for example if you want to try out a feature in a haddock3 pull request, 
you can change the version of each repository by setting environment variables.

To use published images of the main branch use the following command:

```shell
WEBAPP_TAG=main BARTENDER_TAG=main CERTMAKER_TAG=main docker compose -f deploy/arq/docker-compose.yml up --pull always
```

To use images from certain pull requests use the following command:

```shell 
WEBAPP_TAG=pr-104 BARTENDER_TAG=pr-105 CERTMAKER_TAG=pr-106 HADDOCK3_VERSION=pr-107 HADDOCK3_GHORG=i-VRESSE docker compose -f deploy/arq/docker-compose.yml up --pull always
```

To use image from a certain released version use the following command:

```shell
WEBAPP_TAG=0.2.1 BARTENDER_TAG=0.2.1 CERTMAKER_TAG=0.2.1 docker compose -f deploy/arq/docker-compose.yml up --pull always
```

The application by default expects to be running at / path.
To build with prefix /haddock3/ use the following command:

```shell
docker compose -f deploy/arq/docker-compose.yml build --build-arg HADDOCK3_WEBAPP_PREFIX=/haddock3/
```
