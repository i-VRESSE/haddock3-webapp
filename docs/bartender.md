# Bartender

The bartender web service is used to submit jobs to the Haddock3 application.

See bartender [documentation](https://i-vresse-bartender.readthedocs.io/en/latest/) how to setup, configure and run the bartender web service.

## API Client

This web app uses a client to consume the bartender web service.

The client can be (re-)generated with

```shell
npm run generate-client
```

(This command requires that the bartender webservice is running at http://localhost:8000)

## Configuration

The haddock3 web application needs to know where the bartender web service is running.
Configure bartender location with `BARTENDER_API_URL` environment variable.

```sh
BARTENDER_API_URL=http://localhost:8000
```

Bartender uses asymmetric [JWT tokens](https://jwt.io) for authentication and authorization.
The tokens are signed with a private key and verified with a public key.
Here the haddock3 web application signs the token and the bartender web service verifies the token.
In this way the bartender web service only accepts tokens signed by the haddock3 web application.
The haddock3 web application will generate a short lifetime token for a user when he/she needs to submit a job or get info on jobs.

The haddock3 web application needs the location the private key file, it is by default `private_key.pem` or the value of the `BARTENDER_PRIVATE_KEY` environment variable.

```sh
BARTENDER_PRIVATE_KEY=private_key.pem
```

The bartender web service needs the location of the public key file, it is by default `public_key.pem` or the value of the `BARTENDER_PUBLIC_KEY` environment variable.

```sh
BARTENDER_PUBLIC_KEY=public_key.pem
```

## Haddock3 application

This web app expects that the following application is registered in bartender web service.

```yaml
applications:
  haddock3:
    command: haddock3 $config
    config: workflow.cfg
```

This allows the archive generated with the workflow builder to be submitted.

## Haddock3 catalogs

To show which modules and parameters are available in the workflow builder, the haddock3 web application uses the catalogs from the [workflow builder](https://github.com/i-VRESSE/workflow-builder/tree/main/packages/haddock3_catalog/public/catalog).
, which in turn are generated from the [haddock3 defaults.yaml](https://github.com/haddocking/haddock3/blob/main/src/haddock/modules/defaults.yaml).

This repo has a copy of the catalogs, stored at `./app/catalogs/*.yaml`.

To fetch the latest catalogs run

```shell
npm run catalogs
```
