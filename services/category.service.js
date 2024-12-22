import db from '../utils/db.js';

export default {
  findAll() {
    // return [
    //   { category_id: 1, CatName: 'Danh mục 1' },
    //   { category_id: 2, CatName: 'Danh mục 2' },
    //   { category_id: 3, CatName: 'Danh mục 3' },
    // ];

    return db('categories');
  },

  findAllWithDetails() {
    return db('categories as c')
      .leftJoin('articles as p', 'c.category_id', 'p.category_id')
      .select('c.category_id', 'c.category_name', db.raw('count(p.id) as ProductCount'))
      .groupBy('c.category_id', 'c.category_name');
  },

  findById(id) {
    return db('categories').where('category_id', id).first();
  },

  add(entity) {
    return db('categories').insert(entity);
  },

  del(id) {
    return db('categories').where('category_id', id).del();
  },

  patch(id, entity) {
    return db('categories').where('category_id', id).update(entity);
  }
}