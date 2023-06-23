import { db } from ".."
import { Request, Response } from 'express'
import { LIST_STATUS } from "../interfaces/enum/LIST_STATUS.enum"
import { isListStatus } from "./createApplication"

export const editApplicationsById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body

        if(isNaN(Number(id))){
            res.status(422)
            throw new Error("Informe um id válido!")
        }

        const idExists = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM applications", (err: any, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                row.map((application: any) => {
                    if(application.id === Number(id)){
                        resolve(true)
                    }
                })

                resolve(false);
            });
        });

        if(!idExists){
            res.status(400)
            throw new Error("O id informado não consta em nossa base de dados, verifique e tente novamente!")
        }

        // Verificar se todos os elementos são do tipo string

        Object.entries({jobName, companyName, applicationDate, processStatus}).map((item) => {
            const [key, value] = item

            if(typeof(value) !== "undefined"){
                if(typeof(value) === "string"){
                    if(value.length === 0){
                        res.status(400)
                        throw new Error(`A propriedade '${key}' fosse recebida com valor vazio, verifique e tente novamente!`)
                    }
                }else{
                    res.status(422)
                throw new Error(`Era esperado que a propriedade '${key}' fosse do tipo string, porém o valor recebido foi do tipo '${typeof(value)}.'`)
                }
            }
        })


        if(processStatus && !isListStatus(processStatus)){
            res.status(400)
            throw new Error(`A propriedade 'processStatus' deve ter um desses valores: ['Candidato', 'Aguardando entrevista', 'Teste técnico', 'Aguardando resultado técnico', 'Envio de documentos', 'Finalizado'].`)
        }
        

        res.status(200).send("Cadastro enviado")
    } catch (error: any) {
        res.send(error.message)
    }
    
}