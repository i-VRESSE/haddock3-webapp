# Bartender

The bartender web service is used to submit jobs to the Haddock3 application.

See bartender [documentation](https://i-vresse-bartender.readthedocs.io/en/latest/) how to setup, configure and run the bartender web service.

## API Client

This web app uses a openapi client to consume the bartender web service.

The client can be (re-)generated with

```shell
npm run generate-client
```

This command requires that the bartender webservice is running at http://localhost:8000
or specify the location with the `BARTENDER_API_URL` environment variable.

The generated client code is a reflection of the bartender configuration.
So if the bartender configuration changes, the client needs to be regenerated.

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

The application should not have `allowed_roles` configured as the haddock3 web application will only allow users to submit jobs that have an expertise level and generate a bartender token without roles.

## Haddock3 catalogs

To show which modules and parameters are available in the workflow builder, the haddock3 web application uses the catalogs from the [workflow builder](https://github.com/i-VRESSE/workflow-builder/tree/main/packages/haddock3_catalog/public/catalog).
, which in turn are generated from the [haddock3 defaults.yaml](https://github.com/haddocking/haddock3/blob/main/src/haddock/modules/defaults.yaml).

This repo has a copy of the catalogs, stored at `./app/catalogs/*.yaml`.

To fetch the latest catalogs run

```shell
npm run catalogs
```

To fetch catalogs from another branch then `main` in the workflow builder repo use

```shell
WBTAG='someotherbranchname' npm run catalogs
```

## Assigning jobs to another user

Jobs stored in the bartender service has a submitter field, which is the user identifier of the user who submitted the job in the haddock3 web application.

For example when you wiped the webapp database then you might want to assign the jobs of a previous user to yourself.

Step 1 is to find out the user identifier of yourself. You can do this with

```shell
npm run psql:dev
SELECT id FROM users WHERE email='<your email address>';
```

Step 2 is to update the submitter field of the jobs you want to assign to yourself. You can do this with

```shell
docker exec -ti <id/name of bartender postgresql container> psql -U bartender
UPDATE job SET submitter='<your user identifier>' WHERE submitter='<user identifier of previous user>';
# To take ownership of all jobs, drop the WHERE clause
```
