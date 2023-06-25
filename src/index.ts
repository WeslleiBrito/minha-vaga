import express from 'express'
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


app.listen(3003, () => {
    console.log("Api rodando na porta 3003!")
})
