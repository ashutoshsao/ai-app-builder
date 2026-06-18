import express from "express";
import appRouter from "./src/route";
import { Env } from "./src/utils/config";
import { errorHandler } from "./src/middleware/error.middleware";

const app = express();

app.use(express.json());

app.use("/api", appRouter);

app.use(errorHandler);

app.listen(Env.PORT, () => {
  console.log(`started backend server on port port ${Env.PORT}`);
});
