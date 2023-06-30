import express from 'express'
import { getAllAccounts } from './endpoints/getAllAccounts'
import { createAccount } from './endpoints/createAccount'
import { createApplication } from './endpoints/createApplication'

import cors from 'cors'
import { getAllApplications } from './endpoints/getAllApplications'
import { editApplicationsById } from './endpoints/editApplicationsById'
import { testeApplication } from './endpoints/testesApplication'

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
            'CREATE TABLE IF NOT EXISTS applications (id TEXT PRIMARY KEY UNIQUE NOT NULL, job_name TEXT NOT NULL, company_name TEXT NOT NULL, create_at TEXT DEFAULT (DATE()) NOT NULL, process_status TEXT NOT NULL, link_application TEXT NOT NULL, email TEXT);'
        )
    }
)

db.serialize(
    () => {
        db.run(
            'CREATE TABLE IF NOT EXISTS requirements (id TEXT PRIMARY KEY UNIQUE NOT NULL, requirement TEXT NOT NULL);'
        )
    }
)

db.serialize(
    () => {
        db.run(
            'CREATE TABLE IF NOT EXISTS applications_requirements (application_id INTEGER NOT NULL, requirement TEXT NOT NULL, FOREIGN KEY (applications_id) REFERENCES applications (id), FOREIGN KEY (requirements_id) REFERENCES requirements (id));'
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

app.post('/testApplication', testeApplication)

app.listen(3003, () => {
    console.log("Api rodando na porta 3003!")
})
