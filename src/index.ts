import express, { Request, Response } from 'express'
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
    const { name, email } = req.body
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

app.listen(3003, () => {
    console.log("Api rodando na porta 3003!")
})