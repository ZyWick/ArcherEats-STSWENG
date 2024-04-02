import { Router } from 'express';
import { getDb } from '../model/conn.js';
import { ObjectId } from 'mongodb';

const searchRouter = Router();
const db = getDb();
const establishments = db.collection("establishments");
const reviews = db.collection("reviews");

import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3"
import  { getSignedUrl } from  "@aws-sdk/s3-request-presigner"
import dotenv from 'dotenv';
dotenv.config();

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey
  },
  region: bucketRegion
})

searchRouter.get("/search", async (req, res) => {
    const estabQueryPipe = {
        $or: [
            { "displayed-name": { $regex: new RegExp(req.query.q, "i") } },
            { description: { $regex: new RegExp(req.query.q, "i") } }
        ]
    };

    const reviewQueryPipe = [
        {
            $match: {
                $or: [
                    { title: { $regex: new RegExp(req.query.q, "i") } },
                    { content: { $regex: new RegExp(req.query.q, "i") } }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" }
    ];

     // add another condition if there is a filter
     if(req.query.filter) {
        estabQueryPipe.$and = [ { rating: { $gt: req.query.filter, $lt: req.query.filter + 1} } ]

    }

    const establishmentsArray = await establishments.find(estabQueryPipe).toArray();
    const reviewsArray = await reviews.aggregate(reviewQueryPipe).toArray();
    
    const transformReview = reviewsArray.map(async (review) => {
        const establishment = await establishments.findOne({
            _id: review.establishmentId,
        });

        // add establishment username to review object (needed for url)
        review.estabUsername = establishment.displayedName;

        // add _id string copy
        review.id = review._id.toString();

    })

    await Promise.all(transformReview)

    let starFilter
    if (req.query.filter == 1) {
        starFilter = req.query.filter + ' Star'
    } else if (req.query.filter >= 1) {
        starFilter = req.query.filter + ' Stars'
    } else {
        starFilter = 'No filter'
    }

    for (const estab of establishmentsArray) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: estab.imageName
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        estab.profilePicture = url;
      }

    res.render("search", {
        title: req.query.q + " - Search Results",
        css:'<link href="static/css/search-result.css" rel="stylesheet">',
        js: '<script defer src="static/js/search-result.js"></script>',
        key: req.query.q,
        establishments: establishmentsArray,
        reviews: reviewsArray,
        starFilter
    })
});

export default searchRouter;