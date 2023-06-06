
export type TUser = {
    name: string,
    email: string
}

export enum LIST_STATUS {
    PROGRESS = "Em andamento",
    FINISHED = "Finalizado"
}

export type TApplication = {
    jobName: string,
    companyName: string,
    applicationDate: string,
    jobRequirements: Array<string>,
    processStatus: LIST_STATUS
}