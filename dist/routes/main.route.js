"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_controller_1 = require("../controllers/main.controller");
const express_1 = __importDefault(require("express"));
const routes = express_1.default.Router();
const mainController = new main_controller_1.MainController();
routes.get("/", mainController.scrapProducts);
exports.default = routes;
