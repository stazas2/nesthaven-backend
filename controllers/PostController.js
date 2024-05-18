////////////////////////////////////////////////////////////////!
import PostModel from '../models/Post.js'

export const getAll = async (req, res) => {
   try {
      const posts = await PostModel.find().populate('user', "fullName avatarUrl").exec()

      res.json(posts)
   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'Не удалось получить статьи',
      })
   }
}

export const getOne = async (req, res) => {
   try {
      const postId = req.params.id

      const post = await PostModel.findByIdAndUpdate(
         { _id: postId },
         { $inc: { viewsCount: 1 } },
         { returnDocument: 'after' }
      )
         .populate('user')
         .exec()

      if (!post) {
         return res.status(404).json({
            message: 'Статья не найдена',
         })
      }

      res.json(post)
   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'Не удалось получить статью',
      })
   }
}

export const remove = async (req, res) => {
   try {
      const postId = req.params.id
      const post = await PostModel.findByIdAndDelete({ _id: postId })
         .populate('user')
         .exec()

      if (!post) {
         return res.status(404).json({
            message: 'Статья не найдена',
         })
      }

      res.json(post)
   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'Не удалось удалить статью',
      })
   }
}

export const create = async (req, res) => {
   try {
      const { title, text, tags, imagesUrl } = req.body
      const doc = new PostModel({
         title,
         text,
         tags,
         imagesUrl,
         user: req.userId,
      })

      const post = await doc.save()
      res.json(post)
   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'Не удалось создать статью',
      })
   }
}

export const update = async (req, res) => {
   try {
      const postId = req.params.id
      const { title, text, tags, imagesUrl } = req.body

      const post = await PostModel.findByIdAndUpdate(
         { _id: postId },
         {
            title,
            text,
            tags,
            imagesUrl,
            user: req.userId,
         }
      )
         .populate('user')
         .exec()

      if (!post) {
         return res.status(404).json({
            message: 'Статья не найдена',
         })
      }

      res.json(post)
   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'Не удалось обновить статью',
      })
   }
}
