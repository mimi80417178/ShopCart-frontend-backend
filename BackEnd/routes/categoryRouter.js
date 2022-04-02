const express = require("express")
const router = express.Router()
const categoryCtrl = require('../controllers/categoryCtrl')
const authorize = require('../middleware/authorize')
const authAdministrate = require('../middleware/authAdministrate')

router.route('/category')
    .get(categoryCtrl.getCategories)
    .post(authorize, authAdministrate, categoryCtrl.createCategory)


router.route('/category/:id')
    .delete(authorize, authAdministrate, categoryCtrl.deleteCategory) //刪除category 裡 admin 帳號
    .put(authorize, authAdministrate, categoryCtrl.updateCategory) //更新category的項目名稱:EX:name



module.exports = router





