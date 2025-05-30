import dotenv from "dotenv"
dotenv.config();

import express from "express"
import connectDB from "./lib/connectDB.js"
import userRouter from "./routes/user.route.js"
import postRouter from "./routes/post.route.js"
import commentRouter from "./routes/comment.route.js"
import categoryRouter from "./routes/category.route.js"
import webHookRouter from "./routes/webhook.route.js"
import userPostsRouter from "./routes/userPosts.route.js"
import contactFormRouter from "./routes/contactForm.route.js" 
import { clerkMiddleware, requireAuth } from '@clerk/express'
import cors from "cors"


const app = express()


app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(clerkMiddleware())
app.use("/webhooks", webHookRouter)
app.use(express.json())
app.use("/users", userRouter)
app.use("/posts", postRouter)
app.use("/comments", commentRouter)
app.use("/api/categories", categoryRouter); 
app.use("/api/user-posts", userPostsRouter)
app.use("/api/contact-forms", contactFormRouter)
app.use("/api/webhook", webHookRouter)


app.use((error, req, res, next)=>{
    res.status(error.status || 500);

    res.json({
        message:error.message || "Something went wrong",
        status:error.status,
        stack:error.stack,
    })
})

app.listen(3000, ()=>{
    connectDB()
    console.log("Sever is running!")
})