def mypicker(job_dir, application_name, submitter, context):
    if application_name == 'runimport':
        return 'local'
    return 'slurm'
