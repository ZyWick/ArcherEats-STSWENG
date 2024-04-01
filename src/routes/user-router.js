import { ObjectId } from 'mongodb';
import { Router } from 'express';
import { getDb } from '../model/conn.js';
import fs from 'fs';
import { dirname } from "path";
import { fileURLToPath } from 'url';

import { checkValidUser } from '../middleware/checkUser.js'
const __dirname = dirname(fileURLToPath(import.meta.url)); // directory URL
import jwt from 'jsonwebtoken'
const userRouter = Router();
const db = getDb();
const user_db = db.collection("users");
const establishments_db = db.collection("establishments");
const reviews_db = db.collection("reviews");
const comments_db = db.collection("comments");
const notif_db = db.collection("notifications");
const notifStatus_db = db.collection("notifStatus");

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

import multer from 'multer';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/user_pfp/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname)
  },
})
const upload = multer({ storage: storage })

userRouter.patch("/user/changePfp", upload.single('media'), async function (req, res) {
  let img = "static/assets/user_pfp/" + req.file.filename;

  let userID
  let token = req.cookies.jwt
  if (token && req.file) {
    try {
      const decodedToken = await jwt.verify(token, "secret");
      userID = decodedToken._id
    } catch (err) {
      console.log("Error occurred:", err);
    }
  }
  console.log(userID)

  let userr = await user_db.findOne({ _id: new ObjectId(userID) });
  if (userr != null && userr.profilePicture != null)
    fs.unlink(__dirname + "../../../public/assets/user_pfp/" + userr.profilePicture.substring(23), (err) => {
      if (err) console.error('Error deleting file:', err);
    })

  await user_db.updateOne({ _id: new ObjectId(userID) },
    { $set: { profilePicture: img } })
  res.status(200)
  res.send("done edit pic")
})

userRouter.patch("/user/changeDesc", async function (req, res) {
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
  console.log(userID)

  try {
    let { userDesc } = req.body;

    // Perform the update operation only if 'user' is not null
    await user_db.updateOne({ _id: new ObjectId(userID) }, { $set: { description: userDesc } });

    res.status(200).send("done edit desc");
  } catch (err) {
    console.log("Error updating user description:", err);
    res.status(500).send("Internal server error");
  }
})

userRouter.patch("/user/restrict", checkValidUser, async function (req, res) {
  try {
    const {username, muteDuration} = req.body

    let selectedUser = await user_db.findOne({ username: username});
    if(selectedUser) { 
      const oid = new ObjectId(selectedUser._id);
      await user_db.updateOne({ _id: new ObjectId(oid) }, { $set: { restrictionEndTime: muteDuration } });

      res.status(200)
      res.json({userId : oid});
    } else { res.status(501).send("no such user");}
  } catch (err){
    console.log("Error updating restriction period: ", err)
    res.status(500).send("Internal server error")
  }
})

userRouter.post("/findUser", checkValidUser, async function (req, res) {
  try {
    let {postId, postType} = req.body;
    let userId = ''

    switch (postType) {
      case 'review': 
        let review = await reviews_db.findOne({_id: new ObjectId(postId)});
        userId = review.userId
        break;
      case 'reply': 
      let reply = await comments_db.findOne({_id: new ObjectId(postId)});
        userId = reply.userId
        break;
      case 'estabRespo': 
        let estabUser = await user_db.findOne({establishmentId: new ObjectId(postId)});
        userId = estabUser._id
        break;
    }
    
    res.status(200)
    res.json({userId : userId});
  } catch (err){
    console.log("Error getting user id: ", err)
    res.status(500).send("Internal server error")
  }
})

userRouter.post('/checkHelpful', async function (req,res) {
  try {
    let {postId, number} = req.body;
    let theNotifStatus = await notifStatus_db.findOne({reviewID: new ObjectId(postId)});
    
    if (theNotifStatus) {
      let achieved = true
      let mile
      switch (number) {
        case 1: achieved = theNotifStatus._1 ; 
                  if (achieved == false)  
                  mile = await notifStatus_db.updateOne({ reviewID: new ObjectId(postId) },
                    {$set: {_1: true}})
                  break;
        case 10: achieved = theNotifStatus._10 ;
                  if (achieved == false)  
                  mile = await notifStatus_db.updateOne({ reviewID: new ObjectId(postId) },
                    {$set: {_10: true}})
                  break;
        case 100: achieved = theNotifStatus._100 ;
                    if (achieved == false)  
                    mile = await notifStatus_db.updateOne({ reviewID: new ObjectId(postId) },
                      {$set: {_100: true}})
                    break;
        case 1000: achieved = theNotifStatus._1000 ;
                    if (achieved == false)  
                    mile = await notifStatus_db.updateOne({ reviewID: new ObjectId(postId) },
                      {$set: {_1000: true}})
                    break;
        case 10000: achieved = theNotifStatus._10000 ;
                    if (achieved == false)  
                    mile = await notifStatus_db.updateOne({ reviewID: new ObjectId(postId) },
                      {$set: {_10000: true}})
                    break;
      }
      
      res.status(200).send(achieved)
    } else {
      res.status(200).send(true)
    }
  } catch (err) {
    console.log("error checking milestone: " + err);
  }
})


const createNotify = async function (req, res) {
  let {userId, notifTitle, notifContent} = req.body

  if (userId && notifTitle && notifContent) {
    const newNotif = {
      user_id: new ObjectId(userId),
      notifTitle: notifTitle,
      notifContent: notifContent,
      from_id: new ObjectId(req.userID),
      date: new Date(),
      read: false
    };
    try {
      let resp = await notif_db.insertOne(newNotif);
      console.log(resp)
    } catch (err) {
      console.log("Error occurred:", err);
      res.status(500).send("Internal server error")
    }
    res.status(200);
    res.send("sent Notif")
  } else {
    console.log("Error sending notification")
    res.sendStatus(400)
  }
}

const readMail = async function (req, res) {
  const {notifId} = req.body

  if (notifId) {
    try {
      let readNotif = await notif_db.updateOne(
        { _id: new ObjectId(notifId) },
        {
          $set: {
            read: true
          }
        })
        console.log(readNotif)
    } catch (err) {
      console.log("Error occurred:", err);
      res.status(500).send("Internal server error")
    }
    res.status(200);
    res.send("read Notif")
} else {
  console.log("Error updating read status")
  res.sendStatus(400)
}
}

const deleteMail = async function (req, res) {
  const {notifId} = req.body;

  if (notifId) {
  try {
    let deleteNotif = await notif_db.deleteOne({ _id: new ObjectId(notifId) })
    console.log(deleteNotif)
  } catch (err) {
    console.log("Error occurred:", err);
    res.status(500).send("Internal server error")
  }
  res.status(200);
  res.send("deleted Notif")
} else {
  console.log("Error deleting notif")
  res.sendStatus(400)
}
}

userRouter.post("/notify", checkValidUser, createNotify)
userRouter.route("/user/notif")
.patch(checkValidUser, readMail)
.delete(checkValidUser, deleteMail)

function getMails (oid) {
  try {
    return notif_db.aggregate( [
      {
        '$match': {
          user_id: new ObjectId(oid)
        }
      }, {
          '$sort': {
              'read': 1, 
              'date': -1
          }
      }
  ] ).toArray()
  } catch (err) {
    console.log(err)
  }
}



userRouter.get("/users/:username", async (req, res, next) => {
  try {
    let user = await user_db.findOne({ username: req.params.username });
    if (user == null) next();
    const oid = new ObjectId(user._id);

    const reviews = await reviews_db.aggregate([
      {
        '$match': {
          'userId': oid
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
          'from': 'establishments',
          'localField': 'establishmentId',
          'foreignField': '_id',
          'as': 'establishment'
        }
      }, {
        '$unwind': {
          'path': '$establishment',
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
          'datePosted': -1,
          '_id': 1
        }
      }
    ]).toArray();

    const comments = await comments_db.aggregate([
      {
        '$lookup': {
          'from': 'reviews', 
          'localField': 'reviewId', 
          'foreignField': '_id', 
          'as': 'review'
        }
      }, {
        '$unwind': {
          'path': '$review', 
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$match': {
          'userId': oid
        }
      }, {
        '$set': {
          'isComment': true
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
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'review.userId', 
          'foreignField': '_id', 
          'as': 'review.user'
        }
      }, {
        '$unwind': {
          'path': '$review.user', 
          'preserveNullAndEmptyArrays': false
        }
      }
    ]).toArray();

    // edit review object to be compatible with review partial
    // (review partial is made assuming it will only be used in establishment page)
    const promises = reviews.map(async (review) => {
      const establishment = await establishments_db.findOne({ '_id': review.establishmentId });
    
      let getObjectParams = {
        Bucket: bucketName,
        Key: establishment.imageName
      }
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

      review.user = {
        username: establishment.displayedName,
        profilePicture: url,
        link: "/" + establishment.displayedName
      };
    });
  
    await Promise.all(promises);

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
    }

    for (let comment of comments) {
      // prioritize showing videos over images
      const nTopVideos = Math.min(comment.review.videos.length, 3);
      comment.review.topVideos = comment.review.videos.slice(0, nTopVideos);
      comment.review.truncatedVideos = comment.review.videos.slice(nTopVideos);
      const nTopImages = Math.min(comment.review.images.length, 3 - nTopVideos);
      comment.review.topImages = comment.review.images.slice(0, nTopImages);
      comment.review.truncatedImages = comment.review.images.slice(nTopImages);
      comment.review.nTruncatedMedia = comment.review.truncatedVideos.length + comment.review.truncatedImages.length;
      comment.review.nMedia = comment.review.videos.length + comment.review.images.length;
    }

    const collatedReviews = reviews.concat(comments);
    collatedReviews.sort(function(a, b) {
      return b.datePosted - a.datePosted;
    })

    const topReviews = collatedReviews.slice(0, 3);
    const truncatedReviews = collatedReviews.slice(3);
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
    console.log(userID)

    let isAdmin = false;
    if(res.locals.user != null) {
      isAdmin = res.locals.user.isAdmin;
    }
    
    let mailIcon = ""
    const allNotifs = await getMails (oid)
    for (let notif of allNotifs) {
      if (notif.read == false)
        mailIcon = "-fill";
      notif.read = notif.read ? "read" : "";
    }

    if (oid.toString() !== userID) {
      res.render("user", {
        title: user.username + " - Profile",
        css: '<link href="/static/css/user-profile.css" rel="stylesheet">',
        js: '<script defer src="/static/js/user-profile.js"></script>',
        profilePicture: user.profilePicture,
        username: user.username,
        description: user.description,
        topReviews: topReviews,
        truncatedReviews: truncatedReviews,
        isAdmin: isAdmin,
      })
    } else {
      res.render("theUser", {
        title: user.username + " - Profile",
        css: '<link href="/static/css/user-profile.css" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">',
        js: '<script defer src="/static/js/user-profile.js"></script>',
        profilePicture: user.profilePicture,
        username: user.username,
        THEEEUSERR: true,
        description: user.description,
        topReviews: topReviews,
        truncatedReviews: truncatedReviews,
        allNotifs: allNotifs,
        mailIcon: mailIcon,
        isAdmin: isAdmin,
      })
    }
  } catch (err) {
    console.log(err)
  }
})

export default userRouter;