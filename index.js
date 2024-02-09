import { dirname } from "path";
import { fileURLToPath } from 'url';

import express from 'express';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser'

import router from './src/routes/index-router.js';

import { connectToMongo } from './src/model/conn.js';

import hbsHelpers from './src/modules/handlebars-helpers/helpers.js'

import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken'
import { ObjectId } from "mongodb"


const app = express();
app.use(cookieParser())

const __dirname = dirname(fileURLToPath(import.meta.url)); // directory URL

// import User from './src/model/User.js' 
import { getDb } from './src/model/conn.js'
const db = getDb();
const users_db = db.collection("users");

app.use("/static", express.static(__dirname + "/public"));

var hbs = exphbs.create({
    helpers: hbsHelpers,
    defaultLayout: 'main',
    partialsDir: __dirname + "/src/views/partials",
    extname: 'hbs'
})


app.get('*', async (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
         jwt.verify(token, "secret", async (err, decodedToken) => {
            if (err) {
                console.log(err.message)
                res.locals.user = null
                next()
            } else {
                const objectId = new ObjectId(decodedToken._id);
                let user = await users_db.findOne({ _id: objectId});
                res.locals.user = user
                next()
            }
        })
    } else { 
        res.locals.user = null
        next()
    }
})

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./src/views");
app.set("view cache", false);
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.json());


app.use(router);

app.listen(process.env.PORT, () => {
    console.log("Express app now listening...");
    connectToMongo();
});