import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'
import videoRouter from "./routes/video.routes.js"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true , limit : "100kb"}))
app.use(cookieParser())




//route import
import userRouter from './routes/user.routes.js'
import commentRouter from './routes/comment.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import playlistRouter from './routes/playlist.routes.js'

// routes declaration

app.use("/api/v1/users" , userRouter) // middleware to give acess of route to whom

app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlist", playlistRouter)

export {app}










//whenever we use middleware or we have to do config setting
















