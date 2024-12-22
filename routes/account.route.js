// Import các thư viện cần thiết
import express from 'express'; // Express framework để xây dựng server
import bcrypt from 'bcryptjs'; // Thư viện mã hóa và so sánh mật khẩu
import moment from 'moment'; // Thư viện xử lý và định dạng ngày tháng

// Import dịch vụ người dùng để tương tác với cơ sở dữ liệu
import userService from '../services/user.service.js';

// Khởi tạo router từ express
const router = express.Router();

// Route GET cho trang đăng ký
router.get('/register', function (req, res) {
  res.render('vwAccount/register'); // Render trang đăng ký
});

// Route POST xử lý đăng ký người dùng
router.post('/register', async function (req, res) {
  // Mã hóa mật khẩu người dùng với bcrypt trước khi lưu vào DB
  const hash_password = bcrypt.hashSync(req.body.raw_password, 8);
  // Định dạng ngày sinh theo kiểu YYYY-MM-DD
  const ymd_dob = moment(req.body.raw_dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
  
  // Tạo đối tượng người dùng cần thêm vào cơ sở dữ liệu
  const entity = {
    username: req.body.username, // Tên người dùng
    password: hash_password, // Mật khẩu đã mã hóa
    name: req.body.name, // Tên người dùng
    email: req.body.email, // Email người dùng
    dob: ymd_dob, // Ngày sinh người dùng
    permission: 0,  // Quyền mặc định cho người dùng mới (0: user bình thường)
  };
  
  // Thêm người dùng vào cơ sở dữ liệu
  const ret = await userService.add(entity);
  
  // Render lại trang đăng ký
  res.render('vwAccount/register');
});

// Route GET cho trang đăng nhập
router.get('/login', function (req, res) {
  res.render('vwAccount/login'); // Render trang đăng nhập
});

// Route POST xử lý đăng nhập người dùng
router.post('/login', async function (req, res) {
  // Tìm người dùng trong cơ sở dữ liệu theo tên người dùng
  const user = await userService.findByUsername(req.body.username);
  
  // Nếu không tìm thấy người dùng, render lại trang đăng nhập và hiển thị lỗi
  if (!user) {
    return res.render('vwAccount/login', { has_errors: true });
  }

  // So sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa trong DB
  const ret = bcrypt.compareSync(req.body.password, user.password);
  if (!ret) {
    // Nếu mật khẩu sai, render lại trang đăng nhập và hiển thị lỗi
    return res.render('vwAccount/login', { has_errors: true });
  }

  // Nếu đăng nhập thành công, lưu thông tin vào session
  req.session.auth = true; // Đánh dấu là đã đăng nhập
  req.session.authUser = user; // Lưu thông tin người dùng vào session

  // Kiểm tra xem có URL cần chuyển hướng hay không, nếu không thì chuyển đến trang chủ
  const retUrl = req.session.retUrl || '/';
  req.session.retUrl = null;
  
  // Chuyển hướng đến URL cần thiết (hoặc trang chủ)
  res.redirect(retUrl); 
});

// Route kiểm tra tính khả dụng của tên người dùng
router.get('/is-available', async function (req, res) {
  // Lấy tên người dùng từ query string
  const username = req.query.username;
  
  // Tìm người dùng trong cơ sở dữ liệu
  const user = await userService.findByUsername(username);
  
  // Nếu không tìm thấy người dùng, trả về true (tên người dùng khả dụng)
  if (!user) {
    return res.json(true);
  }
  
  // Nếu tìm thấy người dùng, trả về false (tên người dùng đã được sử dụng)
  res.json(false);
});

// Import middleware xác thực người dùng đã đăng nhập
import { isAuth } from '../middlewares/auth.mdw.js';

// Route GET cho trang hồ sơ người dùng, chỉ cho phép người đã đăng nhập
router.get('/profile', isAuth, function (req, res) {
  // Render trang hồ sơ và truyền thông tin người dùng từ session
  res.render('vwAccount/profile', {
    user: req.session.authUser,
  });
});

// Route GET cho trang cập nhật mật khẩu, chỉ cho phép người đã đăng nhập
router.get('/update-password', isAuth, function (req, res) {
  res.render('vwAccount/update-password'); // Render trang cập nhật mật khẩu
});

// Route POST xử lý đăng xuất người dùng
router.post('/logout', isAuth, function (req, res) {
  // Xóa thông tin session khi người dùng đăng xuất
  req.session.auth = false; // Đánh dấu là chưa đăng nhập
  req.session.authUser = null; // Xóa thông tin người dùng
  req.session.retUrl = null; // Xóa URL cần chuyển hướng

  // Chuyển hướng về trang chủ sau khi đăng xuất
  res.redirect('/');
});

// Export router để sử dụng trong các phần khác của ứng dụng
export default router;
