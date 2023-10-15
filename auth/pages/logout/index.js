
import marko from "marko";
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/*const logoutTmpl = marko.load("./pages/logout/logout.marko");
const logoutSuccessTmpl = marko.load("./pages/logout/logout_success.marko");*/
const logoutTmpl = marko.load(join(__dirname, "../../templates/logout.marko"));
const logoutSuccessTmpl = marko.load(join(__dirname, "../../templates/logout_success.marko"));
export const logoutMiddleware = async (ctx, form) => {
  console.log('logout template', {
    form,
  })
  ctx.type = "html";
  ctx.body = logoutTmpl.stream({
    html: ctx.state.html,
    title: ctx.state.t('logout.title'),
    form,
    host: ctx.host,
    auto: (ctx.request.query.auto === 'true'),
  });
};

export const logoutSuccessMiddleware = async (ctx) => {
  console.log('logout success template ***************')
  ctx.type = "html";
  ctx.body = logoutSuccessTmpl.stream({
    html: ctx.state.html,
    title: ctx.state.t('logout.title'),
    host: ctx.host,
    auto: (ctx.request.query.auto === 'true'),
  });
};
