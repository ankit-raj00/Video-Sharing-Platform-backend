import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))
app.use(cookieParser())




//route import
import userRouter from './routes/user.routes.js'

// routes declaration

app.use("/api/v1/users" , userRouter) // middleware to give acess of route to whom




export {app}










//whenever we use middleware or we have to do config setting
















