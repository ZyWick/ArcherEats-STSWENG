import { ObjectId } from "mongodb"

import { Router } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer';
import searchRouter from './search-router.js';
import userRouter from './user-router.js';
import establishmentRouter from "./establishment-router.js";

import { getDb } from '../model/conn.js';
import fs from 'fs';
import { dirname, relative } from "path";
import { fileURLToPath } from 'url';
import loginRegisterRouter from '../routes/login-register-router.js'
import uploadPfp from '../middleware/upload.js'

const __dirname = dirname(fileURLToPath(import.meta.url)); // directory URL
const router = Router();
const db = getDb();
const establishments_db = db.collection("establishments");
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

router.get("/", async function (req, res) {
  const establishments = await establishments_db.find({}).toArray();

  res.render("index", {
    title: "Home",
    establishments: establishments,
    css: `<link rel="stylesheet" href="/static/css/style.css">
        <link rel="stylesheet" href="/static/css/index.css">`
  });
})

router.get("/about", (req,res) => {
  res.render("about", {
    title: "About"
  })
})


router.use(userRouter);
router.use(searchRouter);
router.use(establishmentRouter);
router.use(loginRegisterRouter);

router.route('/review')
  .post(upload.array('mediaInput'), async function (req, res) {
    const { estabID, title, rate, content } = req.body;

    let imageURls = []
    let videoUrls = []
    for (let files of req.files) {
      let type = files.mimetype;
      if (type.split('/')[0] == "image")
        imageURls.push("/static/assets/reviewPics/" + files.filename)
      else
        videoUrls.push("/static/assets/reviewPics/" + files.filename)
    }

    let userID
    let token = req.cookies.jwt
    if (token) {
      try {
        const decodedToken = await jwt.verify(token, "secret");
        userID = decodedToken._id
      } catch (err) {
        console.log("Error occurred:", err);
      }
    }
    
    if (userID == null) {
      res.sendStatus(401);
    } else if (title && rate && content) {
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
  })
  .patch(upload.array('mediaInput'), async function (req, res) {
    const { title, rate, content, reviewID } = req.body;

    let userID
    let token = req.cookies.jwt
    if (token) {
      try {
        const decodedToken = await jwt.verify(token, "secret");
        userID = decodedToken._id
      } catch (err) {
        console.log("Error occurred:", err);
      }
    }

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

    if (userID == null) {
      res.sendStatus(401);
    } else if (title && rate && content) {
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
  })
  .delete(async function (req, res) {
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
  })

router.patch('/', async (req, res) => {
  let userID
  let token = req.cookies.jwt
  if (token) {
    try {
      const decodedToken = await jwt.verify(token, "secret");
      userID = decodedToken._id
    } catch (err) {
      console.log("Error occurred:", err);
    }
  }

  if (userID == null) {
    res.sendStatus(401);
  } else {
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
})

router.route('/comment')
  .post(async function (req, res) {
    let { revID, parID, text } = req.body;
    let userID
    let token = req.cookies.jwt
    if (token) {
      try {
        const decodedToken = await jwt.verify(token, "secret");
        userID = decodedToken._id
      } catch (err) {
        console.log("Error occurred:", err);
      }
    }

    let par_id = null
    if (parID != "null")
      par_id = new ObjectId(parID)
    if (revID == "null") {
      let parComment = await comments_db.findOne({ _id: new ObjectId(par_id) })
      revID = parComment.reviewId
    }

    if (userID == null) {
      res.sendStatus(401);
    } else  if (revID && userID && text) {
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
  })
  .patch(async function (req, res) {
    const { commID, text } = req.body;

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
  }})
  .delete(async function (req, res) {
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
  })

router.route('/estabRespo')
  .post(async function (req, res) {
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
  })
  .patch(async function (req, res) {
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
  })
  .delete(async function (req, res) {
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
  })


router.post("/upload", uploadPfp.single("file"), (req, res) => {
  let filePath;
  try {
    filePath = req.file.path;

    const updatedPath = filePath.replace("public", "static");
    console.log(updatedPath)
    console.log("File uploaded successfully:", req.file);
    res.json({ path: updatedPath });
  } catch (error) {
    console.log("No file was uploaded.");
    res.status(400).json({ error: 'No file was uploaded.' });
  } 
})

router.use((req, res) => {

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title> 404 | ArcherEats</title>
  </head>
  <body>
    <h1>for oh for | resource aint found! </h1>
  </body>
  </html>
  `)
})


export default router;

/*
index
css:'<link rel="stylesheet" href="/static/css/index.css">',
js: '<script src="static/js/card-view.js" defer></script>'

estab
css:'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">',
js: '<script src="https://code.jquery.com/jquery-3.7.0.js" integrity="sha256-JlqSTELeR4TLqP0OG9dxM7yDPqX1ox/HfgiSLBj8+kM=" crossorigin="anonymous"></script>'

user
css:'<link href="/static/css/user-profile.css" rel="stylesheet">',
js: '<script defer src="/static/js/user-profile.js"></script>

search
css:'<link href="/static/css/search-result.css" rel="stylesheet">',
js :'<script defer src="/static/js/search-result.js"></script>'
*/