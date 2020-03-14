const Koa = require('koa');
const staticFiles = require('koa-static');

const app = new Koa();
app.use(staticFiles('./docs/.vuepress/dist'), {
  maxage: 30 * 24 * 60 * 60 * 1000,
});

app.listen(4002, () => {
  console.log('start at port 4002');
});
