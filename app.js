const express=require('express')
const app=express();
const port=5000;
require('dotenv').config()

//
app.use(express.json());

//error handler
const catchAsync=(fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(err=>next(err))
    }
}
class appError extends Error {
    constructor(message,statusCode){
        super();
        this.statusCode=statusCode;
        this.message=message;
        }
}
//make database connection
const pg=require('pg');
const { Pool, Client } = pg;
 
const pool = new Pool({
  user: process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
})


const confirmDbConnection=async ()=>{
    try {
       const value= await pool.query('SELECT NOW()');
        console.log('Connection successful!',/*value*/);
    } catch (err) {
        console.error('Database connection failed:', err);
        //process.exit(1); // Exit the process if the database connection fails
    }
}
//api endpoint crud
app.get('/',(req,res)=>{
    res.json({"message":"every thing looks great!!!!"});
})
//get all todos of a particular user
app.get('/add/:user_id',catchAsync(async(req,res,next)=>{
   const {user_id}=req.params;
   const result=await pool.query('SELECT * FROM todos WHERE user_id=$1',[user_id]);
   res.json(result.rows);
}))
//add todos to a particular user
app.post('/add/:user_id',catchAsync(async(req,res,next)=>{
    const {user_id}=req.params;
    const {title,status}=req.body;
    const result=await pool.query('INSERT  FROM todos WHERE user_id=$1',[user_id]);
    res.json(result.rows);
 }))
//update todo of a particular user

//delete todo of a particular user

//global error handler
app.use('*',(req,res)=>{
    throw Error("route not found",400)
})
app.use((err,req,res,next)=>{
    const {message ="something went wrong",statusCode =500}=err
    res.status(statusCode).json({message:message})
})
//server running at port 5000
app.listen(port,async ()=>{
    console.log(`server is running on port ${port}`)
    await confirmDbConnection();
})