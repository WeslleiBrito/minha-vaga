import { db } from ".."
import { Request, Response } from 'express'

export const getAllUsers = (req: Request, res: Response) => {

    try {
        const query = "SELECT * FROM users"
        db.all(query, (err: any, rows: any) => {

            if(err){
                res.status(500)
                throw new Error("Não foi possivel se conectar ao banco de dados.")
            }

            res.status(200).send(JSON.stringify(rows))
        })
    } catch (error: any) {
        res.send(error.message)
    }
    
}
