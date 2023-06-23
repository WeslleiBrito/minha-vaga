import { db } from ".."
import { Request, Response } from 'express'

export const getAllApplications = (req: Request, res: Response) => {

    try {
        const query = "SELECT * FROM applications"
        
        db.all(query, (err: any, rows: any) => {

            if(err){
                res.status(500)
                throw new Error("Não foi possivel se conectar ao banco de dados.")
            }

            res.status(200).json(rows)
        })

    } catch (error: any) {
        res.send(error.message)
    }
    
}