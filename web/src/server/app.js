import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.get('/', (_req, res) => {
  const componentPlan = [
    {
      tag: 'marketplace-home-shell',
      props: {
        title: 'Collectible Trading Post',
        note: 'Project setup is working. Real Lit components come in the next phase.'
      }
    },
    {
      tag: 'marketplace-status-panel',
      props: {
        backendHealthUrl: 'http://localhost:3000/api/health',
        phase: 'Phase 0'
      }
    }
  ];

  res.render('pages/home', {
    pageTitle: 'Collectible Trading Post',
    componentPlan
  });
});

app.listen(PORT, () => {
  console.log(`Web server running at http://localhost:${PORT}`);
});