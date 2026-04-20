import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pagesRouter from './routes/pages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const viewsPath = path.join(__dirname, '../views');
const publicPath = path.join(__dirname, '../public');

app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use('/css', express.static(path.join(publicPath, 'css')));
app.use('/js', express.static(path.join(publicPath, 'js')));
app.use('/images', express.static(path.join(publicPath, 'images')));

app.use('/', pagesRouter);

app.listen(PORT, () => {
  console.log(`Web server running at http://localhost:${PORT}`);
});