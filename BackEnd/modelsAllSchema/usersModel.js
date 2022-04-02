const mongoose = require('mongoose')  //1. 設定mongoose函數庫
const usersSchema = new mongoose.Schema({ //2. 新建Schema(框架)寫入項目物件，以利儲存到MongoDB 資料庫 
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0
    },
    cart: {
        type: Array,
        default: []
    }
},
    {
        timestamps: true //創建文檔時自動生成createAt和updateAt兩個字段，值都為系統當前時間
    }
)

module.exports = mongoose.model("users", usersSchema) //1."users" 是MongoDB資料庫Schema名稱 2.usersSchema => mongoose.Schema裡的新增項目