import { Request, Response } from "express";
import { db } from ".."
import { LIST_STATUS } from "../interfaces/enum/LIST_STATUS.enum";
import { isValid, parseISO } from 'date-fns'

export const isListStatus = (value: any): value is LIST_STATUS => {
    return Object.values(LIST_STATUS).includes(value);
}

export const createApplication = async (req: Request, res: Response) => {

    try {
        const { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body

        Object.entries({jobName, companyName, applicationDate, processStatus}).map((property) => {
            const [key, value] = property

            if(typeof(value) === "string"){

                if(value.length === 0){
                    res.status(400)
                    throw new Error(`A propriedade '${key}' não pode ser vazia.`)
                }

            }else{
                res.status(422)
                throw new Error(`A propriedade '${key}' deve ser do tipo 'string', porém o valor recebido foi do tipo '${typeof(value)}'.`)
            }
        })

        if(!Array.isArray(jobRequirements)){
            res.status(422)
            throw new Error(`A propriedade 'jobRequirements' deve ser do tipo 'array' composta por 'strings' não vazia, mas o valor recebido foi '${typeof(jobRequirements)}'.`)
        }else{
            if(jobRequirements.length === 0){
                res.status(400)
                throw new Error(`A propriedade 'jobRequirements' deve ser do tipo 'array' composta por 'strings' não vazia.`) 
            }else{
                jobRequirements.map((item, index) => {
                    if(typeof(item) === "string" && item.length === 0){
                        res.status(400)
                        throw new Error(`A propriedade 'jobRequirements' deve ser do tipo 'array' composta por 'strings' não vazia.`)
                    }else if(typeof(item) !== "string"){
                        res.status(422)
                        throw new Error(`A propriedade 'jobRequirements' espera receber um array composto apenas por strings, mas na posição '${index}', foi recebido um valor do tipo '${typeof(item)}'.`)
                    }
                })
            }
        }

        
        


        if(!isListStatus(processStatus)){
            res.status(400)
            throw new Error(`A propriedade 'processStatus' deve ter um desses valores: ['Candidato', 'Aguardando entrevista', 'Teste técnico', 'Aguardando resultado técnico', 'Envio de documentos', 'Finalizado'].`)
        }

        
        const query = 'INSERT INTO applications (job_name, company_name, application_date, job_requirements, process_status) VALUES (?, ?, ?, ?, ?)'
        const values = [jobName, companyName, applicationDate, jobRequirements.toString(), processStatus]

        const validateDate = (date: string) =>  {
            const dateTest = parseISO(date)

            if(!isValid(dateTest)){
                res.status(422)
                throw new Error("A propriedade 'applicationDate' deve ser do tipo 'string' e possuir o seguinte formato 'aaaa-mm-dd.")
            }

            if(new Date(date).getTime() > new Date().getTime()){
                throw new Error("A data da aplicação não pode ser maior que a data atual.")
            }
          
            
        }

        validateDate(applicationDate)

        const newApplication = await new Promise((resolve, reject) => {
            db.run(query, values, (err: any) => {
                if(err){
                    reject(err)
                }

                resolve(true)
            })
        })

       if(newApplication){
            res.status(200).json("Aplicação criada com sucesso!")
       }else{
            res.status(500)
            throw new Error("Tivemos problemas para salvar a nova aplicação, tente novamente.")
       }
        

    } catch (error: any) {
        res.json({error: error.message})
    }


}