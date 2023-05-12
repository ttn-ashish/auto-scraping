import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import routes from './routes/main.route';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'http://localhost';

/**
 * Default Routing
 */
app.use('/', routes);

/**
 * Use to navigate 404
 */
app.use(function (req, res) {
    res.status(404).json({message: 'Page not found'});
});

/**
 * Start the server on given PORT
 */
app.listen(PORT, (): void => {
    console.log(`Server Running at ${HOST}:${PORT}`);
});