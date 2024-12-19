import express from 'express';
import articleService from '../service/article.service.js';

const router = express.Router();

// Route: Hiển thị danh sách bài viết với phân trang
router.get('/', async (req, res) => {
  try {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const articles = await articleService.findPage(limit, offset); // Lấy bài viết với phân trang
    const nRows = await articleService.countAll(); // Đếm tổng số bài viết
    const nPages = Math.ceil(nRows.total / limit); // Tính tổng số trang
    const page_items = [];
    for (let i = 1; i <= nPages; i++) {
      const item = {
        value: i,
        isActive: i === page
      };
      page_items.push(item);
    }

    res.render('articles/list', {
      articles: articles,
      empty: articles.length === 0,
      page_items: page_items,
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi lấy danh sách bài viết');
  }
});

// Route: Hiển thị chi tiết bài viết
router.get('/detail', async (req, res) => {
  const id = parseInt(req.query.id) || 0;
  const article = await articleService.findById(id); // Lấy chi tiết bài viết theo ID
  if (!article) {
    return res.status(404).send('Bài viết không tồn tại');
  }
  res.render('articles/detail', { article: article });
});

export default router;
