## Preparations

### Step 1: Download the input files

So download the following structures should be from the PDB database:

- The antibody structure [4G6K](https://www.ebi.ac.uk/pdbe/entry/pdb/4g6k)
- The antigen structure [4I1B](https://www.ebi.ac.uk/pdbe/entry/pdb/4i1b)
- The reference complex [4G6M](https://www.ebi.ac.uk/pdbe/entry/pdb/4g6m)

The files are available in the `./input` directory.

The cli needs preprocessing, the webapp can use PDB files straight from the PDB database and will do preprocessing for you.

### Step 2: Start the webapp locally

To start the webapp locally, you can use the following command:

```bash
docker compose -f deploy/arq/docker-compose.yml -pull always up
```

### Step 3: Register

Goto http://localhost:8000/register and fill in the form.

### Step 4: Enable light mode and use easy expertise level

1. Goto http://localhost:8000/profile
2. Select easy expertise level (this will make the job builder less busy)
3. Select light mode.

### Step 5: Create a completed job (optional)

Only do this step when you want to update the complete job zip file on SURFDrive.

1. Goto http://localhost:8000/upload
2. Upload [./input/antibody-antigen-workflow.zip](./input/antibody-antigen-workflow.zip) file
3. Submit
4. Wait for the job to complete, on my laptop it took 17 minutes
5. Goto report page of job
7. Download the whole job as a zip file by pressing `Download all` button.
8. Rename to `antibody-antigen-completed.zip`
9. Upload file to SURFDrive
10. On SURFDrive make a public read-only passwordless, non-expiring, share link
11. Copy link to step 5b

### Step 6: Add completed job

When you do not have time to run a job, you can upload a completed job with following steps:

1. Download `antibody-antigen-completed.zip` from https://surfdrive.surf.nl/files/index.php/s/QI8071oKI5JqHlE/download
2. Goto http://localhost:8000/upload
3. Select "Run: Archive of a haddock3 run" option
4. Upload the `antibody-antigen-completed.zip` file and press submit button.
5. After completion check that report and browse page work

Optional steps to make uploaded completed job archive look like a just ran job
1. Get shell in bartender container with `docker compose -f deploy/arq/docker-compose.yml exec bartender bash`
2. Goto job dir with `cd /jobs/<job id>`
3. Put workflow.cfg back with ` cp output/data/configurations/raw_input.toml workflow.cfg`
4. Put files referenced in workflow.cfg back with 
    ```shell
    cp output/data/00_topoaa/* .
    cp output/data/01_rigidbody/ambig.tbl .
    cp output/data/04_caprieval/4G6M.pdb .
    ```

(The [antibody-antigen-completed-sampling200.zip](antibody-antigen-completed-sampling200.zip) is the same as `antibody-antigen-completed.zip`
but refined in workflow builder to have a sampling of 200 instead of 1000. 
This makes it quicker to run and small enough to fit on GitHub, but has worse results.)
