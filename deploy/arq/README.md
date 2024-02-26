# Haddock3 webapp with single worker

```shell
# Must be in root of repo
cd ../..
# Need cns executable in deploy directory, so it can be copied into the Docker image
cp <cns executable> deploy/cns
docker compose -f deploy/arq/docker-compose.yml up --build
```

The haddock3 webapp should be running on http://localhost:8080

Next steps are to go to http://localhost:8080/register to register as admin, give your self an expertise level at http://localhost:8080/admin/users and finally submit a job.

## Configuration

The webapp can be configured using a [.env](.env).
