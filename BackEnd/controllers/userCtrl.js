const usersSchema = require('../modelsAllSchema/usersModel')
const Payments = require('../modelsAllSchema/paymentModel')
const bcrypt = require('bcrypt') // Users 密碼加密(防止盜用入侵)
const jwt = require('jsonwebtoken') //Users 驗證密碼


const userCtrl = {
    //註冊(用戶註冊申請內容) 用async非同步處理 (設定請求body + 發出請求時 把body 內容 放到usersSchema(MongoDB))
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body; //發出請求框架身體{ name, email, password } 必須等於usersSchema的值

            const user = await usersSchema.findOne({ email })
            if (user) return res.status(400).json({ msg: "The email already exists." })

            if (password.length < 6)
                return res.status(400).json({ msg: "Password is at least 6 characters long." })

            // Password Encryption(bcrypt密碼加密)(使用bcrypt來加密密碼，最終以bcrypt hash的形式儲存到系統中)
            const passwordHash = await bcrypt.hash(password, 10)//整數型態，數值越高越安全
            //設定好bcrypt密碼加密 後 新增建構函數new usersSchema 把前面的設定寫進物件包住(測試結果包含role、cart)
            const newUser = new usersSchema({ ////new usersSchema =1.const usersSchema 2.等於register: async 裡的東西//
                name, email, password: passwordHash
            })


            // Save MongoDB 把newUsersSchema儲存到MongoDB
            await newUser.save() //1.一定要用save()才能把newUsersSchema的資料儲存到MongoDB 2.成功則res回復Json ({msg:succeed})

            // Then create jsonwebtoken to authentication
            const accesstoken = createAccessToken({ id: newUser._id })
            const refreshtoken = createRefreshToken({ id: newUser._id })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            })

            res.json({ accesstoken })

        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //拿到所有註冊名單
    getrRgister: async (req, res) => {
        try {
            const collectRgister = await usersSchema.find() //找到mongoose.model("users",usersSchema)
            res.json(collectRgister) // GET 成功 則 res[]
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    //登入: 用register_POST 的資料，做到成功LogoIn的結果(所以登入時，要用註冊的資料登入)
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await usersSchema.findOne({ email }) //email = register.usersSchema.email
            if (!user) return res.status(400).json({ msg: "User does not exist." })

            //把req.password 跟user.password(usersSchema_MongoDB) 進行密碼比對是否一樣??
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({ msg: "Incorrect password." })//password = req.body 比對 註冊後user.password(存在mongoBD)

            // If login success , create access token and refresh token
            //把Cookies搬到Login裡面(原因:當第一次登入成功時，Cookies 會緩存(cache)jwt起來， 後面再次登入時，cookie只要給jwt即可，伺服器就會進行驗證，若驗證成功，用戶就會再次登入成功)
            const accesstoken = createAccessToken({ id: user._id })
            const refreshtoken = createRefreshToken({ id: user._id })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            })

            res.json({ accesstoken })

        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/user/refresh_token' })
            return res.json({ msg: "Logged out" })
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    // 設定 res 給 cookies並且mongoDB 的creatJasonWebToken_user:id 等於createrefresh_cookie的id//
    refreshToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token) return res.status(400).json({ msg: "Please Login or Register" })

            //驗證 JWT:透過verify()方法可以完成 Base64 解碼與 Token 的驗證，並回傳解碼後的 Payload — 驗證時需要帶入欲驗證的token與自訂的密鑰：//
            //jwt.verify(token, secretOrPublicKey, [options, callback])//
            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(400).json({ msg: "Please Login or Register" })

                const accesstoken = createAccessToken({ id: user.id })

                res.json({ accesstoken })
            })

        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }

    },
    getUser: async (req, res) => {
        try {
            const user = await usersSchema.findById(req.user.id).select('-password')
            if (!user) return res.status(400).json({ msg: "User does not exist." })

            res.json(user)
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    addCart: async (req, res) => {
        try {
            const user = await usersSchema.findById(req.user.id)
            if (!user) return res.status(400).json({ msg: "User does not exist." })

            await usersSchema.findOneAndUpdate({ _id: req.user.id }, {
                cart: req.body.cart
            })

            return res.json({ msg: "Added to cart" })
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    history: async (req, res) => {
        try {
            const history = await Payments.find({ user_id: req.user.id })

            res.json(history)
        }
        catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }



}

//把newUsersSchema._id 值 換成env.
const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '11m' }) //expiresIn\" 是表示時間跨度的秒數或字符串，例如：\"1d\"、\"20h\"、60"
}
const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }) //expiresIn\" 是表示時間跨度的秒數或字符串，例如：\"1d\"、\"20h\"、60"
}

module.exports = userCtrl
