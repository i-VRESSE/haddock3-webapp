import JSZip from "jszip";
import { assert, describe, test } from "vitest";

import { WORKFLOW_CONFIG_FILENAME } from "../bartender-client/constants";
import { rewriteConfigInArchive } from "./applicaton.server";

const HY3_PDB = `\
ATOM      1  SHA SHA S   1      30.913  40.332   2.133  1.00 36.12      S       
ATOM      2  SHA SHA S   2      31.688  39.106   2.001  0.00 35.33      S       
ATOM      3  SHA SHA S   3      33.112  39.418   2.558  0.00 34.76      S       
ATOM      4  SHA SHA S   4      33.816  40.410   1.579  0.00 37.71      S       
ATOM      5  SHA SHA S   5      35.095  41.000   2.233  0.00 39.00      S       
ATOM      6  SHA SHA S   6      34.725  42.089   3.256  0.00 43.60      S       
ATOM      7  SHA SHA S   7      34.662  43.434   2.536  0.00 40.67      S       
ATOM      8  SHA SHA S   8      34.321  44.590   3.534  0.00 43.75      S       
ATOM      9  SHA SHA S   9      32.807  44.891   3.510  0.00 42.19      S       
ATOM     10  SHA SHA S  10      32.462  45.218   2.053  0.00 44.29      S       
ATOM     11  SHA SHA S  11      30.996  45.537   1.862  0.00 44.22      S       
ATOM     12  SHA SHA S  12      30.082  44.343   1.982  0.00 40.24      S       
ATOM     13  SHA SHA S  13      30.394  43.213   1.281  1.00 37.67      S       
ATOM     14  SHA SHA S  14      29.464  42.065   1.338  0.00 35.43      S       
ATOM     15  SHA SHA S  15      30.195  40.785   1.082  0.00 38.27      S       
ATOM     16  SHA SHA S  16      30.130  40.204  -0.003  0.50 37.88      S       
ATOM     17  SHA SHA S  17      28.388  42.319   0.256  0.00 36.45      S       
ATOM     18  SHA SHA S  18      29.101  44.457   2.703  0.50 38.23      S       
ATOM     19  SHA SHA S  19      34.243  39.605   0.318  0.00 36.09      S       
ATOM     20  SHA SHA S  20      31.025  37.944   2.771  0.00 37.31      S       
ATOM     21  SHA SHA S  21      30.979  38.245   4.175  0.50 38.76      S       
ATOM     22  SHA SHA S  22      29.562  37.728   2.295  0.00 32.26      S       
ATOM     23  SHA SHA S  23      29.140  36.302   2.691  0.00 33.64      S       
ATOM     24  SHA SHA S  24      27.607  36.246   2.865  0.00 34.74      S       
ATOM     25  SHA SHA S  25      29.436  35.319   1.568  0.00 33.05      S       
ATOM     26  SHA SHA S  26      29.380  35.691   0.406  0.50 36.82      S       
ATOM     27  SHA SHA S  27      29.753  34.077   1.938  1.00 33.47      S       
ATOM     28  SHA SHA S  28      30.018  33.054   0.933  0.00 37.18      S       
ATOM     29  SHA SHA S  29      30.407  31.764   1.687  1.00 37.79      S       
ATOM     30  SHA SHA S  30      30.478  30.539   0.736  1.00 41.97      S       
ATOM     31  SHA SHA S  31      31.695  30.650  -0.211  1.00 42.49      S       
END
` as const;

async function prepareArchive(config: string) {
  const files = new Map([["hy3.pdb", HY3_PDB]]);
  const zip = new JSZip();
  for (const [filename, content] of files) {
    // All files should be text
    zip.file(filename, content);
  }
  zip.file(WORKFLOW_CONFIG_FILENAME, config);
  return await zip.generateAsync({ type: "blob" });
}

async function retrieveConfigFromArchive(file: Blob) {
  const zip = new JSZip();
  await zip.loadAsync(await file.arrayBuffer());
  const config_file = zip.file(WORKFLOW_CONFIG_FILENAME);
  if (config_file === null) {
    throw new Error(`Unable to find ${WORKFLOW_CONFIG_FILENAME} in archive`);
  }
  return await config_file.async("string");
}

describe("rewriteConfigInArchive()", () => {
  test("given zip with config with only molecules field should add run_dir and mode fields", async () => {
    const input_config = `\
molecules = ['hy3.pdb']
`;
    const archive = await prepareArchive(input_config);

    const result = await rewriteConfigInArchive(archive, ["easy"]);

    const expected_config = `\

molecules = ['hy3.pdb']
run_dir = 'output'
mode = 'local'
postprocess = true
clean = true
offline = false
debug = false
ncores = 1
`;
    const output_config = await retrieveConfigFromArchive(result);
    assert.equal(output_config, expected_config);
  });

  test("given zip with config with mode and run_dir fields should overwrite fields", async () => {
    const input_config = `\
run_dir = 'some_random_dir'
mode = 'hpc'
`;
    const archive = await prepareArchive(input_config);

    const result = await rewriteConfigInArchive(archive, ["easy"]);
    const expected_config = `\

run_dir = 'output'
mode = 'local'
postprocess = true
clean = true
offline = false
debug = false
ncores = 1
`;
    const output_config = await retrieveConfigFromArchive(result);
    assert.equal(output_config, expected_config);
  });

  test("given zip with config with all mode fields, cns_exec and run_dir fields should overwrite run_dir and mode fields and remove all other", async () => {
    const input_config = `\
run_dir = 'x'
mode = 'hpc'
ncores = 2
batch_type = 'torque'
queue_limit = 12
concat = 5
self_contained = true
queue = 'somequeue'
cns_exec = '/usr/bin/cns'
`;
    const archive = await prepareArchive(input_config);

    const result = await rewriteConfigInArchive(archive, ["easy"]);
    const expected_config = `\

run_dir = 'output'
mode = 'local'
ncores = 1
postprocess = true
clean = true
offline = false
debug = false
`;
    const output_config = await retrieveConfigFromArchive(result);
    assert.equal(output_config, expected_config);
  });

  test("given zip with config with molecules field and nested table should add run_dir and mode fields", async () => {
    const input_config = `\
molecules = ['hy3.pdb']

[seletop]
select = 5
`;
    const archive = await prepareArchive(input_config);

    const result = await rewriteConfigInArchive(archive, ["easy"]);

    const expected_config = `\

molecules = ['hy3.pdb']
run_dir = 'output'
mode = 'local'
postprocess = true
clean = true
offline = false
debug = false
ncores = 1

[seletop]

select = 5
`;
    const output_config = await retrieveConfigFromArchive(result);
    assert.equal(output_config, expected_config);
  });

  test("plot_matrix should be set to true for clustfcc and clustrmsd modules", async () => {
    const input_config = `\
[clustfcc]
[clustrmsd]
`;
    const archive = await prepareArchive(input_config);

    const result = await rewriteConfigInArchive(archive, ["easy"]);

    const expected_config = `\

run_dir = 'output'
mode = 'local'
postprocess = true
clean = true
offline = false
debug = false
ncores = 1

[clustfcc]

plot_matrix = true

[clustrmsd]

plot_matrix = true
`;
    const output_config = await retrieveConfigFromArchive(result);
    assert.equal(output_config, expected_config);
  });

  test("plot and output should be set to true for alascan module", async () => {
    const input_config = `\
[alascan]
`;
    const archive = await prepareArchive(input_config);

    const result = await rewriteConfigInArchive(archive, ["easy"]);

    const expected_config = `\

run_dir = 'output'
mode = 'local'
postprocess = true
clean = true
offline = false
debug = false
ncores = 1

[alascan]

plot = true
output = true
`;
    const output_config = await retrieveConfigFromArchive(result);
    assert.equal(output_config, expected_config);
  });

  test("plot_matrix should be set for repeated modules", async () => {
    const input_config = `\
[clustfcc]
[clustfcc]
`;
    const archive = await prepareArchive(input_config);

    const result = await rewriteConfigInArchive(archive, ["easy"]);

    const expected_config = `\

run_dir = 'output'
mode = 'local'
postprocess = true
clean = true
offline = false
debug = false
ncores = 1

[clustfcc]

plot_matrix = true

['clustfcc.1']

plot_matrix = true
`;
    const output_config = await retrieveConfigFromArchive(result);
    assert.equal(output_config, expected_config);
  });
});
