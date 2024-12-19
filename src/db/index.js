import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("MONGODB connection error" , error);
        process.exit(1)
    }
}

export default connectDB






/* chatgpt- "https://chatgpt.com/share/676410ff-5544-800f-833a-09da88c3ee11" */
/*Import lesson - 
1) Use try and catch
2)process.exit bcz if db connection fail stop all code execution
3)constant.js istead of constent same in index file ...db/index.js */