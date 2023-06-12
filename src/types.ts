
export type TUser = {
    name: string,
    email: string
}

export enum LIST_STATUS {
    CANDIDATE = "Candidato",
    WAITING_INTERVIEW = "Aguardando entrevista",
    TECHNICAL_TEST = "Teste técnico",
    WAITING_TECHNICAL_RESULT = "Aguardando resultado técnico",
    SUBMISSION_OF_DOCUMENTS = "Envio de documentos",
    FINISHED = "Finalizado"
}

export type TApplication = {
    jobName: string,
    companyName: string,
    applicationDate: string,
    jobRequirements: Array<string>,
    processStatus: LIST_STATUS
}