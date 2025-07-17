const express = require("express");
const app = express();
const router = require("./routes/app");
const port = 9000;
app.use(express.json());
const cors = require("cors");
// app.use(cors());
app.use(
  cors({
    origin: "https://recipe-founder-ten.vercel.app",
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.listen(port, () => {
  console.log("server running on ", `http://localhost:${port}`);
});
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
app.use("/", router);

mongoose
  .connect(process.env.MongoDB_Url, {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
