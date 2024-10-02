## Haddock3 web app with containerized Slurm cluster

To test against a local container with [Slurm](https://github.com/xenon-middleware/xenon-docker-images/blob/master/slurm-23/README.md) and haddock3.

```shell
# Must be in root of repo
cd ../..
docker compose -f deploy/remoteslurm/docker-compose.yml -f deploy/containerslurm/docker-compose.yml up --build
```

The haddock3 webapp should be running on http://localhost:8080
