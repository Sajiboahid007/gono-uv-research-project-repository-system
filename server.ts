import express = require("express");
import cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

const loginRouter = require("./routes/login");
const userRouter = require("./routes/user");

app.use("/api", userRouter);
app.use("/api", loginRouter);

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
