const router = require('express').Router()
const cloudinary = require('cloudinary')
const authorize = require('../middleware/authorize')
const authAdministrate = require('../middleware/authAdministrate')
const fs = require('fs') //非同步讀取檔案


// upload image on cloudinary(去抓cloud 儲存在.env 資料)
cloudinary.config(
    {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    }
)

// Upload image only admin can use
router.post('/upload', authorize, authAdministrate, (req, res) => {
    try {
        console.log(req.files)
        //如果沒有要求選擇File(!req.files) ，則回應No files were uploaded
        if (!req.files || Object.keys(req.files).length === 0)
            return res.status(400).json({ msg: 'No files were uploaded.' })
        //res.json({ msg: 'test upload' }) //回應有上傳成功~

        //設定資料夾內 圖片尺寸大小
        const file = req.files.file;
        if (file.size > 1024 * 1024) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({ msg: "Size too large" })
        }
        //設定資料夾內 上傳圖片格式(檔名:jpg 、png) 才可以上傳
        if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            removeTmp(file.tempFilePath)
            return res.status(400).json({ msg: "File format is incorrect." })
        }
        //測試上傳到cloudinary平台上，是否上傳成功?? 若成功會新增資料夾名稱:test(包含上傳檔案)
        cloudinary.v2.uploader.upload(file.tempFilePath, { folder: "test" }, async (err, result) => {
            if (err) throw err;
            //1.res.json({ result })結果上傳
            //2.結果上部分上傳
            removeTmp(file.tempFilePath)
            res.json({ public_id: result.public_id, url: result.secure_url })
        })


    }
    catch (err) {
        return res.status(500).json({ msg: err.message })
    }
})

// Delete image only admin can use
router.post('/destroy', authorize, authAdministrate, (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id) return res.status(400).json({ msg: 'No images Selected' })

        cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
            if (err) throw err;

            res.json({ msg: "Deleted Image" })
        })

    }
    catch (err) {
        return res.status(500).json({ msg: err.message })
    }

})


//從文件系統中刪除文件(fs.unlink)
const removeTmp = (path) => {
    fs.unlink(path, err => {
        if (err) throw err;
    })
}

module.exports = router