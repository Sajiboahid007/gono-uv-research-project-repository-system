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
const departmentRouter = require("./routes/department");
const roleRouter = require("./routes/role");
const batchesRouter = require("./routes/batches");

app.use("/api", userRouter);
app.use("/api", loginRouter);
app.use("/api", departmentRouter);
app.use("/api", roleRouter);
app.use("/api", batchesRouter);

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
