export const CompletedJobs = new Set(["ok", "error"]);

const basePath = process.env.REMIX_BASEPATH ?? "";

export const url = (path: string) => `${basePath}${path}`;
