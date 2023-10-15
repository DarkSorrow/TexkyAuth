import Router from 'koa-router';
import marko from "marko";
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { healthCheck } from '../../services/healthcheck.js';

/*export const homeTmpl = marko.load("./pages/home/home.marko");
const interactionTmpl = marko.load("./pages/home/load-interaction.marko");
const layoutTmpl = marko.load("./pages/home/load-layout.marko");*/
export const homeTmpl = marko.load(join(__dirname, "../../templates/home.marko"));
const router = new Router();

router.get('/', (ctx) => {
  ctx.type = "html";
  ctx.body = homeTmpl.stream({
    html: ctx.state.html,
    title: ctx.state.t('home.title'),
  });
});

router.get('/healthcheck', (ctx) => {
  ctx.type = "text";
  if (healthCheck.health === 1) {
    ctx.body = "true";
  } else {
    ctx.status = 400;
    ctx.body = "false";
  }
});

export default router;
