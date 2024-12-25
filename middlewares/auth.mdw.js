export function isAuth(requiredPermission) {
  return (req, res, next) => {
    if (!req.session.authUser) {
      return res.status(403).send('Bạn cần đăng nhập để thực hiện thao tác này.');
    }
    if (req.session.authUser.permission < requiredPermission) {
      return res.status(403).send('Bạn không có quyền truy cập.');
    }
    next();
  };
}