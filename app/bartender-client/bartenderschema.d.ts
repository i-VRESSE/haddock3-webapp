// This file was generated with "npm run generate-client" command.
// Do not edit this file manually.

export interface paths {
  "/api/health": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Health Check
     * @description Checks the health of a project.
     *
     *     It returns 200 if the project is healthy.
     *
     *     Args:
     *         session: SQLAlchemy session.
     */
    get: operations["health_check"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Jobs
     * @description Retrieve all jobs of user from the database.
     *
     *     Args:
     *         limit: limit of jobs.
     *         offset: offset of jobs.
     *         job_dao: JobDAO object.
     *         user: Current active user.
     *         context: Context with destinations.
     *         file_staging_queue: When scheduler reports job is complete.
     *             The output files need to be copied back.
     *             Use queue to perform download outside request/response handling.
     *
     *     Returns:
     *         stream of jobs.
     */
    get: operations["retrieve_jobs"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Job
     * @description Retrieve specific job from the database.
     *
     *     Args:
     *         jobid: identifier of job instance.
     *         job_dao: JobDAO object.
     *         user: Current active user.
     *         context: Context with destinations.
     *         file_staging_queue: When scheduler reports job is complete.
     *             The output files need to be copied back.
     *             Use queue to perform download outside request/response handling.
     *
     *     Raises:
     *         HTTPException: When job is not found or user is not allowed to see job.
     *
     *     Returns:
     *         job models.
     */
    get: operations["retrieve_job"];
    put?: never;
    post?: never;
    /**
     * Delete Job
     * @description Delete a job.
     *
     *     Deletes job from database and filesystem.
     *
     *     When job is queued or running it will be canceled
     *     and removed from the filesystem where the job is located.
     *
     *     Args:
     *         jobid: The job identifier.
     *         job_dao: The job DAO.
     *         job: The job.
     *         user: The current user.
     *         job_dir: The job directory.
     *         destination: The destination of the job.
     *         job_root_dir: The root directory of all jobs.
     */
    delete: operations["delete_job"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/files/{path}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Job File
     * @description Retrieve file from a completed job.
     *
     *     Args:
     *         path: Path to file that job has produced.
     *         job_dir: Directory with job output files.
     *
     *     Raises:
     *         HTTPException: When file is not found or is not a file
     *             or is outside job directory.
     *
     *     Returns:
     *         The file contents.
     */
    get: operations["retrieve_job_file"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/stdout": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Job Stdout
     * @description Retrieve the jobs standard output.
     *
     *     Args:
     *         logs: The standard output and error of a completed job.
     *
     *     Returns:
     *         Content of standard output.
     */
    get: operations["retrieve_job_stdout"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/stderr": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Job Stderr
     * @description Retrieve the jobs standard error.
     *
     *     Args:
     *         logs: The standard output and error of a completed job.
     *
     *     Returns:
     *         Content of standard error.
     */
    get: operations["retrieve_job_stderr"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/directories": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Job Directories
     * @description List directory contents of a job.
     *
     *     Args:
     *         max_depth: Number of directories to traverse into.
     *         job_dir: The job directory.
     *
     *     Returns:
     *         DirectoryItem: Listing of files and directories.
     */
    get: operations["retrieve_job_directories"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/directories/{path}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Job Directories From Path
     * @description List directory contents of a job.
     *
     *     Args:
     *         path: Sub directory inside job directory to start from.
     *         max_depth: Number of directories to traverse into.
     *         job_dir: The job directory.
     *
     *     Returns:
     *         DirectoryItem: Listing of files and directories.
     */
    get: operations["retrieve_job_directories_from_path"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/archive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Job Directory As Archive
     * @description Download contents of job directory as archive.
     *
     *     Args:
     *         job_dir: The job directory.
     *         background_tasks: FastAPI mechanism for post-processing tasks
     *         archive_format: Format to use for archive. Supported formats are '.zip', '.tar',
     *             '.tar.xz', '.tar.gz', '.tar.bz2'
     *         exclude: list of filename patterns that should be excluded from archive.
     *         exclude_dirs: list of directory patterns that should be excluded from archive.
     *
     *     Returns:
     *         FileResponse: Archive containing the content of job_dir
     */
    get: operations["retrieve_job_directory_as_archive"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/archive/{path}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Retrieve Job Subdirectory As Archive
     * @description Download job output as archive.
     *
     *     Args:
     *         path: Sub directory inside job directory to start from.
     *         job_dir: The job directory.
     *         background_tasks: FastAPI mechanism for post-processing tasks
     *         archive_format: Format to use for archive. Supported formats are '.zip',
     *             '.tar', '.tar.xz', '.tar.gz', '.tar.bz2'
     *         exclude: list of filename patterns that should be excluded from archive.
     *         exclude_dirs: list of directory patterns that should be excluded from archive.
     *
     *     Returns:
     *         FileResponse: Archive containing the output of job_dir
     */
    get: operations["retrieve_job_subdirectory_as_archive"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/name": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Rename Job Name
     * @description Rename the name of a job.
     *
     *     Args:
     *         jobid: The job identifier.
     *         job_dao: The job DAO.
     *         user: The current user.
     *         name: The new name of the job.
     *
     *     Raises:
     *         HTTPException: When job is not found. Or when user is not owner of job.
     */
    post: operations["rename_job_name"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/whoami": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Whoami
     * @description Get current user based on API key.
     *
     *     Args:
     *         user: Current user.
     *
     *     Returns:
     *         Current logged in user.
     */
    get: operations["whoami"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/application/haddock3": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Upload job to haddock3 */
    put: operations["application_haddock3"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/application/runimport": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * Import a HADDOCK3 run.
     * @description Upload an archive of haddock3 output. The archive should have run dir as root. The run should have haddock3-clean and haddock3-analyse executed on it.
     *
     */
    put: operations["application_runimport"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/interactive/rescore": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run rescore interactive application
     * @description Rescore a HADDOCK run with different weights.
     */
    post: operations["interactive_application_rescore"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/interactive/reclustrmsd": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run reclustrmsd interactive application
     * @description Recluster a HADDOCK run with RSMD and different parameters.
     */
    post: operations["interactive_application_reclustrmsd"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/job/{jobid}/interactive/reclustfcc": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run reclustfcc interactive application
     * @description Recluster a HADDOCK run with FCC and different parameters.
     */
    post: operations["interactive_application_reclustfcc"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /**
     * DirectoryItem
     * @description An entry in a directory.
     */
    DirectoryItem: {
      /** Name */
      name: string;
      /**
       * Path
       * Format: path
       */
      path: string;
      /** Is Dir */
      is_dir: boolean;
      /** Is File */
      is_file: boolean;
      /** Children */
      children?: components["schemas"]["DirectoryItem"][];
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components["schemas"]["ValidationError"][];
    };
    /**
     * InteractiveAppResult
     * @description Represents the result of running a InteractiveApp.
     *
     *     Attributes:
     *         returncode: The return code of the InteractiveApp process.
     *         stderr: The standard error output of the InteractiveApp process.
     *         stdout: The standard output of the InteractiveApp process.
     */
    InteractiveAppResult: {
      /** Returncode */
      returncode: number;
      /** Stderr */
      stderr: string;
      /** Stdout */
      stdout: string;
    };
    /**
     * JobModelDTO
     * @description DTO for job models.
     *
     *     It returned when accessing job models from the API.
     */
    JobModelDTO: {
      /** Id */
      id: number;
      /** Name */
      name: string;
      /** Application */
      application: string;
      /**
       * State
       * @enum {string}
       */
      state: "new" | "queued" | "running" | "staging_out" | "ok" | "error";
      /**
       * Created On
       * Format: date-time
       */
      created_on: string;
      /**
       * Updated On
       * Format: date-time
       */
      updated_on: string;
    };
    /**
     * User
     * @description User model.
     */
    User: {
      /** Username */
      username: string;
      /**
       * Roles
       * @default []
       */
      roles: string[];
      /** Apikey */
      apikey: string;
    };
    /** ValidationError */
    ValidationError: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  health_check: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
    };
  };
  retrieve_jobs: {
    parameters: {
      query?: {
        limit?: number;
        offset?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["JobModelDTO"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retrieve_job: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["JobModelDTO"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_job: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retrieve_job_file: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        path: string;
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/octet-stream": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retrieve_job_stdout: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "text/plain": string;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retrieve_job_stderr: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "text/plain": string;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retrieve_job_directories: {
    parameters: {
      query?: {
        max_depth?: number;
      };
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["DirectoryItem"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retrieve_job_directories_from_path: {
    parameters: {
      query?: {
        max_depth?: number;
      };
      header?: never;
      path: {
        path: string;
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["DirectoryItem"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retrieve_job_directory_as_archive: {
    parameters: {
      query?: {
        archive_format?: ".zip" | ".tar" | ".tar.xz" | ".tar.gz" | ".tar.bz2";
        exclude?: string[];
        exclude_dirs?: string[];
      };
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/octet-stream": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retrieve_job_subdirectory_as_archive: {
    parameters: {
      query?: {
        archive_format?: ".zip" | ".tar" | ".tar.xz" | ".tar.gz" | ".tar.bz2";
        exclude?: string[];
        exclude_dirs?: string[];
      };
      header?: never;
      path: {
        path: string;
        jobid: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  rename_job_name: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  whoami: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["User"];
        };
      };
    };
  };
  application_haddock3: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "multipart/form-data": {
          /**
           * Upload
           * Format: binary
           * @description Zip archive containing workflow.cfg file(s).
           */
          upload: Blob;
        };
      };
    };
    responses: {
      /** @description Successful Response */
      307: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  application_runimport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "multipart/form-data": {
          /**
           * Upload
           * Format: binary
           * @description Zip archive.
           */
          upload: Blob;
        };
      };
    };
    responses: {
      /** @description Successful Response */
      307: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  interactive_application_rescore: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          module_nr: number;
          capri_dir: string;
          w_air: number;
          w_bsa: number;
          w_desolv: number;
          w_elec: number;
          w_vdw: number;
        };
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InteractiveAppResult"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  interactive_application_reclustrmsd: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          module_nr: number;
          clustrmsd_dir: string;
          /** @enum {string} */
          criterion: "maxclust" | "distance";
          clust_cutoff?: number;
          n_clusters?: number;
          min_population?: number;
        };
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InteractiveAppResult"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  interactive_application_reclustfcc: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobid: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          module_nr: number;
          clustfcc_dir: string;
          clust_cutoff: number;
          strictness: number;
          min_population: number;
        };
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InteractiveAppResult"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
}
