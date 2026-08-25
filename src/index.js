//require('dotenv').config({path : './env'})
import dotenv from "dotenv"

//import mongoose, { connect } from "mongoose";
//import { DB_NAME } from "./constants"; 

import connectDB from "./db/index.js";
connectDB()

dotenv.config({
    path : './env'
})
/*
import express from "express"
const app = express();

;(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error" , (error) => {
            console.log("Error here:" , error);
            throw error
        })

        app.listen(process.env.PORT , () => {
            console.log(`App is listening on ${process.env.PORT}`);
        })
    }catch (error){
        console.log("Error: " , error);
        throw error
    }
})()
*/

