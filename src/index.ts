import express, { Request, Response } from 'express'
import cors from 'cors'

const app = express()

app.use(express.json())

app.use(cors())


app.listen(3003, () => {
    console.log("Api rodando na porta 3003!")
})