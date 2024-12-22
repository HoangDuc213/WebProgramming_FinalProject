import db from '../utils/db.js';

export default {
  findAll() {
    return db('articles');
  },

  findById(id) {
    return db('articles').where('id', id).first();
  },

  findByCatId(catId) {
    return db('articles').where('category_id', catId);
  },

  findPageByCatId(catId, limit, offset) {
    return db('articles').where('category_id', catId).limit(limit).offset(offset);
  },

  countByCatId(catId) {
    return db('articles').where('category_id', catId).count('* as number_of_products').first();
  }
}