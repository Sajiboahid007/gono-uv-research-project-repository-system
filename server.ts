import express = require("express");
import cors = require("cors");
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./swagger";

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
const roleRouter = require("./routes/roles");
const batchesRouter = require("./routes/batches");
const categoryRouter = require("./routes/category");
const subCategoryRouter = require("./routes/sub-category");

app.use("/api", userRouter);
app.use("/api", loginRouter);
app.use("/api", departmentRouter);
app.use("/api", roleRouter);
app.use("/api", batchesRouter);
app.use("/api", categoryRouter);
app.use("/api", subCategoryRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
