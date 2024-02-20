const checkRestriction = async (req, res) => {
    const { _id, restrictionEndDay } = req.body
    // if(token) {
    //     try{
    //         const decodedToken = await jwt.verify(token, "secret")
    //         userID = decodedToken._id
    //         restrictionEndDay = decodedToken.restrictionEndTime
    //         console.log("token received")
    //     } catch (err){
    //         console.log("Error occured: ", err)
    //     }
    // } else {
    //     console.log("no token i think")
    // }
    
    try {
        console.log(restrictionEndDay)
        if (restrictionEndDay){
            if(userID && Date() < restrictionEndDay){
                console.log("ban")
                return res.status(401).send("User Restricted.")
            }
        }
    } catch (err){
        console.log("Error with server: ", err)
        res.status(500).send("Internal server error")
    }
    
}

export {checkRestriction}