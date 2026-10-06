import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js";

//console.log("Mongo URI:", process.env.MONGODB_URI);
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGO DB connected !! DB host is ${connectionInstance.connection.host}`);
        //console.log(connectionInstance);
        
        //print connectionINstance and see what iti s
    }catch (error){
        console.log("MONGODB connect error" , error);
        process.exit(1);
    }
}

export default connectDB;