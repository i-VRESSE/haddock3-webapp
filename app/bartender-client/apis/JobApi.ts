/* tslint:disable */
/* eslint-disable */
/**
 * bartender
 * Job middleware for i-VRESSE
 *
 * The version of the OpenAPI document: 0.2.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  DirectoryItem,
  HTTPValidationError,
  InteractiveAppResult,
  InteractiveApplicationConfiguration,
  JobModelDTO,
} from '../models';
import {
    DirectoryItemFromJSON,
    DirectoryItemToJSON,
    HTTPValidationErrorFromJSON,
    HTTPValidationErrorToJSON,
    InteractiveAppResultFromJSON,
    InteractiveAppResultToJSON,
    InteractiveApplicationConfigurationFromJSON,
    InteractiveApplicationConfigurationToJSON,
    JobModelDTOFromJSON,
    JobModelDTOToJSON,
} from '../models';

export interface GetInteractiveAppRequest {
    application: string;
    jobid: number;
}

export interface ListInteractiveAppsRequest {
    jobid: number;
}

export interface RetrieveJobRequest {
    jobid: number;
}

export interface RetrieveJobDirectoriesRequest {
    jobid: number;
    maxDepth?: number;
}

export interface RetrieveJobDirectoriesFromPathRequest {
    path: string;
    jobid: number;
    maxDepth?: number;
}

export interface RetrieveJobDirectoryAsArchiveRequest {
    jobid: number;
    archiveFormat?: RetrieveJobDirectoryAsArchiveArchiveFormatEnum;
    exclude?: Array<string>;
    excludeDirs?: Array<string>;
}

export interface RetrieveJobFilesRequest {
    path: string;
    jobid: number;
}

export interface RetrieveJobStderrRequest {
    jobid: number;
}

export interface RetrieveJobStdoutRequest {
    jobid: number;
}

export interface RetrieveJobSubdirectoryAsArchiveRequest {
    path: string;
    jobid: number;
    archiveFormat?: RetrieveJobSubdirectoryAsArchiveArchiveFormatEnum;
    exclude?: Array<string>;
    excludeDirs?: Array<string>;
}

export interface RetrieveJobsRequest {
    limit?: number;
    offset?: number;
}

export interface RunInteractiveAppRequest {
    jobid: number;
    application: string;
    body?: object;
}

/**
 * 
 */
export class JobApi extends runtime.BaseAPI {

    /**
     * Get interactive app configuration.  Args:     application: The interactive application.     config: The bartender configuration.  Returns:     The interactive application configuration.
     * Get Interactive App
     */
    async getInteractiveAppRaw(requestParameters: GetInteractiveAppRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<InteractiveApplicationConfiguration>> {
        if (requestParameters.application === null || requestParameters.application === undefined) {
            throw new runtime.RequiredError('application','Required parameter requestParameters.application was null or undefined when calling getInteractiveApp.');
        }

        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling getInteractiveApp.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/job/{jobid}/interactive/{application}`.replace(`{${"application"}}`, encodeURIComponent(String(requestParameters.application))).replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => InteractiveApplicationConfigurationFromJSON(jsonValue));
    }

    /**
     * Get interactive app configuration.  Args:     application: The interactive application.     config: The bartender configuration.  Returns:     The interactive application configuration.
     * Get Interactive App
     */
    async getInteractiveApp(requestParameters: GetInteractiveAppRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<InteractiveApplicationConfiguration> {
        const response = await this.getInteractiveAppRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List interactive apps that can be run on a completed job.  Args:     config: The bartender configuration.  Returns:     List of interactive apps.
     * List Interactive Apps
     */
    async listInteractiveAppsRaw(requestParameters: ListInteractiveAppsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<string>>> {
        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling listInteractiveApps.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/job/{jobid}/interactive`.replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * List interactive apps that can be run on a completed job.  Args:     config: The bartender configuration.  Returns:     List of interactive apps.
     * List Interactive Apps
     */
    async listInteractiveApps(requestParameters: ListInteractiveAppsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<string>> {
        const response = await this.listInteractiveAppsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve specific job from the database.  Args:     jobid: identifier of job instance.     job_dao: JobDAO object.     user: Current active user.     context: Context with destinations.     file_staging_queue: When scheduler reports job is complete.         The output files need to be copied back.         Use queue to perform download outside request/response handling.  Raises:     HTTPException: When job is not found or user is not allowed to see job.  Returns:     job models.
     * Retrieve Job
     */
    async retrieveJobRaw(requestParameters: RetrieveJobRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<JobModelDTO>> {
        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling retrieveJob.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}`.replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => JobModelDTOFromJSON(jsonValue));
    }

    /**
     * Retrieve specific job from the database.  Args:     jobid: identifier of job instance.     job_dao: JobDAO object.     user: Current active user.     context: Context with destinations.     file_staging_queue: When scheduler reports job is complete.         The output files need to be copied back.         Use queue to perform download outside request/response handling.  Raises:     HTTPException: When job is not found or user is not allowed to see job.  Returns:     job models.
     * Retrieve Job
     */
    async retrieveJob(requestParameters: RetrieveJobRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<JobModelDTO> {
        const response = await this.retrieveJobRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List directory contents of a job.  Args:     max_depth: Number of directories to traverse into.     job_dir: The job directory.  Returns:     DirectoryItem: Listing of files and directories.
     * Retrieve Job Directories
     */
    async retrieveJobDirectoriesRaw(requestParameters: RetrieveJobDirectoriesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<DirectoryItem>> {
        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling retrieveJobDirectories.');
        }

        const queryParameters: any = {};

        if (requestParameters.maxDepth !== undefined) {
            queryParameters['max_depth'] = requestParameters.maxDepth;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}/directories`.replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DirectoryItemFromJSON(jsonValue));
    }

    /**
     * List directory contents of a job.  Args:     max_depth: Number of directories to traverse into.     job_dir: The job directory.  Returns:     DirectoryItem: Listing of files and directories.
     * Retrieve Job Directories
     */
    async retrieveJobDirectories(requestParameters: RetrieveJobDirectoriesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<DirectoryItem> {
        const response = await this.retrieveJobDirectoriesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List directory contents of a job.  Args:     path: Sub directory inside job directory to start from.     max_depth: Number of directories to traverse into.     job_dir: The job directory.  Returns:     DirectoryItem: Listing of files and directories.
     * Retrieve Job Directories From Path
     */
    async retrieveJobDirectoriesFromPathRaw(requestParameters: RetrieveJobDirectoriesFromPathRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<DirectoryItem>> {
        if (requestParameters.path === null || requestParameters.path === undefined) {
            throw new runtime.RequiredError('path','Required parameter requestParameters.path was null or undefined when calling retrieveJobDirectoriesFromPath.');
        }

        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling retrieveJobDirectoriesFromPath.');
        }

        const queryParameters: any = {};

        if (requestParameters.maxDepth !== undefined) {
            queryParameters['max_depth'] = requestParameters.maxDepth;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}/directories/{path}`.replace(`{${"path"}}`, encodeURIComponent(String(requestParameters.path))).replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DirectoryItemFromJSON(jsonValue));
    }

    /**
     * List directory contents of a job.  Args:     path: Sub directory inside job directory to start from.     max_depth: Number of directories to traverse into.     job_dir: The job directory.  Returns:     DirectoryItem: Listing of files and directories.
     * Retrieve Job Directories From Path
     */
    async retrieveJobDirectoriesFromPath(requestParameters: RetrieveJobDirectoriesFromPathRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<DirectoryItem> {
        const response = await this.retrieveJobDirectoriesFromPathRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Download contents of job directory as archive.  Args:     job_dir: The job directory.     background_tasks: FastAPI mechanism for post-processing tasks     archive_format: Format to use for archive. Supported formats are \'.zip\', \'.tar\',         \'.tar.xz\', \'.tar.gz\', \'.tar.bz2\'     exclude: list of filename patterns that should be excluded from archive.     exclude_dirs: list of directory patterns that should be excluded from archive.  Returns:     FileResponse: Archive containing the content of job_dir
     * Retrieve Job Directory As Archive
     */
    async retrieveJobDirectoryAsArchiveRaw(requestParameters: RetrieveJobDirectoryAsArchiveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling retrieveJobDirectoryAsArchive.');
        }

        const queryParameters: any = {};

        if (requestParameters.archiveFormat !== undefined) {
            queryParameters['archive_format'] = requestParameters.archiveFormat;
        }

        if (requestParameters.exclude) {
            queryParameters['exclude'] = requestParameters.exclude;
        }

        if (requestParameters.excludeDirs) {
            queryParameters['exclude_dirs'] = requestParameters.excludeDirs;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}/archive`.replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     * Download contents of job directory as archive.  Args:     job_dir: The job directory.     background_tasks: FastAPI mechanism for post-processing tasks     archive_format: Format to use for archive. Supported formats are \'.zip\', \'.tar\',         \'.tar.xz\', \'.tar.gz\', \'.tar.bz2\'     exclude: list of filename patterns that should be excluded from archive.     exclude_dirs: list of directory patterns that should be excluded from archive.  Returns:     FileResponse: Archive containing the content of job_dir
     * Retrieve Job Directory As Archive
     */
    async retrieveJobDirectoryAsArchive(requestParameters: RetrieveJobDirectoryAsArchiveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.retrieveJobDirectoryAsArchiveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve files from a completed job.  Args:     path: Path to file that job has produced.     job_dir: Directory with job output files.  Raises:     HTTPException: When file is not found or is outside job directory.  Returns:     The file content.
     * Retrieve Job Files
     */
    async retrieveJobFilesRaw(requestParameters: RetrieveJobFilesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.path === null || requestParameters.path === undefined) {
            throw new runtime.RequiredError('path','Required parameter requestParameters.path was null or undefined when calling retrieveJobFiles.');
        }

        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling retrieveJobFiles.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}/files/{path}`.replace(`{${"path"}}`, encodeURIComponent(String(requestParameters.path))).replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     * Retrieve files from a completed job.  Args:     path: Path to file that job has produced.     job_dir: Directory with job output files.  Raises:     HTTPException: When file is not found or is outside job directory.  Returns:     The file content.
     * Retrieve Job Files
     */
    async retrieveJobFiles(requestParameters: RetrieveJobFilesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.retrieveJobFilesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve the jobs standard error.  Args:     logs: The standard output and error of a completed job.  Returns:     Content of standard error.
     * Retrieve Job Stderr
     */
    async retrieveJobStderrRaw(requestParameters: RetrieveJobStderrRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling retrieveJobStderr.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}/stderr`.replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     * Retrieve the jobs standard error.  Args:     logs: The standard output and error of a completed job.  Returns:     Content of standard error.
     * Retrieve Job Stderr
     */
    async retrieveJobStderr(requestParameters: RetrieveJobStderrRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.retrieveJobStderrRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve the jobs standard output.  Args:     logs: The standard output and error of a completed job.  Returns:     Content of standard output.
     * Retrieve Job Stdout
     */
    async retrieveJobStdoutRaw(requestParameters: RetrieveJobStdoutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling retrieveJobStdout.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}/stdout`.replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     * Retrieve the jobs standard output.  Args:     logs: The standard output and error of a completed job.  Returns:     Content of standard output.
     * Retrieve Job Stdout
     */
    async retrieveJobStdout(requestParameters: RetrieveJobStdoutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.retrieveJobStdoutRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Download job output as archive.  Args:     path: Sub directory inside job directory to start from.     job_dir: The job directory.     background_tasks: FastAPI mechanism for post-processing tasks     archive_format: Format to use for archive. Supported formats are \'.zip\',         \'.tar\', \'.tar.xz\', \'.tar.gz\', \'.tar.bz2\'     exclude: list of filename patterns that should be excluded from archive.     exclude_dirs: list of directory patterns that should be excluded from archive.  Returns:     FileResponse: Archive containing the output of job_dir
     * Retrieve Job Subdirectory As Archive
     */
    async retrieveJobSubdirectoryAsArchiveRaw(requestParameters: RetrieveJobSubdirectoryAsArchiveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.path === null || requestParameters.path === undefined) {
            throw new runtime.RequiredError('path','Required parameter requestParameters.path was null or undefined when calling retrieveJobSubdirectoryAsArchive.');
        }

        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling retrieveJobSubdirectoryAsArchive.');
        }

        const queryParameters: any = {};

        if (requestParameters.archiveFormat !== undefined) {
            queryParameters['archive_format'] = requestParameters.archiveFormat;
        }

        if (requestParameters.exclude) {
            queryParameters['exclude'] = requestParameters.exclude;
        }

        if (requestParameters.excludeDirs) {
            queryParameters['exclude_dirs'] = requestParameters.excludeDirs;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}/archive/{path}`.replace(`{${"path"}}`, encodeURIComponent(String(requestParameters.path))).replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     * Download job output as archive.  Args:     path: Sub directory inside job directory to start from.     job_dir: The job directory.     background_tasks: FastAPI mechanism for post-processing tasks     archive_format: Format to use for archive. Supported formats are \'.zip\',         \'.tar\', \'.tar.xz\', \'.tar.gz\', \'.tar.bz2\'     exclude: list of filename patterns that should be excluded from archive.     exclude_dirs: list of directory patterns that should be excluded from archive.  Returns:     FileResponse: Archive containing the output of job_dir
     * Retrieve Job Subdirectory As Archive
     */
    async retrieveJobSubdirectoryAsArchive(requestParameters: RetrieveJobSubdirectoryAsArchiveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.retrieveJobSubdirectoryAsArchiveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve all jobs of user from the database.  Args:     limit: limit of jobs.     offset: offset of jobs.     job_dao: JobDAO object.     user: Current active user.     context: Context with destinations.     file_staging_queue: When scheduler reports job is complete.         The output files need to be copied back.         Use queue to perform download outside request/response handling.  Returns:     stream of jobs.
     * Retrieve Jobs
     */
    async retrieveJobsRaw(requestParameters: RetrieveJobsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<JobModelDTO>>> {
        const queryParameters: any = {};

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        if (requestParameters.offset !== undefined) {
            queryParameters['offset'] = requestParameters.offset;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(JobModelDTOFromJSON));
    }

    /**
     * Retrieve all jobs of user from the database.  Args:     limit: limit of jobs.     offset: offset of jobs.     job_dao: JobDAO object.     user: Current active user.     context: Context with destinations.     file_staging_queue: When scheduler reports job is complete.         The output files need to be copied back.         Use queue to perform download outside request/response handling.  Returns:     stream of jobs.
     * Retrieve Jobs
     */
    async retrieveJobs(requestParameters: RetrieveJobsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<JobModelDTO>> {
        const response = await this.retrieveJobsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Run interactive app on a completed job.  Args:     request: The request.     job_dir: The job directory.     application: The interactive application.  Returns:     The result of running the interactive application.
     * Run Interactive App
     */
    async runInteractiveAppRaw(requestParameters: RunInteractiveAppRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<InteractiveAppResult>> {
        if (requestParameters.jobid === null || requestParameters.jobid === undefined) {
            throw new runtime.RequiredError('jobid','Required parameter requestParameters.jobid was null or undefined when calling runInteractiveApp.');
        }

        if (requestParameters.application === null || requestParameters.application === undefined) {
            throw new runtime.RequiredError('application','Required parameter requestParameters.application was null or undefined when calling runInteractiveApp.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["token"] = this.configuration.apiKey("token"); // APIKeyQuery authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/job/{jobid}/interactive/{application}`.replace(`{${"jobid"}}`, encodeURIComponent(String(requestParameters.jobid))).replace(`{${"application"}}`, encodeURIComponent(String(requestParameters.application))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.body as any,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => InteractiveAppResultFromJSON(jsonValue));
    }

    /**
     * Run interactive app on a completed job.  Args:     request: The request.     job_dir: The job directory.     application: The interactive application.  Returns:     The result of running the interactive application.
     * Run Interactive App
     */
    async runInteractiveApp(requestParameters: RunInteractiveAppRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<InteractiveAppResult> {
        const response = await this.runInteractiveAppRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const RetrieveJobDirectoryAsArchiveArchiveFormatEnum = {
    Zip: '.zip',
    Tar: '.tar',
    TarXz: '.tar.xz',
    TarGz: '.tar.gz',
    TarBz2: '.tar.bz2'
} as const;
export type RetrieveJobDirectoryAsArchiveArchiveFormatEnum = typeof RetrieveJobDirectoryAsArchiveArchiveFormatEnum[keyof typeof RetrieveJobDirectoryAsArchiveArchiveFormatEnum];
/**
 * @export
 */
export const RetrieveJobSubdirectoryAsArchiveArchiveFormatEnum = {
    Zip: '.zip',
    Tar: '.tar',
    TarXz: '.tar.xz',
    TarGz: '.tar.gz',
    TarBz2: '.tar.bz2'
} as const;
export type RetrieveJobSubdirectoryAsArchiveArchiveFormatEnum = typeof RetrieveJobSubdirectoryAsArchiveArchiveFormatEnum[keyof typeof RetrieveJobSubdirectoryAsArchiveArchiveFormatEnum];
