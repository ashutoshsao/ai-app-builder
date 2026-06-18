import { Router } from "express";
import { authRouter } from "./auth.route";
import projectRouter from "./project.route";
import { verifyAuth } from "../middleware/auth.middleware";

const appRouter: Router = Router();

appRouter.use("/auth", authRouter);
appRouter.use("/projects", verifyAuth, projectRouter);

export default appRouter;
