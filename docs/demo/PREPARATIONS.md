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

### Step 5a: Create a completed job

1. Goto http://localhost:8000/upload
2. Upload [./input/antibody-antigen-workflow.zip](./input/antibody-antigen-workflow.zip) file
3. Submit
4. Wait for the job to complete, on my laoptop this took TODO
5. Goto report page of job
6. Goto browse page of job
7. Download the whole job as a zip file
8. Rename to `antibody-antigen-completed.zip`
9. Upload zip to SURFDrive

### Step 5b: Add completed job

1. Download the `antibody-antigen-completed.zip` from SURFDrive
2. Goto http://localhost:8000/upload 
3. Select output zip option
4. Upload the files from the `./antibody-antigen-completed.zip`.
5. After completion check that report and browse page work
