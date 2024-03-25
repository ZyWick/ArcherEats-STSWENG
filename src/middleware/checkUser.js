import jwt from 'jsonwebtoken'
import { getDb } from '../model/conn.js';
const db = getDb();
const users_db = db.collection("users");
import { ObjectId } from "mongodb"

const checkValidUser = async (req, res, next) => {
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
    req.userID = userID;
    next()
  }
}

const checkUser = async (req, res, next) => {

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

    let theUSER = await users_db.findOne({_id : new ObjectId(userID)});
    try {
      console.log("herelo")
        if (theUSER.restrictionEndTime != null){
            if(new Date () < new Date (theUSER.restrictionEndTime)){
                console.log("ban")
                return res.status(402).send("User Restricted.")
            }
        }
        console.log("midd" + userID)
        req.userID = userID;
        next()
    } catch (err){
        console.log("Error with server: ", err)
        res.status(500).send("Internal server error")
    }
    
}
}

export {checkUser, checkValidUser}