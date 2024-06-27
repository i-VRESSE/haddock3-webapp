# Haddock3 webapp with single worker

```shell
# Must be in root of repo
cd ../..
# Need cns executable in deploy directory, so it can be mounted into the Docker container
cp <cns executable> deploy/cns
# Pull, create and start webapp and its services
docker compose -f deploy/arq/docker-compose.yml up
# Or to use published images of the main branch use the following command
# WEBAPP_TAG=main BARTENDER_TAG=main CERTMAKER_TAG=main docker compose -f deploy/arq/docker-compose.yml up --pull always
# Or to use images from a certain pull request use the following command
# WEBAPP_TAG=pr-104 BARTENDER_TAG=pr-104 CERTMAKER_TAG=pr-104 docker compose -f deploy/arq/docker-compose.yml up --pull always
# Or to use image from a certain released version use the following command
# WEBAPP_TAG=0.2.1 BARTENDER_TAG=0.2.1 CERTMAKER_TAG=0.2.1 docker compose -f deploy/arq/docker-compose.yml up --pull always
# Or to build with prefix /haddock3/ use the following command
# docker compose -f deploy/arq/docker-compose.yml build --build-arg HADDOCK3_WEBAPP_PREFIX=/haddock3/
```

The haddock3 webapp should be running on http://localhost:8080

Next steps are to go to http://localhost:8080/register to register as admin and finally submit a job.
