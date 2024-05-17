# Haddock3 webapp within BonvinLab computational stuctural biology portal

See [docs of portal mode](../docs/portal.md) for more information.

```shell
# Inside csbportal repo
cp <cns executable> haddock3-webapp/deploy/cns
# TODO merge build and up commands when https://github.com/haddocking/haddock3/pull/841 is nerged
docker compose -f haddock3-webapp/deploy/portal/docker-compose.yml build --build-arg HADDOCK3_VERSION=web-service --build-arg HADDOCK3_GHORG=i-VRESSE
# Start csbportal with haddock3-webapp/deploy/portal/docker-compose.yml included
```

This will run the haddock3 webapp on http://webapp:8080/haddock30 which can be reverse proxied by the nginx web server of the portal.
