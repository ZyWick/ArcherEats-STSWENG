import { ObjectId } from "mongodb"
import { Router } from 'express'
import { getDb } from '../model/conn.js';

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

const establishmentRouter = Router();
const db = getDb();
const establishments_db = db.collection("establishments");
const reviews_db = db.collection("reviews");

establishmentRouter.get("/:displayedName", async function (req, res, next) {
  try {
    let selectedEstab = await establishments_db.findOne({ displayedName: req.params.displayedName });
    if (selectedEstab == null) next();

    let getObjectParams = {
      Bucket: bucketName,
      Key: selectedEstab.imageName
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    selectedEstab.profilePicture = url;

    const oid = new ObjectId(selectedEstab._id);
    let reviews = await reviews_db.aggregate([
      {
        '$match': {
          'establishmentId': oid
        }
      }, {
        '$lookup': {
          'from': 'comments',
          'localField': '_id',
          'foreignField': 'reviewId',
          'as': 'comments'
        }
      }, {
        '$unwind': {
          'path': '$comments',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'userId',
          'foreignField': '_id',
          'as': 'user'
        }
      }, {
        '$unwind': {
          'path': '$user',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'comments.userId',
          'foreignField': '_id',
          'as': 'comments.user'
        }
      }, {
        '$unwind': {
          'path': '$comments.user',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'comments.parent': null
        }
      }, {
        '$graphLookup': {
          'from': 'comments',
          'startWith': '$comments._id',
          'connectFromField': '_id',
          'connectToField': 'parent',
          'as': 'comments.children',
          'depthField': 'level'
        }
      }, {
        '$unwind': {
          'path': '$comments.children',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'comments.children.userId',
          'foreignField': '_id',
          'as': 'comments.children.user'
        }
      }, {
        '$unwind': {
          'path': '$comments.children.user',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$sort': {
          '_id': 1,
          'comments.children.level': -1
        }
      }, {
        '$group': {
          '_id': {
            'reviewid': '$_id',
            'commentid': '$comments._id'
          },
          'id': {
            '$first': '$_id'
          },
          'title': {
            '$first': '$title'
          },
          'content': {
            '$first': '$content'
          },
          'rating': {
            '$first': '$rating'
          },
          'likes': {
            '$first': '$likes'
          },
          'dislikes': {
            '$first': '$dislikes'
          },
          'edited': {
            '$first': '$edited'
          },
          'images': {
            '$first': '$images'
          },
          'videos': {
            '$first': '$videos'
          },
          'datePosted': {
            '$first': '$datePosted'
          },
          'estabResponse': {
            '$first': '$estabResponse'
          },
          'establishmentId': {
            '$first': '$establishmentId'
          },
          'userId': {
            '$first': '$userId'
          },
          'postAnonymously': {
            '$first': '$postAnonymously'
          },
          'user': {
            '$first': '$user'
          },
          'comments': {
            '$first': {
              '_id': '$comments._id',
              'content': '$comments.content',
              'likes': '$comments.likes',
              'dislikes': '$comments.dislikes',
              'datePosted': '$comments.datePosted',
              'userId': '$comments.userId',
              'parent': '$comments.parent',
              'edited': '$comments.edited',
              'user': '$comments.user'
            }
          },
          'children': {
            '$push': '$comments.children'
          }
        }
      }, {
        '$replaceWith': {
          '$arrayToObject': {
            '$map': {
              'input': {
                '$objectToArray': '$$ROOT'
              },
              'as': 'item',
              'in': {
                '$cond': {
                  'if': {
                    '$ne': [
                      '$$item.v', [
                        {}
                      ]
                    ]
                  },
                  'then': '$$item',
                  'else': {
                    'k': '$$item.k',
                    'v': []
                  }
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'children': {
            '$reduce': {
              'input': '$children',
              'initialValue': {
                'level': -1,
                'presentChild': [],
                'prevChild': []
              },
              'in': {
                '$let': {
                  'vars': {
                    'prev': {
                      '$cond': [
                        {
                          '$eq': [
                            '$$value.level', '$$this.level'
                          ]
                        }, '$$value.prevChild', '$$value.presentChild'
                      ]
                    },
                    'current': {
                      '$cond': [
                        {
                          '$eq': [
                            '$$value.level', '$$this.level'
                          ]
                        }, '$$value.presentChild', []
                      ]
                    }
                  },
                  'in': {
                    'level': '$$this.level',
                    'prevChild': '$$prev',
                    'presentChild': {
                      '$concatArrays': [
                        '$$current', [
                          {
                            '$mergeObjects': [
                              '$$this', {
                                'children': {
                                  '$filter': {
                                    'input': '$$prev',
                                    'as': 'e',
                                    'cond': {
                                      '$eq': [
                                        '$$e.parent', '$$this._id'
                                      ]
                                    }
                                  }
                                }
                              }
                            ]
                          }
                        ]
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }, {
        '$addFields': {
          'children': '$children.presentChild'
        }
      }, {
        '$group': {
          '_id': '$id',
          'title': {
            '$first': '$title'
          },
          'content': {
            '$first': '$content'
          },
          'rating': {
            '$first': '$rating'
          },
          'likes': {
            '$first': '$likes'
          },
          'dislikes': {
            '$first': '$dislikes'
          },
          'edited': {
            '$first': '$edited'
          },
          'images': {
            '$first': '$images'
          },
          'videos': {
            '$first': '$videos'
          },
          'datePosted': {
            '$first': '$datePosted'
          },
          'estabResponse': {
            '$first': '$estabResponse'
          },
          'establishmentId': {
            '$first': '$establishmentId'
          },
          'userId': {
            '$first': '$userId'
          },
          'postAnonymously': {
            '$first': '$postAnonymously'
          },
          'user': {
            '$first': '$user'
          },
          'children': {
            '$push': {
              '_id': '$comments._id',
              'content': '$comments.content',
              'likes': '$comments.likes',
              'dislikes': '$comments.dislikes',
              'datePosted': '$comments.datePosted',
              'userId': '$comments.userId',
              'parent': '$comments.parent',
              'user': '$comments.user',
              'edited': '$comments.edited',
              'children': '$children'
            }
          }
        }
      }, {
        '$replaceWith': {
          '$arrayToObject': {
            '$map': {
              'input': {
                '$objectToArray': '$$ROOT'
              },
              'as': 'item',
              'in': {
                '$cond': {
                  'if': {
                    '$ne': [
                      '$$item.v', [
                        {
                          'children': []
                        }
                      ]
                    ]
                  },
                  'then': '$$item',
                  'else': {
                    'k': '$$item.k',
                    'v': []
                  }
                }
              }
            }
          }
        }
      }, {
        '$sort': {
          'likes': -1,
          '_id': 1
        }
      }
    ]).toArray();

      //if user is logged in
      let currUser = null
      let userIsEstab = false;
      let isAdmin = false;
      if(res.locals.user != null) {
       currUser = res.locals.user._id.toString()
       if (res.locals.user.establishmentId != null && res.locals.user.establishmentId.toString()
        == selectedEstab._id.toString())
        userIsEstab = true;
        isAdmin = res.locals.user.isAdmin;
      }

      let userReview = null;

      for (let review of reviews) {
          // prioritize showing videos over images
          const nTopVideos = Math.min(review.videos.length, 3);
          review.topVideos = review.videos.slice(0, nTopVideos);
          review.truncatedVideos = review.videos.slice(nTopVideos);
          const nTopImages = Math.min(review.images.length, 3 - nTopVideos);
          review.topImages = review.images.slice(0, nTopImages);
          review.truncatedImages = review.images.slice(nTopImages);
          review.nTruncatedMedia = review.truncatedVideos.length + review.truncatedImages.length;
          review.nMedia = review.videos.length + review.images.length;
          if (review.userId == currUser) 
            userReview = review;
      }
      
      // set page link
      reviews.forEach(review => {
        review.user.link = "/users/" + review.user.username;
      });

      let NReviews = reviews.length;
      if (NReviews > 0) {
      let sum = reviews.reduce((a, b) => a + parseInt(b.rating), 0);
      await establishments_db.updateOne({ displayedName: req.params.displayedName }, { $set:{rating: (sum / NReviews).toFixed(1) || 0}});
      }

      let rateSummary = {
        nReviews: NReviews,
        fiveRev: reviews.filter(rev => rev.rating == 5).length / NReviews * 100,
        fourRev: reviews.filter(rev => rev.rating == 4).length / NReviews * 100,
        threeRev: reviews.filter(rev => rev.rating == 3).length / NReviews * 100,
        twoRev: reviews.filter(rev => rev.rating == 2).length / NReviews * 100,
        oneRev: reviews.filter(rev => rev.rating == 1).length / NReviews * 100,
      }

      //remove user's own review on list
      reviews = reviews.filter(function( review ) {
        return review.userId != currUser;
      });

      if (userReview != null)
      userReview.edit = true;
      const topReviews = reviews.slice(0, 2);
      const truncatedReviews = reviews.slice(2);
      // console.log("Top reviews\n", topReviews, "Truncated Reviews\n", truncatedReviews)

      // console.log(truncatedReviews)

      res.render("establishment-view", {
          title: `${selectedEstab.displayedName}`,
          selectedEstab: selectedEstab,
          rateSummary: rateSummary,
          isEstab: userIsEstab,
          isAdmin: isAdmin,
          userReview: userReview,
          topReviews: topReviews,
          truncatedReviews: truncatedReviews,
          currentUser: currUser,
          css: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">',
          //EDIT BOOKMARK START
          js: '<script defer src="static/js/establishment-filter.js"></script>'
          //EDIT BOOKMARK END
      })
    } catch (err) {
      console.log(err)
    }
  })


export default establishmentRouter;