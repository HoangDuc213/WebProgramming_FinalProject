import knex from '../utils/db.js'; // Kết nối cơ sở dữ liệu qua Knex

// Lấy tất cả bài viết
const findAll = async () => {
  try {
    const rows = await knex('articles')
      .join('categories', 'articles.category_id', '=', 'categories.id')
      .select(
        'articles.id',
        'articles.title',
        'articles.author',
        'articles.abstract',
        'articles.content',
        'articles.is_premium',
        'categories.category_name'
      );
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi lấy danh sách bài viết');
  }
};

// Đếm tổng số bài viết
const countAll = async () => {
  try {
    const result = await knex('articles').count('* as total');
    return result[0]; // Trả về tổng số bài viết
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi đếm số bài viết');
  }
};

// Lấy bài viết theo ID
const findById = async (articleId) => {
  try {
    const row = await knex('articles')
      .join('categories', 'articles.category_id', '=', 'categories.id')
      .select(
        'articles.id',
        'articles.title',
        'articles.author',
        'articles.abstract',
        'articles.content',
        'articles.is_premium',
        'categories.category_name'
      )
      .where('articles.id', articleId)
      .first(); // Lấy một bài viết duy nhất
    return row;
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi lấy chi tiết bài viết');
  }
};

// Lấy danh sách bài viết với phân trang
const findPage = async (limit, offset) => {
  try {
    const rows = await knex('articles')
      .join('categories', 'articles.category_id', '=', 'categories.id')
      .select(
        'articles.id',
        'articles.title',
        'articles.author',
        'articles.abstract',
        'articles.content',
        'articles.is_premium',
        'categories.category_name'
      )
      .limit(limit)
      .offset(offset);
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi lấy bài viết phân trang');
  }
};

export default {
  findAll,
  countAll,
  findById,
  findPage
};
