//require('dotenv').config({path : './env'})
import {} from 'dotenv/config'
import connectDB from "./db/index.js";




connectDB()
















/*import express from "express"
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error" , (error)=>{
            console.log("ERROR : " , error);
            throw error
        })

        app.listen(process.env.PORT , ()=>{
            console.log(`APP is listening on port ${process.env.PORT}`)
        });
    } catch (error) {
        console.log("ERROR:", error)
        throw err
    }
})()
    */