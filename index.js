const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");

// Database Connection
connectDB();


app.use(express.json());

app.use('/auth', require("./routes/userRoutes"));
app.use('/company', require("./routes/companyRoutes"));
app.use('/project', require("./routes/projectRoutes"));
app.use('/tasks', require("./routes/taskRoutes"));

app.listen(process.env.SERVER_PORT,(error)=>{
    if(error){
        console.log(error);
    }else{
        console.log(`Server has started at PORT:${process.env.SERVER_PORT}`)
    }
})