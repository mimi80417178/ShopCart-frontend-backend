const express = require("express")
const router = express.Router()
const productCtrl = require('../controllers/productCtrl')
const authorize = require('../middleware/authorize')
const authAdministrate = require('../middleware/authAdministrate')

router.get("/products", productCtrl.getProduct)
router.get("/products/:id", productCtrl.getProductId)
router.post("/products", authorize, authAdministrate, productCtrl.createProduct)
router.delete("/products/:id", authorize, authAdministrate, productCtrl.deleteProduct)
router.put("/products/:id", authorize, authAdministrate, productCtrl.updateProduct) // 更新


module.exports = router