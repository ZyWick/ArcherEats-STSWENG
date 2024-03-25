import express from 'express';
import { ObjectId } from "mongodb"

const contentRouter = express.Router();

import multer from 'multer';
const __dirname = dirname(fileURLToPath(import.meta.url)); // directory URL
import fs from 'fs';
import { dirname, relative } from "path";
import { fileURLToPath } from 'url';
const db = getDb();
import { getDb } from '../model/conn.js';
import { checkUser, checkValidUser } from '../middleware/checkUser.js'

const users_db = db.collection("users");
const reviews_db = db.collection("reviews");
const comments_db = db.collection("comments");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/reviewPics/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname)
  },
})
const upload = multer({ storage: storage })

const postReview = async (req, res) => {
    const { estabID, title, rate, content } = req.body;
    let userID = req.userID;
    
    let imageURls = []
    let videoUrls = []
    for (let files of req.files) {
      let type = files.mimetype;
      if (type.split('/')[0] == "image")
        imageURls.push("/static/assets/reviewPics/" + files.filename)
      else
        videoUrls.push("/static/assets/reviewPics/" + files.filename)
    }
    
  if (title && rate && content) {
      let theUSER = await users_db.findOne({_id : new ObjectId(userID)});
      const newReview = {
        title: title,
        rating: rate,
        content: content,
        likes: [],
        dislikes: [],
        edited: false,
        images: imageURls,
        videos: videoUrls,
        datePosted: new Date(),
        estabResponse: null,
        establishmentId: new ObjectId(estabID),
        userId: new ObjectId(userID),
      };
      try {
      let resp = await reviews_db.insertOne(newReview);
      console.log(resp) 
      } catch (err) {
        console.log("Error occurred:", err);
        res.sendStatus(500)
      }
      res.status(200).send({review: newReview, user: theUSER,})
    } else {
      res.sendStatus(400);
    }
  }

  const patchReview = async (req, res) => {
    const { title, rate, content, reviewID } = req.body;
    let userID = req.userID;

    let imageURls = []
    let videoUrls = []
    for (let files of req.files) {
      let type = files.mimetype;
      if (type.split('/')[0] == "image")
        imageURls.push("/static/assets/reviewPics/" + files.filename)
      else
        videoUrls.push("/static/assets/reviewPics/" + files.filename)
    }
    let review = await reviews_db.findOne({
      _id: new ObjectId(reviewID)});

    if (review != null) {
      for (let img of review.images)
        fs.unlink(__dirname + "../../../public" + img.substring(7), (err) => {
          if (err) console.error('Error deleting file:', err);
        })
      for (let vid of review.videos)
        fs.unlink(__dirname + "../../../public" + vid.substring(7), (err) => {
          if (err) console.error('Error deleting file:', err);
        })
    }

   if (title && rate && content) {
    let theUSER = await users_db.findOne({_id : new ObjectId(userID)});

    try {
    let resp = await reviews_db.updateOne(
      {
        _id: new ObjectId(reviewID)
      },
      {
        $set: {
          title: title,
          rating: rate,
          content: content,
          edited: true,
          images: imageURls,
          videos: videoUrls,
        }
      })
    console.log(resp)
  } catch (err) {
    console.log("Error occurred:", err);
    res.sendStatus(500)
  }
    res.status(200)
    res.send({title: title,
              content: content,
              rating: rate,
              images: imageURls,
              videos: videoUrls,
      user: theUSER,
})} else {
  res.sendStatus(400);
}
}

const deleteReview = async (req, res) => {
  let { reviewId } = req.body

  if (reviewId) {
  let __iod = new ObjectId(reviewId);
  let review = await reviews_db.findOne({ _id: __iod });

  if (review != null) {
    for (let img of review.images)
      fs.unlink(__dirname + "../../../public" + img.substring(7), (err) => {
        if (err) console.error('Error deleting file:', err);
      })
    for (let vid of review.videos)
      fs.unlink(__dirname + "../../../public" + vid.substring(7), (err) => {
        if (err) console.error('Error deleting file:', err);
      })
  }

  try {
  let resp = await reviews_db.deleteOne({ _id: __iod })
  console.log(resp)
} catch (err) {
  console.log("Error occurred:", err);
  res.sendStatus(500)
}
  res.status(200)
  res.send("review Deleted")
  } else {
    res.sendStatus(400);
  }
}

const toggleLikes = async (req, res) => {
  let userID = req.userID;

    let { reviewId, updateH } = req.body;
    let __iod = new ObjectId(reviewId);

    const x = await reviews_db.findOne({ _id: __iod });

    let usedDb;

    if (x) {
      usedDb = reviews_db;
    } else {
      usedDb = comments_db;
    }
    let xsa =await usedDb.findOne({ _id: __iod });
    let resp
  switch (updateH) {
    case "up":
      if(xsa.likes.includes(userID) == false)
      resp = await usedDb.updateOne(
        { _id: __iod },
        {
          $push: { likes: userID },
          $pull: { dislikes: userID },
        }); break;
    case "up_":
      resp = await usedDb.updateOne(
        { _id: __iod },
        {
          $pull: { likes: userID },
        }); break;
    case "down":
      if(xsa.dislikes.includes(userID) == false)
      resp = await usedDb.updateOne(
        { _id: __iod },
        {
          $pull: { likes: userID },
          $push: { dislikes: userID },
        }); break;
    case "down_":
      resp = await usedDb.updateOne(
        { _id: __iod },
        {
          $pull: { dislikes: userID },
        }); break;
  }
  console.log(resp)
  res.status(200)
  res.send("done")
}

const postComment = async (req, res) => {
  let { revID, parID, text } = req.body;
  let userID = req.userID;

  let par_id = null
  if (parID != "null")
    par_id = new ObjectId(parID)
  if (revID == "null") {
    let parComment = await comments_db.findOne({ _id: new ObjectId(par_id) })
    revID = parComment.reviewId
  }

  if (revID && userID && text) {
    let theUSER = await users_db.findOne({_id : new ObjectId(userID)});
    const newComment = {
      content: text,
      likes: [],
      dislikes: [],
      comments: [],
      datePosted: new Date(),
      userId: new ObjectId(userID),
      parent: par_id,
      reviewId: new ObjectId(revID),
      edited: false,
    };
    try {
    let resp = await comments_db.insertOne(newComment);
    console.log(resp)
  } catch (err) {
    console.log("Error occurred:", err);
    res.sendStatus(500)
  }
    res.status(200);
    res.send({content: newComment.content,
      _id: newComment._id,
      user: theUSER,
})
  } else {
    res.sendStatus(400);
  }
}

const patchComment = async (req, res) => {
  const { commID, text } = req.body;
  let userID = req.userID;

  if (commID && text) {
  try {
    let resp = await comments_db.updateOne(
      { _id: new ObjectId(commID) },
      {
        $set: {
          content: text,
          edited: true
        }
      })
    console.log(resp)
  } catch (err) {
    console.log("Error occurred:", err);
    res.sendStatus(500)
  }
  res.status(200);
  res.send("esited comment")
}else {
  res.sendStatus(400);
}}

const deleteComment = async (req, res) => {
  const { commID } = req.body;
  try {
    const resp = await comments_db.deleteOne({ _id: new ObjectId(commID) })
    console.log(resp);
  } catch (err) {
    console.log("Error occurred:", err);
    res.sendStatus(500)
  }
  res.status(200);
  res.send("deleted comment")
}

const postEstabRespo = async (req, res) => {
  const { revID, text } = req.body;

  if (revID && text) {
    const newEstabRespo = {
      content: text,
      likes: [],
      dislikes: [],
      comments: [],
      edited: false,
      datePosted: new Date()
    };
    try {
    let resp = await reviews_db.updateOne(
      { _id: new ObjectId(revID) },
      {
        $set: { estabResponse: newEstabRespo },
      });
    console.log(resp)
  } catch (err) {
    console.log("Error occurred:", err);
    res.sendStatus(500)
  }
    res.status(200);
    res.send("done estab respo")
  } else {
    res.sendStatus(400);
  }
}
const patchEstabRespo = async (req, res) => {
  const { revID, text } = req.body;

  if (revID && text) {
    try {
    let resp = await reviews_db.updateOne(
    { _id: new ObjectId(revID) },
    {
      $set: { "estabResponse.content": text, "estabResponse.edited": true }
    })
  console.log(resp)
} catch (err) {
  console.log("Error occurred:", err);
  res.sendStatus(500)
}
  res.status(200);
  res.send("esited estab respo")
  }
}
const deleteEstabRespo = async (req, res) => {
  const { revID } = req.body;
  try {
  let resp = await reviews_db.updateOne(
    { _id: new ObjectId(revID) },
    {
      $set: { "estabResponse": null }
    })
  console.log(resp)
} catch (err) {
  console.log("Error occurred:", err);
  res.sendStatus(500)
}
  res.status(200);
  res.send("deleted estab respo")
}

  contentRouter.route('/review')
  .post(checkUser, upload.array('mediaInput'), postReview)
  .patch(checkUser, upload.array('mediaInput'), patchReview)
  .delete(deleteReview)

  contentRouter.route('/').patch(checkValidUser, toggleLikes)

  contentRouter.route('/comment')
  .post(checkUser, postComment)
  .patch(checkUser, patchComment)
  .delete(deleteComment)

  contentRouter.route('/estabRespo')
  .post(postEstabRespo)
  .patch(patchEstabRespo)
  .delete(deleteEstabRespo)

  export default contentRouter