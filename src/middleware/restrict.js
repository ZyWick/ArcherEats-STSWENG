import jwt from 'jsonwebtoken'

const checkRestriction = async (req, res, next) => {
    let userID
    let restrictionEndDay
    let token = req.cookies.jwt
    console.log("in")
    if(token) {
        try{
            const decodedToken = await jwt.verify(token, "secret")
            userID = decodedToken._id
            restrictionEndDay = decodedToken.restrictionEndTime
            console.log("token received")
        } catch (err){
            console.log("Error occured: ", err)
        }
    }
    try {
        console.log(restrictionEndDay)
        if (restrictionEndDay){
            if(userID && Date() < restrictionEndDay){
                console.log("ban")
                return res.status(401).send("User Restricted.")
            }
        }
        next()
    } catch (err){
        console.log("Error with server: ", err)
        res.status(500).send("Internal server error")
    }
    
}

export {checkRestriction}