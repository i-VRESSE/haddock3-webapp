# Haddock3 webapp with remote slurm cluster

You must change the destination in the `bartender-config.yaml` to your remote Slurm cluster.

```shell
# Must be in root of repo
cd ../..
# Need cns executable in deploy directory, so it can be copied into the Docker image
cp <cns executable> deploy/cns
docker compose -f deploy/remoteslurm/docker-compose.yml up --build
```

## SSH Private key

By default the bartender webservice will ssh/sftp to a remote machine using a password.
To use a private key, you must mount the private key into the container see [./docker-compose.yml](./docker-compose.yml) for a commented out example.

## To test

To test against a local machine

Spinup a [Slurm cluster in a Docker container](https://github.com/xenon-middleware/xenon-docker-images/blob/master/slurm-23/README.md) with

```shell
docker build -t slurmwithhaddock3 -f deploy/remoteslurm/Dockerfile deploy
docker run -p 10022:22 slurmwithhaddock3
```

And in the `bartender-config.yaml` change the `remoteslurm` block to 

```yaml
    scheduler:
      type: slurm
      ssh_config:
        hostname: localhost
        port: 10022
        username: xenon
        password: javagat
    filesystem:
      type: sftp
      ssh_config:
        hostname: localhost
        port: 10022
        username: xenon
        password: javagat
      entry: /home/xenon
```
