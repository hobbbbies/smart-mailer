// app.js
const express = require("express");
const app = express();
const emailRouter = require("./routes/emailRouter");
const authService = require("./routes/auth");
const PORT = process.env.PORT || 3000;
const cors = require('cors');

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