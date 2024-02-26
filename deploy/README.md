# Deployments

> [!NOTE]
> All deployment methods require the `cns` executable to available in this directory.

## Methods

- [Haddock3 webapp with single worker and docker compose](arq/README.md)

## Versions

The webapp version is what is currently checked out.

Versions of bartender, haddock3, gdock and lightdock are defined in the start of the [./Dockerfile.bartenderhaddock3](./Dockerfile.bartenderhaddock3) file. They can be overwritten during build with

```shell
docker compose -f <docker compose file> build --build-arg HADDOCK3_VERSION=v3.0.0-beta.5
```
