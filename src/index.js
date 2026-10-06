import dotenv from "dotenv"
import { app } from "./app.js";
import dns from "node:dns"
dns.setDefaultResultOrder("ipv4first")
dns.setServers(["8.8.8.8", "1.1.1.1"])
dotenv.config({
    path : './.env'
})

import connectDB from "./db/index.js";
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at : , ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("Mongo db connection failed !", err);
    
})


/*
require('dotenv').config({path : './env'})
import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants"; 
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

