const categorySchema = require('../modelsAllSchema/categoryModel')
//const Products = require('../models/productModel')//


const categoryCtrl = {
    //帶入categorySchema
    getCategories: async (req, res) => {
        //res.json('Category test') //測試http://localhost:5000/api/category 是否連線成功
        try {
            const categories = await categorySchema.find() //連線後，MongoDBN 有新的 categorySchema框架
            res.json(categories)
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //新增項目進入到categorySchema 
    createCategory: async (req, res) => {
        try {
            // if user have role = 1 ---> admin (手動user role=1)
            // only admin can create , delete and update category
            const { name } = req.body;
            const category = await categorySchema.findOne({ name })
            if (category) return res.status(400).json({ msg: "This category already exists." })

            const newCategory = new categorySchema({ name })
            await newCategory.save()
            res.json({ msg: "Succeed Create Catogoy" })
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //刪除已新增到categorySchema 其中一品項
    deleteCategory: async (req, res) => {
        try {
            await categorySchema.findByIdAndDelete(req.params.id)
            res.json({ msg: "Deleted a Category" })
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //更新categorySchema 裡的name EX:name:user036 更新後 name:user036-updata
    updateCategory: async (req, res) => {
        try {
            const { name } = req.body;
            await categorySchema.findOneAndUpdate({ _id: req.params.id }, { name })
            res.json({ msg: "Updated a category" })
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }

}


module.exports = categoryCtrl