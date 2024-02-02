import LocalStrategy from "passport-local";
import { getDb } from "../../model/conn.js";

function initializePassport(passport) {
    const authenticateUser = async function(username, password, done) {
        const users_db = getDb().collection("users");
        try {
            const user = await users_db.findOne({
                username: username, 
                password: password
            })
    
            if (user) {
                return done(null, user);
            } else {
                return done(null, false, {message: "Incorrect username or password"});
            }
        } catch (err) {
            return done(e);
        }
    }

    passport.use(new LocalStrategy({usernameField: 'username-login'}, authenticateUser));

    passport.serializeUser(function(user, done) {
        return done(null, user.username);
    })

    passport.deserializeUser(async function(username, done) {
        const users_db = getDb().collection("users");
        try {
            const user = await users_db.findOne({
                username: username
            });

            if (user) {
                return done(null, user);
            }
        } catch (e) {
            return done(e);
        }
    })

}

export default initializePassport;

// const LocalStrategy = require('passport-local').Strategy
// const bcrypt = require('bcrypt')

// function initialize(passport, getUserByEmail, getUserById) {
//   const authenticateUser = async (email, password, done) => {
//     const user = getUserByEmail(email)
//     if (user == null) {
//       return done(null, false, { message: 'No user with that email' })
//     }

//     try {
//       if (await bcrypt.compare(password, user.password)) {
//         return done(null, user)
//       } else {
//         return done(null, false, { message: 'Password incorrect' })
//       }
//     } catch (e) {
//       return done(e)
//     }
//   }

//   passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
//   passport.serializeUser((user, done) => done(null, user.id))
//   passport.deserializeUser((id, done) => {
//     return done(null, getUserById(id))
//   })
// }

// module.exports = initialize