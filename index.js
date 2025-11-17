const express = require("express");
const router = require("./routes/app");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const port = 9000;

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://recipe-founder-ten.vercel.app",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use("/", router);

mongoose
  .connect(process.env.MongoDB_Url, {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(port, () => {
  console.log("server running on ", `http://localhost:${port}`);
});




