import { Router } from "express";
import { getProject, getProjects, initProject } from "../controller/project.controller";

const projectRouter: Router = Router();

projectRouter.post("/", initProject);
projectRouter.get("/:projectId", getProject);
projectRouter.get("/", getProjects);
// projectRouter.post("/project/conversation/:projectId", agentChat);
export default projectRouter;
