"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const main_route_1 = __importDefault(require("./routes/main.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 8000;
app.use('/', main_route_1.default);
app.listen(PORT, () => {
    console.log(`Server Running at ${HOST}:${PORT}`);
});
