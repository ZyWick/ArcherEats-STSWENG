import { ObjectId } from "mongodb"

import { Router } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer';
import searchRouter from './search-router.js';
import userRouter from './user-router.js';
import establishmentRouter from "./establishment-router.js";
import contentRouter from "./contentRouter.js";

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

router.get("/admin", async (req,res,next) => {
  if(res.locals.user != null && res.locals.user.isAdmin)
  res.render("admin", {
    title: "Admin",
    css: `<link rel="stylesheet" href="/static/css/admin.css">`,
    js: '<script defer src="static/js/admin.js"></script>',
  }) 
  else {console.log("user is not an administratior"); next()}
})


router.use(userRouter);
router.use(searchRouter);
router.use(establishmentRouter);
router.use(loginRegisterRouter);
router.use(contentRouter);



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