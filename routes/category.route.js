import express from 'express';
import categoryService from '../services/category.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  // categoryService.findAll().then(function (rows) {
  //   // console.log(rows);
  //   // res.end();
  //   res.render('vwCategory/list', {
  //     categories: rows
  //   });
  // });
  // console.log('first');

  const list = await categoryService.findAll();
  res.render('vwCategory/list', {
    categories: list
  });
});

router.get('/add', function (req, res) {
  res.render('vwCategory/add');
});

router.post('/add', async function (req, res) {
  // console.log(req.body);
  const category = {
    category_name: req.body.category_name,
  };
  const ret = await categoryService.add(category);
  console.log(ret);
  res.render('vwCategory/add');
});

// url: .../edit?id=1
router.get('/edit', async function (req, res) {
  const id = +req.query.id || 0;
  const data = await categoryService.findById(id);
  if (!data) {
    return res.redirect('/admin/categories');
  }

  res.render('vwCategory/edit', {
    category: data
  });
});

router.post('/del', async function (req, res) {
  await categoryService.del(req.body.category_id);
  res.redirect('/admin/categories');
});

router.post('/patch', async function (req, res) {
  const id = req.body.category_id;
  const changes = {
    category_name: req.body.category_name,
  }
  await categoryService.patch(id, changes);
  res.redirect(`/admin/categories/edit?id=${id}`);
});

export default router;