
import marko from "marko";

const logoutTmpl = marko.load("./pages/logout/logout.marko");
const logoutSuccessTmpl = marko.load("./pages/logout/logout_success.marko");

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
