import Koa from 'koa';
import { nanoid } from 'nanoid';
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import crypto from 'crypto';

const router = new Router();
const body = koaBody({
  text: false, json: false, patchNode: true, patchKoa: true,
});

const app = new Koa();

const base64EncodeURL = (encode) => Buffer.from(encode, 'utf8').toString('base64').replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

const getCodeChallenge = async (codeVerifier) => {
  //const encoder = new TextEncoder();
  //const data = encoder.encode(codeVerifier);
  //const hash = await crypto.createHash("sha256").update(data).digest("base64");

    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64').replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  /*const hashDigest = sha256(codeVerifier);
  return Base64.stringify(hashDigest)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");*/
      return hash;
  };
const API_PORT = 4000;
const CLIENT_ID = 'ABCgWwsfyRQ0XRAE';
const CLIENT_SECRET = 'ABCTTM28ulASJAqoS9PkHVMh73fnx7sX';
const REDIRECT_URL = `http://localhost:${API_PORT}/authentified`;

router.get('/iframe', async (ctx, next) => {
  console.log(ctx.request.query.id)
  res.send(rpIframe);//http://localhost:8143/dev-test/register?software_id=homebyme
  /*replace(//id_token_hint=${ctx.request.query.id}&
      'http://localhost:8080/session/end',
      )*/
});
const codeVerifier = nanoid(64);
router.get('/authentified', async function (ctx, next) {
  let new_body = {
      params: ctx.request.params,
      query: ctx.request.query,
      body: ctx.request.body
  };
  /*const codeVerifier = nanoid(64);
  console.log(codeVerifier);
  const codeChallenge = await getCodeChallenge(codeVerifier);*/
  console.log("going to redirect?")
  if (ctx.request.query.code !== undefined) {
      console.log('code:', ctx.request.query.code)
      let data = {};
      try {
        const details = {
          'code': ctx.request.query.code,
          'redirect_uri': REDIRECT_URL,
          'grant_type': 'authorization_code',
          'code_verifier': codeVerifier,
        };
        const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');
        const headers = new Headers();
        headers.set('Authorization', 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64').replace(/=/g, ""));
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
//        headers.set('Content-Length', JSON.stringify(details).length);
        console.log('formbody:', formBody);
        const body = await fetch('http://localhost:8080/token', {
          method: 'POST',
          body: formBody,
          headers,
          //credentials: "include",
        });
        data = await body.json();
      } catch (error) {
        console.log('err:', error);
      }
      console.log('data:', data);
      let form = `<html>
          <script>
          //test1
          var refresh = "${data.refresh_token}";
          var urlEncode = "http%3A%2F%2Flocalhost%3A4000%2Fauthentified";
          var scopes = "openid%20email";
          function setValues() {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', 'http://localhost:8080/me');
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.setRequestHeader('Authorization', 'Bearer ' + "${data.access_token}");
              xhr.onload = function() {
                  if (xhr.status === 200) {
                      var userInfo = JSON.parse(xhr.responseText);
                      document.getElementById("display_user").innerHTML = JSON.stringify(xhr.responseText, undefined, 2);
                  } else {
                      alert('Email not sent');
                  }
              };
              console.log("test")
              xhr.send();
          }
          function newRefresh() {
              var xhr = new XMLHttpRequest();
              xhr.open('POST', 'http://localhost:8080/token');
              xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
              xhr.setRequestHeader("Authorization", "Basic " + btoa("ABCgWwsfyRQ0XRAE:ABCTTM28ulASJAqoS9PkHVMh73fnx7sX"));
              xhr.onload = function() {
                  if (xhr.status === 200) {
                      var userInfo = JSON.parse(xhr.responseText);
                      document.getElementById("display_user").innerHTML = JSON.stringify(xhr.responseText, undefined, 2);
                      console.log(userInfo);
                      refresh = userInfo.refresh_token;
                  } else {
                      alert('Refresh error');
                  }
              };
              console.log('refresh_token=' + refresh + '&scope=' + scopes + '&redirect_uri=' + urlEncode + '&client_id=ABCgWwsfyRQ0XRAE&grant_type=refresh_token')
              xhr.send('refresh_token=' + refresh + '&scope=' + scopes + '&redirect_uri=' + urlEncode + '&client_id=ABCgWwsfyRQ0XRAE&grant_type=refresh_token');
          }
          </script>
          <form id="op.logoutForm" method="post" action="http://localhost:8080/session/end">
          <input type="hidden" name="id_token_hint" value="${data.id_token}"/>
          <input type="hidden" name="post_logout_redirect_uri" value="http://localhost:4000/logout"/>
          <input type="submit" name="logout" id="logout" value="Log out"/></form>
          <button id="calculate" type="button" onclick="setValues()">Calculate</button><br>
          <button id="refresh" type="button" onclick="newRefresh()">Refresh</button><br>
          <div id="display_user">
          </div>
          </html>`
          ctx.type = 'html';
          ctx.body = form;
      /*let tokenRes = request.post('http://localhost:8080/token', {
          form: {
              grant_type: 'authorization_code',
              code: ctx.request.query.code,
              redirect_uri: 'http://localhost:4000/authentified'
          },
          auth: {
              sendImmediately: true,
              user: 'ABCgWwsfyRQ0XRAE',
              pass: 'ABCTTM28ulASJAqoS9PkHVMh73fnx7sX',
          }
      }, function (error, response, body) {
          console.log(error);
          //console.log(response);
          console.log('********** test ************');
          console.log(body);
          console.log(body.id_token);
          let data = JSON.parse(body);
          console.log(data.id_token);
          const keys = Object.keys(body);
      });*/
  } else {
    ctx.type = 'json';
    ctx.body(new_body);
  }
});

router.get('/redirect', async function (ctx, next) {
  console.log('redirecting');
  const redirectURL = encodeURIComponent(REDIRECT_URL);
  const scope = encodeURIComponent("openid email");
  const state = base64EncodeURL(['pathname', 'search', 'hash'].filter(Boolean).join(''));
  //const codeVerifier = nanoid(64);
  const codeChallenge = await getCodeChallenge(codeVerifier);
  ctx.redirect(`http://localhost:8080/auth?client_id=${CLIENT_ID}&scope=${scope}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}&redirect_uri=${redirectURL}`)
});

router.post('/authentified', async function (ctx, next) {
  let new_body = {
    params: ctx.request.params,
    query: ctx.request.query,
    body: ctx.request.body
  };
  console.log('new body', new_body);
  ctx.status = 201;
})

app.use(router.routes());

app.listen(API_PORT, () => {
  console.log(`App listening on ${API_PORT}`)
});