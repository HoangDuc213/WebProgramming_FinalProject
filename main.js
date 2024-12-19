import express from 'express';
import { engine } from 'express-handlebars';
import numeral from 'numeral';
import session from 'express-session';

const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'SECRET_KEY',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}))

app.use(express.urlencoded({
  extended: true
}));

import hbs_section from 'express-handlebars-sections';
app.engine('hbs', engine({
  extname: 'hbs',
  helpers: {
    format_number(value) {
      return numeral(value).format('0,0') + ' vnd';
    },
    fillHtmlContent: hbs_section()
  }
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/static', express.static('static'));

app.get('/', function (req, res) {
  res.render('main', {
  layout: 'main',
  });
});
app.use('/articles', articlesRouter);
import articlesRouter from './routes/articles.route.js';
app.listen(3000, function () {
  console.log('Server started on http://localhost:3000');
});
