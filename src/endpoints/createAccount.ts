import { Request, Response } from "express"
import { db } from ".."


export const createAccount = async (req: Request, res: Response) => {
    try {
        const { name, email, password} = req.body
        const regexLetter = /[a-zA-Z]/
        const regexNumber = /(?=.*\d)/
        const regexSpecialCharacter = /[!#$%&@§*=+|]/

        Object.entries({name, email, password}).map((property) => {
            const [key, value] = property

            if(typeof(value) !== "string"){
                res.status(422)
                throw new Error(`Era esperado que a propriedade "${key}" fosse do tipo string, porém o valor recebido foi do tipo "${typeof(value)}."`)
            }
        })

        if(password.length < 5){
            res.status(400)
            throw new Error("A senha deve ter pelo menos 5 carácteres.")
        }

        if(!regexLetter.test(password)){
            res.status(400)
            throw new Error("A senha deve ter pelo menos uma letra.")
        }

        if(!regexNumber.test(password)){
            res.status(400)
            throw new Error("A senha deve possuir pelo menos um número.")
        }

        if(!regexSpecialCharacter.test(password)){
            res.status(400)
            throw new Error("A senha deve possuir pelo menos um desses carácteres especiais: ['!', '#', '$', '%', '&', '@', '§', '*', '=', '+', '|'].")
        }

        const emailExist = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM accounts", (err: any, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                row.map((account: any) => {
                    if(account.email === email){
                        resolve(true)
                    }
                })

                resolve(false);
            });
        });

        if(emailExist){
            res.status(400)
            throw new Error("Este email já é usado em outra conta.")
        }

        const query = 'INSERT INTO accounts (name, email, password) VALUES (?, ?, ?)'

        db.run(query, [name, email, password], (err: any) => {
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

    } catch (error: any) {
        res.json(error.message)
    }
    
}
