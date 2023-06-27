import { Request, Response, response } from "express";
import { db } from ".."
import { LIST_STATUS } from "../interfaces/enum/LIST_STATUS.enum";
import { isValid, parseISO } from 'date-fns'

export const isListStatus = (value: any): value is LIST_STATUS => {
    return Object.values(LIST_STATUS).includes(value);
}

export const validateJobRequirements = (value: any) => {
    if (typeof (value) !== "undefined") {

        if (!Array.isArray(value)) {
            response.status(422)
            throw new Error(`A propriedade 'jobRequirements' deve ser do tipo 'array' composta por 'strings' não vazias, mas o valor recebido foi um/uma '${typeof (value)}'.`)
        } else {

            if (value.length === 0) {
                response.status(400)
                throw new Error(`A propriedade 'jobRequirements' não pode ser um 'array' vazio.`)

            } else {

                value.map((item, index) => {

                    if (typeof (item) === "string" && item.length === 0) {
                        response.status(400)
                        throw new Error(`Não é permitido valores vazios na propriedade 'jobRequirements', mas na posição '${index}, foi informado um valor vazio.'`)

                    } else {
                        if (typeof (item) !== "string") {
                            response.status(422)
                            throw new Error(`A propriedade 'jobRequirements' espera receber um array composto apenas por strings, mas na posição '${index}', foi recebido um valor do tipo '${typeof (item)}'.`)
                        }
                    }
                })
            }
        }

    }

    return true
}

export const createApplication = async (req: Request, res: Response) => {

    try {
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const regexURL = /((https?:\/\/)|(ftp:\/\/)|(^))([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+([a-zA-Z]{2,9})(:\d{1,4})?([-\w\/#~:.?+=&amp;%@~]*)/

        const { jobName, companyName, applicationDate, jobRequirements, processStatus, linkApplication, email } = req.body

        // Validação de volores que devem ser obrigatórios e o tipo string e valor não vazio
        Object.entries({ jobName, companyName, applicationDate, processStatus, linkApplication }).map((property) => {
            const [key, value] = property

            if (typeof (value) === "string") {

                if (value.length === 0) {
                    res.status(400)
                    throw new Error(`A propriedade '${key}' não pode ser vazia.`)
                }

            } else {
                res.status(422)
                throw new Error(`A propriedade '${key}' deve ser do tipo 'string', porém o valor recebido foi do tipo '${typeof (value)}'.`)
            }
        })

        if (!regexURL.test(linkApplication)) {
            res.status(400)
            throw new Error("URL inválida.")
        }

        if (typeof (email) !== "undefined") {

            if (!regexEmail.test(email) || typeof (email) !== "string") {
                res.status(400)
                throw new Error("Email inválido.")
            }
        }

        validateJobRequirements(jobRequirements)

        if (!isListStatus(processStatus)) {
            res.status(400)
            throw new Error(`A propriedade 'processStatus' deve ter um desses valores: ['Candidato', 'Aguardando entrevista', 'Teste técnico', 'Aguardando resultado técnico', 'Envio de documentos', 'Finalizado'].`)
        }


        const query = 'INSERT INTO applications (job_name, company_name, application_date, job_requirements, process_status, link_application,email) VALUES (?, ?, ?, ?, ?, ?, ?)'
        const values = [jobName, companyName, applicationDate, jobRequirements.toString(), processStatus, linkApplication, typeof (email) !== "undefined" ? email : ""]

        const validateDate = (date: string) => {
            const dateTest = parseISO(date)

            if (!isValid(dateTest)) {
                res.status(422)
                throw new Error("A propriedade 'applicationDate' deve ser do tipo 'string' e possuir o seguinte formato 'aaaa-mm-dd.")
            }

            if (new Date(date).getTime() > new Date().getTime()) {
                throw new Error("A data da aplicação não pode ser maior que a data atual.")
            }


        }

        validateDate(applicationDate)

        const newApplication = await new Promise((resolve, reject) => {
            db.run(query, values, (err: any) => {
                if (err) {
                    reject(err)
                }

                resolve(true)
            })
        })

        if (newApplication) {
            res.status(200).json("Aplicação criada com sucesso!")
        } else {
            res.status(500)
            throw new Error("Tivemos problemas para salvar a nova aplicação, tente novamente.")
        }


    } catch (error: any) {
        res.json({ error: error.message })
    }


}