# Haddock3 webapp within BonvinLab computational stuctural biology portal

See [docs of portal mode](../../docs/portal.md) for more information.

```shell
# Inside csbportal repo
cp <cns executable> haddock3-webapp/deploy/cns
# Start csbportal with haddock3-webapp/deploy/portal/docker-compose.yml included in up command
docker compose -f deploy/arq/docker-compose.yml -f deploy/portal/docker-compose.yml build
docker compose -f deploy/arq/docker-compose.yml -f deploy/portal/docker-compose.yml up
```

This will run the haddock3 webapp with a mocked portal on http://localhost:8180/haddock30 .
