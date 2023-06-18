import { Request, Response } from "express";
import { db } from ".."


export const createApplication = async (req: Request, res: Response) => {

    try {
        const { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body

        Object.entries({jobName, companyName, applicationDate, processStatus}).map((property) => {
            const [key, value] = property

            if(typeof(value) === "string"){

                if(value.length === 0){
                    res.status(400)
                    throw new Error(`A propriedade "${key}" não pode ser vazia.`)
                }

            }else{
                res.status(422)
                throw new Error(`A propriedade "${key}" deve ser do tipo 'string', porém o valor recebido foi do tipo '${typeof(value)}'.`)
            }
        })

        res.status(200).json("Aplicação criada com sucesso!")

    } catch (error: any) {
        res.json({error: error.message})
    }


}