import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pagesRouter from './routes/pages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const viewsPath = path.join(__dirname, '../views');
const publicPath = path.join(__dirname, '../public');
const componentsPath = path.join(__dirname, '../components');
const nodeModulesPath = path.join(__dirname, '../../node_modules');

app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/css', express.static(path.join(publicPath, 'css')));
app.use('/js', express.static(path.join(publicPath, 'js')));
app.use('/images', express.static(path.join(publicPath, 'images')));
app.use('/components', express.static(componentsPath));

app.use('/vendor/lit', express.static(path.join(nodeModulesPath, 'lit')));
app.use('/vendor/lit-html', express.static(path.join(nodeModulesPath, 'lit-html')));
app.use('/vendor/lit-element', express.static(path.join(nodeModulesPath, 'lit-element')));
app.use('/vendor/@lit', express.static(path.join(nodeModulesPath, '@lit')));

// Proxy frontend /api/* requests to backend server
app.use('/api', async (req, res) => {
  try {
    const targetUrl = new URL(req.originalUrl, API_BASE_URL);

    const headers = {
      accept: 'application/json'
    };

    const requestInit = {
      method: req.method,
      headers
    };

    if (!['GET', 'HEAD'].includes(req.method) && Object.keys(req.body || {}).length > 0) {
      headers['content-type'] = 'application/json';
      requestInit.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, requestInit);
    const contentType = response.headers.get('content-type') || '';

    res.status(response.status);

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    }

    const text = await response.text();
    return res.send(text);
  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(502).json({
      error: 'Failed to reach backend API'
    });
  }
});

app.use('/', pagesRouter);

app.listen(PORT, () => {
  console.log(`Web server running at http://localhost:${PORT}`);
  console.log(`Proxying API requests to ${API_BASE_URL}`);
});