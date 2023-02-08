import { JobApi } from "~/bartender-client/apis/JobApi";
import { buildConfig } from "./config.server";

function buildJobApi(accessToken: string = '') {
    return new JobApi(buildConfig(accessToken));
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