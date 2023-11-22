const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

const connectDb = require("./config/db");
connectDb();

const api = require("./routes/api");

app.use("/api", api);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on Port ${port}`);
});
