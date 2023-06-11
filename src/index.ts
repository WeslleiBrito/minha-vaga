import express, { Request, Response } from 'express'
import { TApplication, TUser } from './types'
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

// Incluir novo processo
app.post('/aplicacao', (req: Request, res: Response) => {
    const { jobName, companyName, applicationDate, jobRequirements, processStatus } = req.body

    const values = [
        jobName,
        companyName,
        applicationDate,

    ]

    const nameValues = [
        "jobName",
        "companyName",
        "applicationDate"
    ]

    const query = 'INSERT INTO applications (job_name, company_name, application_date, job_requirements, process_status) VALUES (?, ?, ?, ?, ?)'

    let propertyNameSolution = ""

    const possibleSolutions = {

        jobRequirements: {

            portuguese: [
                "Verifique o tipo de dado informado na propriedade `jobRequirements`.",
                "Verifique se a propriedade `jobRequirements` foi passada.",
                "Verifique se a sintaxe da propriedade `jobRequirements` foi escrita corretamente.",
                "Verifique se o array passado tem algum valor dentro dele."
            ],

            english : [
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

        typeValueGeneric : (nameValue: string) => {
            return {
                portuguese: [
                    `Verifique se a propriedade '${nameValue}' foi informada, ou se o tipo passado é uma string`
                ],

                english: [
                    `Check if the property '${nameValue}' was informed, or if the type passed is a string`
                ]
            }
        }
    }

    try {

        if(typeof jobRequirements === "object" && jobRequirements.length > 0){

            jobRequirements.map((requirement: any) => {

                if(typeof requirement !== "string" || !requirement){
                    propertyNameSolution = "typeItensRequirements"
                    throw new Error(JSON.stringify(possibleSolutions.itemJobRequirements))
                }
            })   

        }else{

            throw new Error(JSON.stringify(possibleSolutions.jobRequirements))
        }

        values.map((value, index) => {
            if(!value){
                throw new Error(JSON.stringify(possibleSolutions.typeValueGeneric(nameValues[index])))
            }
        })

        db.run(query, [jobName, companyName, applicationDate, jobRequirements.toString(), processStatus], (err: any) => {

            if(err){
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

    } catch (error:any) {
    
        res.status(400).send(
            {
                possibleSolutions: JSON.parse(error.message) 
            }
        )
    }
    
    
})

app.listen(3003, () => {
    console.log("Api rodando na porta 3003!")
})
