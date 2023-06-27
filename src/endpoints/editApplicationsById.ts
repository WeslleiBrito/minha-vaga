import { db } from ".."
import { Request, Response } from 'express'
import { isListStatus, validateJobRequirements } from "./createApplication"

export const editApplicationsById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body

        if (isNaN(Number(id))) {
            res.status(422)
            throw new Error("Informe um id válido!")
        }

        let datas

        const idExists = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM applications", (err: any, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }



                const datasBd = row.find((item: any) => {
                    return item.id = Number(id)
                })

                datas = [
                    jobName ? jobName : datasBd.job_name,
                    companyName ? companyName : datasBd.company_name,
                    applicationDate ? applicationDate : datasBd.application_date,
                    processStatus ? processStatus : datasBd.process_status
                ]


                row.map((application: any) => {
                    if (application.id === Number(id)) {
                        resolve(true)
                    }
                })

                resolve(false);
            });
        });

        const bdRequirements = await new Promise((resolve, reject) => {

            db.all("SELECT * FROM requirements", (err: any, rows: any) => {

                if (err) {
                    res.status(500)
                    throw new Error("Erro no servidor")
                }

                const requirements = rows.filter((item: any) => {
                    return item.reference === Number(id)
                })

                resolve(requirements.map((item: any) => {
                    return item.requirement
                }))
            })
        })

        const datasRequirements = jobRequirements ? jobRequirements : bdRequirements

        if (!idExists) {
            res.status(400)
            throw new Error("O id informado não consta em nossa base de dados, verifique e tente novamente!")
        }


        // Verificar se todos os elementos são do tipo string

        Object.entries({ jobName, companyName, applicationDate, processStatus }).map((item) => {
            const [key, value] = item

            if (typeof (value) !== "undefined") {
                if (typeof (value) === "string") {
                    if (value.length === 0) {
                        res.status(400)
                        throw new Error(`A propriedade '${key}' fosse recebida com valor vazio, verifique e tente novamente!`)
                    }
                } else {
                    res.status(422)
                    throw new Error(`Era esperado que a propriedade '${key}' fosse do tipo string, porém o valor recebido foi do tipo '${typeof (value)}.'`)
                }
            }
        })


        if (processStatus && !isListStatus(processStatus)) {
            res.status(400)
            throw new Error(`A propriedade 'processStatus' deve ter um desses valores: ['Candidato', 'Aguardando entrevista', 'Teste técnico', 'Aguardando resultado técnico', 'Envio de documentos', 'Finalizado'].`)
        }

        validateJobRequirements(jobRequirements)

        if (typeof (jobRequirements) !== "undefined") {

            await db.run("DELETE FROM requirements WHERE reference = ?", [Number(id)], (err: any) => {
                if (err) {
                    res.status(500)
                    throw new Error("Ocorreu um erro no pocessamento da atualizaão.")
                }
            })

        }


        await db.run(`UPDATE applications SET job_name = ?, company_name = ?, application_date = ?, process_status = ? WHERE id = ${Number(id)}`, datas);

        await datasRequirements.map((requirement: any) => {
            db.run("INSERT INTO requirements (requirement, reference) VALUES (?, ?)", [requirement, Number(id)])
        })

        res.status(200).send("Cadastro enviado")
    } catch (error: any) {
        res.json(error.message)
    }

}