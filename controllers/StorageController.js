// import multer from "multer"
// const storage = multer.diskStorage({
//   destination: (_, __, callback) => {
//     callback(null, "uploads")
//   },
//   filename: (_, file, callback) => {
//     callback(null, file.originalname)
//   },
// })
// const upload = multer({ storage })

// router.use("/uploads", express.static("uploads"))

// export default uploadImage = upload.single("file"), (req, res) => {
//    try {
//      res.status(200).json({
//        status: "success",
//        url: `/uploads/${req.file.originalname}`,
//        // todo
//        // url: `/admin/${req.file.originalname}`,
//      })
//    } catch (err) {
//      console.log(err)
//      res.status(400).json({ status: "fail", message: "Файл должен быть формата image" })
//    }
//  })

// }