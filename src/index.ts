import express from 'express'
import { getAllAccounts } from './endpoints/getAllAccounts'
import { createAccount } from './endpoints/createAccount'
import { createApplication } from './endpoints/createApplication'

import cors from 'cors'
import { getAllApplications } from './endpoints/getAllApplications'
import { editApplicationsById } from './endpoints/editApplicationsById'

const sq = require('sqlite3').verbose()

export const db = new sq.Database('src/database/base.db')

db.serialize(
    () => {
        db.run(
            'CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL)'
        )
    }
)

db.serialize(
    () => {
        db.run(
            'CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY, job_name TEXT NOT NULL, company_name TEXT NOT NULL, application_date TEXT NOT NULL, job_requirements TEXT NOT NULL, process_status TEXT NOT NULL, link_application TEXT NOT NULL, email TEXT)'
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
