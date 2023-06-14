import express, { Request, Response } from 'express'
import { LIST_STATUS, TUser } from './types'
import cors from 'cors'
const sq = require('sqlite3').verbose()

const db = new sq.Database('./base.db')

db.serialize(
    () => {
        db.run(
            'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)'
        )
    }
)

db.serialize(
    () => {
        db.run(
            'CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY, job_name TEXT, company_name TEXT, application_date TEXT, job_requirements TEXT, process_status TEXT)'
        )
    }
)


const app = express()

app.use(express.json())

app.use(cors())

const possibleSolutions = {

    jobRequirements: {

        portuguese: [
            "Verifique o tipo de dado informado na propriedade `jobRequirements`.",
            "Verifique se a propriedade `jobRequirements` foi passada.",
            "Verifique se a sintaxe da propriedade `jobRequirements` foi escrita corretamente.",
            "Verifique se o array passado tem algum valor dentro dele."
        ],

        english: [
            "Check the data type informed in the `jobRequirements` property.",
            "Check if the `jobRequirements` property is passed.",
            "Check that the syntax of the `jobRequirements` property is written correctly.",
            "Check if the passed array has any value inside it."

        ]

    },

    itemJobRequirements: {

        portuguese: [
            "Verifique se todos os requerimentos são do tipo string.",
            "Verifique se existe algum requerimento vazio."
        ],

        english: [
            "Verify that all requests are of type string.",
            "Check if there are any empty requirements."
        ]
    },

    typeValueGeneric: (nameValue: string) => {
        return {
            portuguese: [
                `Verifique se a propriedade '${nameValue}' foi informada, ou se o tipo passado é uma string`
            ],

            english: [
                `Check if the property '${nameValue}' was informed, or if the type passed is a string`
            ]
        }
    },

    processStatus: {

        portuguese: [
            "Verifique se o valor do 'processSatus' é do tipo string'",
            "Verifique se o valor informado encontra-se dentro dessa lista: [Candidato, Aguardando entrevista, Teste técnico, Aguardando resultado técnico, Envio de documentos, Finalizado]"
        ],

        english: [
            "Check if the value of 'processSatus is of type string'",
            "Check if the entered value is within this list: [Candidato, Aguardando entrevista, Teste técnico, Aguardando resultado técnico, Envio de documentos, Finalizado]"
        ]
    },

    editApplication: {

        portuguese: [
            "Se pretende fazer a edição de uma aplicação a vaga, deve ser informado um id válido."
        ],

        english: [
            "If you intend to edit a vacancy application, a valid id must be informed."
        ]
    }
}

// Retorna todos os usuários

app.get('/dados', (req, res) => {
    const query = 'SELECT * FROM users'
    db.all(query, (err: any, rows: any) => {
        if (err) {
            console.error('Erro ao buscar os dados no banco de dados', err.code)
            res.status(500).json({ error: 'Erro ao buscar os dados no banco de dados' })
            return
        }
        console.log(rows)
        res.status(200).json(rows)
    })
})

// Inclui um novo usuário
app.post('/usuarios', (req: Request, res: Response) => {
    const { name, email }: TUser = req.body

    const query = 'INSERT INTO users (name, email) VALUES (?, ?)'

    db.run(query, [name, email], (err: any) => {
        if (err) {
            console.error('Erro ao inserir o novo usuário', err)
            res.status(500).json(
                {
                    error: 'Erro ao inserir o usuário'
                }
            )

            return
        }

        res.json("Cadastro realizado com sucesso!")
    })
})

const validationApplication = (jobName?: string, companyName?: string, applicationDate?: string, jobRequirements?: Array<string>, processStatus?: string, edit?: boolean, id?: string) => {



    let values = [
        jobName,
        companyName,
        applicationDate,

    ]

    const nameValues = [
        "jobName",
        "companyName",
        "applicationDate"
    ]

    if (typeof jobRequirements === "object" && jobRequirements.length > 0) {

        jobRequirements.map((requirement: any) => {

            if (typeof requirement !== "string" || !requirement) {
                throw new Error(JSON.stringify(possibleSolutions.itemJobRequirements))
            }
        })

    }

    values.map((value, index) => {

        if (!value) {
            return new Error(JSON.stringify(possibleSolutions.typeValueGeneric(nameValues[index])))
        }
    })

    if (processStatus) {

        if (
            processStatus !== LIST_STATUS.CANDIDATE &&
            processStatus !== LIST_STATUS.WAITING_INTERVIEW &&
            processStatus !== LIST_STATUS.TECHNICAL_TEST &&
            processStatus !== LIST_STATUS.WAITING_TECHNICAL_RESULT &&
            processStatus !== LIST_STATUS.SUBMISSION_OF_DOCUMENTS &&
            processStatus !== LIST_STATUS.FINISHED
        ) {

            throw new Error(JSON.stringify(possibleSolutions.processStatus))
        }
    }


}



// Incluir novo processo
app.post('/aplicacao', (req: Request, res: Response) => {
    const { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body

    const query = 'INSERT INTO applications (job_name, company_name, application_date, job_requirements, process_status) VALUES (?, ?, ?, ?, ?)'

    try {

        validationApplication(jobName, companyName, applicationDate, jobRequirements, processStatus)
        db.run(query, [jobName, companyName, applicationDate, jobRequirements.toString(), processStatus ? processStatus : LIST_STATUS.CANDIDATE], (err: any) => {

            if (err) {
                console.error('Erro ao inserir a nova aplicação da vaga!')

                res.status(500).json(
                    {
                        error: "Erro ao inserir a nova aplicação"
                    }
                )

                return
            }

            res.status(201).send('Cadastro efetuado com sucesso!')
        })
    } catch (error: any) {

        res.status(400).send(
            {
                possibleSolutions: JSON.parse(error.message)
            }
        )
    }

})

// Retorna todas as aplicações
app.get('/aplicacao', (req: Request, res: Response) => {
    const query = 'SELECT * FROM applications'
    db.all(query, (err: any, rows: any) => {
        if (err) {
            console.error('Erro ao buscar os dados no banco de dados', err.code)
            res.status(500).json({ error: 'Erro ao buscar os dados no banco de dados' })
            return
        }
        console.log(rows)
        res.status(200).json(rows)
    })
})

// Edita uma aplicação
app.put('/aplicacao/:id', (req: Request, res: Response) => {
    const id = req.params.id
    console.log("ID:", id)
    try {



        let { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body

        if (isNaN(Number(id))) {
            console.log("o erro foi no tipo")
            throw new Error(JSON.stringify(possibleSolutions.editApplication))
        }

        const q = "SELECT * FROM applications"
        let checkId
        db.all(q, (err: any, rows: any) => {

            if (err) {
                throw new Error("Erro de comunicação com banco de dados")
            }

            const idsAplications = rows.map((app: any) => app.id)

            if (idsAplications.includes(Number(id))) {
                const query = 'SELECT * FROM applications WHERE id = ?'

                db.all(query, Number(id), (err: any, rows: any) => {

                    if (err) {
                        throw new Error("Erro de comunicação com banco de dados")
                    }

                    res.send(rows)

                })

            } else {
                res.send("Não encontrado!")
            }

        })


    } catch (error: any) {
        res.status(400).send(error.message)
    }

})

/* app.put('/aplicacao/:id', (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (isNaN(Number(id))) {
            throw new Error("O ID fornecido é inválido");
        }

        const q = "SELECT * FROM applications";

        db.all(q, (err: any, rows: any) => {
            if (err) {
                throw new Error("Erro de conexão");
            }

            const idExists = rows.filter((item: any) => {
                return item.id === Number(id);
            });

            if (idExists.length > 0) {
                const query = 'SELECT * FROM applications WHERE id = ?';
                let datasApplication: any;

                db.all(query, Number(id), (err: any, rows: any) => {
                    if (err) {
                        throw new Error("Erro ao buscar os dados no banco de dados");
                    }

                    datasApplication = rows[0];

                    if (datasApplication) {
                        let { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body;

                        jobName = jobName || datasApplication.job_name;
                        companyName = companyName || datasApplication.company_name;
                        applicationDate = applicationDate || datasApplication.application_date;
                        jobRequirements = jobRequirements || datasApplication.job_requirements.split(",");
                        processStatus = processStatus || datasApplication.process_status;

                        validationApplication(jobName, companyName, applicationDate, jobRequirements, processStatus);

                        const updateQuery = 'UPDATE applications SET job_name = ?, company_name = ?, application_date = ?, job_requirements = ?, process_status = ? WHERE id = ?';

                        db.run(updateQuery, [jobName, companyName, applicationDate, jobRequirements.join(","), processStatus, id], (err: any) => {
                            if (err) {
                                throw new Error(`Erro ao atualizar os dados no banco de dados: ${err}`);
                            }

                            res.status(200).json(datasApplication);
                        });
                    } else {
                        throw new Error("Os dados da aplicação não foram encontrados");
                    }
                });
            } else {
                throw new Error("O ID fornecido não existe");
            }
        });
    } catch (error: any) {
        res.status(400).send(error.message);
    }
}); */

app.listen(3003, () => {
    console.log("Api rodando na porta 3003!")
})
