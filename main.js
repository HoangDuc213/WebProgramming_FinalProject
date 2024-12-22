// Import các module cần thiết
import express from 'express';  // Framework Express.js để xây dựng ứng dụng web
import { engine } from 'express-handlebars';  // Tạo engine view Handlebars cho Express
import hbs_section from 'express-handlebars-sections';  // Quản lý các section trong Handlebars
import session from 'express-session';  // Quản lý session người dùng
import numeral from 'numeral';  // Dùng để định dạng số (ví dụ: định dạng tiền tệ)

// Các module hỗ trợ từ Node.js
import { dirname } from 'path';  // Thư viện giúp xử lý đường dẫn
import { fileURLToPath } from 'url';  // Chuyển đổi URL thành đường dẫn hệ thống

// Import các router và dịch vụ
import categoryRouter from './routes/category.route.js';  // Router cho danh mục
import productRouter from './routes/product.route.js';  // Router cho sản phẩm
import productUserRouter from './routes/product-user.route.js';  // Router cho sản phẩm cho người dùng
import accountRouter from './routes/account.route.js';  // Router cho tài khoản người dùng

import categoryService from './services/category.service.js';  // Dịch vụ xử lý dữ liệu danh mục

// Khởi tạo ứng dụng Express
const app = express();

// Cấu hình để ứng dụng tin tưởng proxy đầu tiên, điều này có thể cần thiết khi chạy ứng dụng phía sau proxy
app.set('trust proxy', 1);

// Cấu hình session, lưu trữ thông tin người dùng trong suốt phiên làm việc
app.use(session({
  secret: 'SECRET_KEY',  // Chìa khóa bảo mật cho session
  resave: false,  // Không lưu lại session khi không có thay đổi
  saveUninitialized: true,  // Lưu session ngay cả khi chưa có dữ liệu
  cookie: {}  // Cấu hình cookie (không có thay đổi thêm)
}));

// Middleware để phân tích dữ liệu được gửi từ form (URL encoded)
app.use(express.urlencoded({
  extended: true
}));

// Cấu hình engine Handlebars cho Express
app.engine('hbs', engine({
  extname: 'hbs',  // Định dạng tệp là .hbs
  helpers: {
    // Helper để định dạng số thành tiền VND
    format_number(value) {
      return numeral(value).format('0,0') + ' vnd';
    },
    // Helper để sử dụng section trong Handlebars
    section: hbs_section(),
  }
}));

// Đặt Handlebars làm view engine cho ứng dụng
app.set('view engine', 'hbs');
// Đặt thư mục chứa các view
app.set('views', './views');

// Cấu hình để phục vụ các tệp tĩnh (từ thư mục static)
app.use('/static', express.static('static'));

// Middleware 1: Lấy danh sách các danh mục từ dịch vụ và lưu vào locals để sử dụng trong các view
app.use(async function (req, res, next) {
  const categories = await categoryService.findAllWithDetails();
  res.locals.lcCategories = categories;  // Lưu vào res.locals để có thể truy cập trong các view
  next();
});

// Middleware 2: Xử lý session người dùng, nếu chưa xác định thì gán mặc định
app.use(async function (req, res, next) {
  if (req.session.auth === undefined) {
    req.session.auth = false;  // Đặt session.auth mặc định là false nếu chưa được xác định
  }

  res.locals.auth = req.session.auth;  // Lưu thông tin xác thực vào locals để sử dụng trong view
  res.locals.authUser = req.session.authUser;  // Lưu thông tin người dùng đã đăng nhập
  next();
});

// Route xử lý trang chủ
app.get('/', function (req, res) {
  // Tạo một số ngẫu nhiên để hiển thị trên trang chủ
  const randomNumber = Math.floor(Math.random() * 100);
  res.render('home', {
    randomNumber: randomNumber,  // Truyền số ngẫu nhiên vào view
  });
});

// Route xử lý trang "Giới thiệu"
app.get('/about', function (req, res) {
  res.render('about');
});

// Đoạn này chuyển đổi từ URL sang đường dẫn hệ thống để có thể sử dụng __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Route để gửi tệp HTML thử nghiệm
app.get('/test', function (req, res) {
  res.sendFile(__dirname + '/test.html');
});

// Cấu hình các router cho các route liên quan đến tài khoản và sản phẩm
app.use('/account', accountRouter);
app.use('/articles', productUserRouter);

// Các middleware bảo mật, kiểm tra quyền truy cập của người dùng
import { isAuth, isAdmin } from './middlewares/auth.mdw.js';
app.use('/admin/categories', isAuth, isAdmin, categoryRouter);  // Dành cho admin
app.use('/admin/articles', isAuth, isAdmin, productRouter);  // Dành cho admin

// Khởi động ứng dụng Express trên cổng 3000
app.listen(3000, function () {
  console.log('Server started on http://localhost:3000');
});
