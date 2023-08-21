# Deployment with docker

The web application can be run inside a Docker container together with all its dependent containers.

Requirements:

1. Private key `./private_key.pem` and public key `./public_key.pem`.
2. `./.env` file for haddock3 web application.
3. [bartender repo](https://github.com/i-VRESSE/bartender) to be cloned in `../bartender` directory.
4. bartender repo should have [.env file](https://github.com/i-VRESSE/bartender/blob/main/docs/configuration.md#environment-variables)
5. bartender repo should have a [config.yaml file](https://github.com/i-VRESSE/bartender/blob/main/docs/configuration.md#configuration-file)
   1. The `job_root_dir` key should be set to `/tmp/jobs`

Build with

```sh
docker compose build
```

Run with

```sh
docker compose up
```

Web application running at http://localhost:8080 .
