// app.js
const express = require("express");
const app = express();
const emailRouter = require("./routes/emailRouter");
const authService = require("./services/auth");
const PORT = process.env.PORT || 3000;
const cors = require('cors');
// const { PrismaClient } = require('./generated/prisma');
// const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
// const prisma = new PrismaClient()

require('dotenv').config();
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use("/api/email", emailRouter);  
app.use('/', authService);

app.listen(PORT, () => {
    console.log("Listening on 3000");
})