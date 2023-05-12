import { MainController } from "../controllers/main.controller";
import express from 'express';

const routes = express.Router();
const mainController = new MainController();

routes.get('/test', (req, res) => {
    res.write("Heyy geeksforgeeks ", 'utf8', () => {});

    res.write("Heyy sdvdsfb ", 'utf8', () => {
        console.log("Writingsdfvs Data...");
    });
    // res.end();
});
routes.get('/', mainController.scrapProducts);

export default routes;
