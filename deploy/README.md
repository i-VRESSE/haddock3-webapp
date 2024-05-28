# Deployments

> [!NOTE]
> All deployment methods require the `cns` executable to available in this directory.

## Methods

- [Haddock3 webapp with single worker and docker compose](arq/README.md)
- [Haddock3 webapp with remote slurm cluster and docker compose](remoteslurm/README.md)
- [Haddock3 webapp with containerized slurm cluster and docker compose](containerslurm/README.md)

## Versions

The webapp version is what is currently checked out.

Versions of bartender, haddock3, gdock and lightdock are defined in the start of the [./Dockerfile.bartenderhaddock3](./Dockerfile.bartenderhaddock3) file.
A version can be a git tag, branch or commit hash.
They can be overwritten during build with

```shell
docker compose -f <docker compose file> build --build-arg HADDOCK3_VERSION=v3.0.0-beta.5
```

Docker will not detect new commits to a branch, so it is recommended to use a commit hash.

## Removal

To remove all users and jobs run the following command:

```shell
docker compose -f <docker compose file> down -v
```

# Images

The Docker images are published on https://github.com/orgs/i-VRESSE/packages .

Each image has same set of tags:

- latest, build from HEAD of the main branch
- `<version>`, build from the version tag
- `pr-<number>`, build from the pull request

## bartender

Bartender web service with haddock3, lightdock, gdock executables.

Image does not contain real cns executable, downstream should bind or copy it to /opt/haddock3/bin/cns.

This image can be used to run the

1. bartender web service, with `bartender serve` command
2. bartender worker, with `bartender perform` command
3. haddock3 restraints web service, with `uvicorn --host 0.0.0.0 --port 5000 haddock.clis.restraints.webservice:app` command

## certmaker

Generates a rsa private key (/certs/private_key.pem file) and public key (/certs/public_key.pem file) pair on startup.

## haddock3-webapp

Haddock3 web application image.
