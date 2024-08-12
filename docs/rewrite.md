# Workflow rewrite

You can submit a workflow to the webapp that can contain any parameter that haddock3 cli accepts.
However we do not want a user to tell the webapp for example which run dir, queue to use, which cns executable, etc.
The webapp should control most of the [global parameters](https://github.com/i-VRESSE/workflow-builder/blob/main/packages/haddock3_catalog/public/catalog/haddock3.guru.yaml) except molecules parameter and preprocess parameter.

Currently the global schema of the catalog has properties hidden at [/app/catalogs/index.server.ts:hideExecutionParameters()](../app/catalogs/index.server.ts) so the user can not set them.

Currently the submitted workflow is rewritten at [/app/models/applicaton.server.ts:rewriteConfig()](../app/models/applicaton.server.ts) to defaults fit for bartender job service.

The following parameters can be rewritten with environment variables:

- Number of CPU cores (ncores) with `HADDOCK3_NCORES` environment variable. If not set uses haddock3 default.
