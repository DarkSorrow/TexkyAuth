//import template from "./template.marko";
import marko from "marko";
import { errors } from 'oidc-provider';

//const errorTemplate = marko.load("./pages/error/template.marko");
const errorTemplate = marko.load("./templates/error.marko");
const { SessionNotFound } = errors;

export const errorMiddleware = async (ctx, out, err) => {
  ctx.log.error({
    out,
    err,
    tmp: 'errorMiddleware',
  }, 'An error occured');
  ctx.type = "html";
  ctx.body = errorTemplate.stream({
    html: ctx.state.html,
    title: ctx.state.t('error.title'),
    statusCode: err.statusCode,
    error_description: err.error_description,
  });
};

export const sessionCheckMiddleware = async (ctx, next) => {
  ctx.set('Surrogate-Control', 'no-store');
  ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  ctx.set('Pragma', 'no-cache');
  ctx.set('Expires', '0');
  try {
    await next();
  } catch (err) {
    if (err instanceof SessionNotFound) {
      ctx.status = err.status;
      const { message: error, error_description } = err;
      await errorMiddleware(ctx, { error, error_description }, err);
    } else {
      throw err;
    }
  }
}

