const express = require('express')
const app = express()
const sq = require('sqlite3').verbose()

const db = new sq.Database('./base.db')

db.serialize(
    () => {
        db.run(
            'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)'
        )
    }
)

app.get('/dados', (req, res) => {
    const query = 'SELECT * FROM users'
    db.all(query, (err, rows) => {
        if(err){
            console.error('Erro ao buscar os dados no banco de dados', err)
            res.status(500).json({error: 'Erro ao buscar os dados no banco de dados'})
            return
        }
        res.json(rows)
    })
})

app.post('/usuarios', (req, res) => {
    const {name, email} = req.body
    const query = 'INSERT INTO users (name, email) VALUES (?, ?)'

    db.run(query, [name, email], (err) => {
        if(err){
            console.error('Erro ao inserir o novo usuário', err)
            res.status(500).json(
                {
                    error: 'Erro ao inserir o usuário'
                }
            )

            return
        }

        res.json(
            {
                id: this.lastID
            }
        )
    })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`API rodando na porta ${port}`)
})