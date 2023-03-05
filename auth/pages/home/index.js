import Router from 'koa-router';
import marko from "marko";

export const homeTmpl = marko.load("./pages/home/home.marko");

const router = new Router();

router.get('/', (ctx) => {
  ctx.type = "html";
  ctx.body = homeTmpl.stream({
    html: ctx.state.html,
    title: ctx.state.t('home.title'),
  });
});

export default router;

