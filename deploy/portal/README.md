# Haddock3 webapp within BonvinLab computational stuctural biology portal

See [docs of portal mode](../docs/portal.md) for more information.

```shell
# Inside csbportal repo
cp <cns executable> haddock3-webapp/deploy/cns
# Start csbportal with haddock3-webapp/deploy/portal/docker-compose.yml included in up command
```

This will run the haddock3 webapp on http://h3webapp:8080/haddock30 inside the Docker network which can be reverse proxied by the nginx web server of the portal.
