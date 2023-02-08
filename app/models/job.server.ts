import { JobApi } from "~/bartender-client/apis/JobApi";
import { buildConfig } from "./config.server";

function buildJobApi(accessToken: string = '') {
    return new JobApi(buildConfig(accessToken));
}

export async function getJobs(accessToken: string, limit= 10, offset = 0) {
    const api = buildJobApi(accessToken)
    return await api.retrieveJobsApiJobGet({
        limit, offset
    })
}

export async function getJobById(jobid: number, accessToken: string) {
    const api = buildJobApi(accessToken)
    return await api.retrieveJobApiJobJobidGet({
        jobid
    })
}

export async function getJobStdout(jobid: number, accessToken: string) {
    const api = buildJobApi(accessToken)
    const response = await api.retrieveJobStdoutApiJobJobidStdoutGetRaw({
        jobid
    })
    return response.raw;
}

export async function getJobStderr(jobid: number, accessToken: string) {
    const api = buildJobApi(accessToken)
    const response = await api.retrieveJobStderrApiJobJobidStderrGetRaw({
        jobid
    })
    return response.raw;
}

export async function getJobfile(jobid: number, path: string, accessToken: string) {
    const api = buildJobApi(accessToken)
    const response = await api.retrieveJobFilesApiJobJobidFilesPathGetRaw({
        jobid,
        path
    })
    return response.raw;
}

