import { ApplicationApi } from "~/bartender-client/apis/ApplicationApi";
import { Configuration } from "~/bartender-client/runtime";

const BARTENDER_API_URL = "http://127.0.0.1:8000";
// TODO move to session?
// TODO dont hardcode but get by authenticating to bartender ws
const accessToken = '...'

function buildApplicationApi(accessToken: string = '') {
    const config = new Configuration({
        basePath: BARTENDER_API_URL,
        accessToken
      });
      return new ApplicationApi(config);
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

export async function submitJob(application: string, upload: File) {
    const api = buildApplicationApi(accessToken)
    const response = await api.uploadJobApiApplicationApplicationJobPutRaw({
        application,
        upload,
    })
    console.log(response.raw.status)
    console.log(await response.raw.text())
    console.log(response.raw.headers)
    const location = response.raw.headers.get('location') || ''
    console.log(location)
    const jobid = location.replace('/api/job/', '')
    return jobid
}