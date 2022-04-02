const ProductsSchema = require('../modelsAllSchema/productModel')

const productCtrl = {
    getProduct: async (req, res) => {
        try {
            //res.json("getProduct test~~")
            const products = await ProductsSchema.find() //找到mongoose.model("Products",productSchema)
            res.json(products) // GET 成功 則 res[]
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //找getProduct  Id值
    getProductId: async (req, res) => {
        try {
            const productID = await ProductsSchema.findById(req.params.id)
            res.json(productID)
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //用POST 新增 資料到 MongoDB 資料裡
    createProduct: async (req, res) => {
        try {
            const { product_id, title, price, description, content, images, category } = req.body
            if (!images) return res.status(400).json({ msg: "no images upload" })

            const product = await ProductsSchema.findOne({ product_id })
            if (product) return res.status(400).json({ msg: "This product is already exist" })

            const newProductsSchema = new ProductsSchema({
                product_id, title: title.toLowerCase(), price, description, content, images, category
            })

            await newProductsSchema.save()//一定要save到newProductsSchema(MongoDB)裡，不然資料庫 沒有新增項目紀錄
            //1.請求:req.body資料 並用POST 送出一筆資料，
            //2.若成功resmsg: "Created a product" 
            //3.會在 mongoDB(new ProductsSchema)裡 新增一筆資料
            res.json({ msg: "Created a product" })

        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //用Delete 刪除已新增的資料庫
    deleteProduct: async (req, res) => {
        try {
            await ProductsSchema.findByIdAndDelete(req.params.id)
            res.json("Succeed to delete one of item")
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //用Put更新 已發出的POST
    updateProduct: async (req, res) => {
        try {
            const { title, price, description, content, images, category } = req.body;
            //如果再發請求時，Image沒(附加圖片檔案) 則會回復"No image upload"
            if (!images) return res.status(400).json({ msg: "No image upload" })

            //如果請求成功。則會1.回覆msg: "Updated a Product" 2.ProductsSchema(MongoDB)也會連線修改
            await ProductsSchema.findOneAndUpdate({ _id: req.params.id }, {
                //product_id 不可以修改，以下從title 開始可修改 (http://localhost:5000/api/products/6224f4d59961193ec2786a51)
                title: title.toLowerCase(), price, description, content, images, category
            })
            res.json({ msg: "Updated a Product" })
        }
        catch (err) {
            // (500)有錯則回覆 try上面(400) 的錯誤字串
            return res.status(500).json({ msg: err.message })
        }
    },

}
module.exports = productCtrl
