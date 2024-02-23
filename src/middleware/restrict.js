

const checkRestriction = async (req, res) => {
    const {username, muteDuration} = req.body

    console.log(username)
    console.log(muteDuration)

    // if(token) {
    //     try{
    //         const decodedToken = await jwt.verify(token, "secret")
    //         userID = decodedToken._id
    //     } catch (err){
    //         console.log("Error occured: ", err)
    //     }

    //     user = await user_db.findOne({ _id: userID })
    // }
    
    try {
        console.log("try muna")
        console.log(selectedUser.restrictionEndDay)
        if (selectedUser.restrictionEndDay){
            if(userID && Date() < selectedUser.restrictionEndDay){
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