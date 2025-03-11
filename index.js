import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import userroutes from "./src/resources/router/user.routes.js";

const app = express();
app.use(bodyParser.json());



app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", userroutes);

const port = process.env.PORT || 4000;
dotenv.config();
const Server = app.listen(port, async () => {
  console.log(`Server is running on ${port}`);
});