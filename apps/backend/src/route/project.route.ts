import { Router } from "express";
import { initProject } from "../controller/project.controller";

const projectRouter: Router = Router();

projectRouter.post("/", initProject);
// projectRouter.post("/project/:projectId", getProject);
// projectRouter.post("/projects", getAllProjects);
// projectRouter.post("/project/conversation/:projectId", agentChat);
export default projectRouter;
