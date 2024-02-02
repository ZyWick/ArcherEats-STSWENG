import { Router } from 'express';
import { getDb } from '../model/conn.js';
import { ObjectId } from 'mongodb';

const searchRouter = Router();
const db = getDb();
const establishments = db.collection("establishments");
const reviews = db.collection("reviews");

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
    
    reviewsArray.forEach(async (review) => {
        const establishment = await establishments.findOne({
            _id: review.establishmentId,
        });

        // add establishment username to review object (needed for url)
        review.estabUsername = establishment.username;

        // add _id string copy
        review.id = review._id.toString();
    })

    let starFilter
    if (req.query.filter == 1) {
        starFilter = req.query.filter + ' Star'
    } else if (req.query.filter >= 1) {
        starFilter = req.query.filter + ' Stars'
    } else {
        starFilter = 'No filter'
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