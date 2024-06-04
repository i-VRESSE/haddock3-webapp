# Haddock3 webapp with remote Slurm cluster

First you **must** change the destination in the `bartender-config.yaml` to your remote Slurm cluster.
After login the Slurm cluster user must have haddock3 executables in their path.

```shell
# Must be in root of repo
cd ../..
docker compose -f deploy/remoteslurm/docker-compose.yml up --build
```

The haddock3 webapp should be running on http://localhost:8080

## SSH Private key

By default the bartender webservice will ssh/sftp to a remote machine using a password.
To use a private key, you must mount the private key into the container see [./docker-compose.yml](./docker-compose.yml) for a commented out example.
