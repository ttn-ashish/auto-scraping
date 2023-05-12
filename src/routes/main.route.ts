import { MainController } from "../controllers/main.controller";
import express from "express";

const routes = express.Router();
const mainController = new MainController();

routes.get("/", mainController.scrapProducts);

export default routes;
