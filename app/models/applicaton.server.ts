import { ApplicationApi } from "~/bartender-client/apis/ApplicationApi";
import type { JobModelDTO } from "~/bartender-client/models/JobModelDTO";
import { buildConfig } from "./config.server";


function buildApplicationApi(accessToken: string = '') {
      return new ApplicationApi(buildConfig(accessToken));
}

export async function applicationNames() {
  const api = buildApplicationApi()
  return await api.listApplicationsApiApplicationGet();
}

export async function applicationByName(name: string) {
    const api = buildApplicationApi()
    return await api.getApplicationApiApplicationApplicationGet({
        application: name
    })
}

export async function submitJob(application: string, upload: File, accessToken: string) {
    console.log({application, upload, accessToken})
    const api = buildApplicationApi(accessToken)
    const response = await api.uploadJobApiApplicationApplicationJobPutRaw({
        application,
        upload,
    })
    const job: JobModelDTO = await response.raw.json()
    return job
}