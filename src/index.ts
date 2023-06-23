import express, { Request, Response } from 'express'
import { getAllAccounts } from './endpoints/getAllAccounts'
import { createAccount } from './endpoints/createAccount'
import { createApplication } from './endpoints/createApplication'

import cors from 'cors'
import { getAllApplications } from './endpoints/getAllApplications'
import { editApplicationsById } from './endpoints/editApplicationsById'

const sq = require('sqlite3').verbose()

export const db = new sq.Database('D:/Usuário/wesll/OneDrive/Documentos/projetos-pessoais/minha-vaga/src/database/base.db')

db.serialize(
    () => {
        db.run(
            'CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT)'
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


// Incluir um novo usuário
app.post('/account', createAccount)

// Retorna todos os usuários
app.get('/accounts', getAllAccounts)

// Inclui uma nova aplicação a vaga
app.post('/applications', createApplication)


// Retorna todas as aplicações
app.get('/applications', getAllApplications)

// Edita uma aplicação
app.put('/applications/:id', editApplicationsById)

/* app.put('/aplicacao/:id', async (req: Request, res: Response) => {

    try {
        const id = req.params.id

        const { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body


        if (isNaN(Number(id))) {

            const messageError = {
                portuguese: [
                    `Era esperado um valor do tipo "number", mas o valor enviado foi do tipo "${typeof id}".`
                ]
            }

            res.status(400)
            throw new Error(`${JSON.stringify(messageError)}`)
        }

        const query = 'SELECT * FROM applications WHERE id = ?'

        const row = await new Promise((resolve, reject) => {
            db.get(query, [Number(id)], (err: any, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });


        if (!row) {
            res.status(400)
            throw new Error('Id não consta em nossa base de dados!')
        }

        Object.entries({ jobName, companyName, applicationDate }).map((item) => {
            const [key, value] = item

            if (typeof (value) !== "undefined") {
                if (typeof (value) !== "string") {
                    res.status(422)
                    throw new Error(`A propriedade "${key}" deveria ser do tipo "string", mas foi enviado um valor do tipo "${typeof (value)}".`)
                } else if (typeof (value) === 'string' && value.length === 0) {
                    res.status(400)
                    throw new Error(`A propriedade "${key}" não pode ser vazia".`)
                }
            }
        })

    } catch (error: any) {
        res.send(error.message)
    }

}) */



app.listen(3003, () => {
    console.log("Api rodando na porta 3003!")
})
