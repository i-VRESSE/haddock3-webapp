# Haddock3 webapp with single worker

```shell
# Must be in root of repo
cd ../..
# Need cns executable in deploy directory, so it can be copied into the Docker image
cp <cns executable> deploy/cns
# TODO merge build and up commands when https://github.com/haddocking/haddock3/pull/841 is nerged
docker compose -f deploy/arq/docker-compose.yml build --build-arg HADDOCK3_VERSION=web-service --build-arg HADDOCK3_GHORG=i-VRESSE
# Or to build with prefix /haddock3 use the following command
BUILDKIT_PROGRESS=plain docker compose -f deploy/arq/docker-compose.yml build --build-arg HADDOCK3_VERSION=web-service --build-arg HADDOCK3_GHORG=i-VRESSE --build-arg HADDOCK3_WEBAPP_PREFIX=/haddock3
docker compose -f deploy/arq/docker-compose.yml up
```

The haddock3 webapp should be running on http://localhost:8080

Next steps are to go to http://localhost:8080/register to register as admin and finally submit a job.

## Configuration

The webapp can be configured using a [.env](.env).
