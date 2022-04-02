const router = require('express').Router()
const userCtrl = require('../controllers/userCtrl')
const authorize = require('../middleware/authorize')

router.post("/register", userCtrl.register) // 用方法:post 新增一筆 資料(資料內容:userCtrl.register)
router.get("/register", userCtrl.getrRgister) // 拿到所有註冊名單
router.post("/login", userCtrl.login) //拿register 資料去登入
router.get("/logout", userCtrl.logout) //登出
router.get("/refresh_token", userCtrl.refreshToken) // Log in的Post資料後。用方法get (放到cookie)保存到client端)

router.get('/infor', authorize, userCtrl.getUser)
router.patch('/addcart', authorize, userCtrl.addCart)
router.get('/history', authorize, userCtrl.history)

module.exports = router