
import express from 'express';
import jwt from 'jsonwebtoken'
// import User from '../model/User.js' 
import { getDb } from '../model/conn.js'
import bcrypt from 'bcrypt'
const db = getDb();
const users_db = db.collection("users");

const loginRegisterRouter = express.Router()
const handleErrors = (err) => {
    let errors = { username: '', password: '' }
    
    if (err.message.includes('username')) {
        errors.username = err.message
    } 
    if (err.message.includes('password')) {
        errors.password = err.message
    }
    if (err.message.includes('no credentials')) {
        errors.username = "provide username"
        errors.password = "provide password"
    }

    return errors;
}

let maxAge = 3 * 7 * 24 * 60 * 60 //3 weeks
const createToken = (_id) => {
    return jwt.sign({_id}, "secret", { expiresIn: maxAge}) 
}

const login = async (req, res) => {
    // const currUser = req.body
    const {username , password} = req.body 
    
    try {
        if (!username && !password) {
            throw Error('no credentials')
        }
        if (!username) {
            throw Error('provide username')
        }
        if (!password) {
            throw Error('provide password')
        }

        const user = await users_db.findOne({username})
        if (user) {
            const auth = await bcrypt.compare(password, user.password)
            if (auth) {
                const token = createToken(user._id)
                res.cookie('jwt', token, {maxAge: maxAge}) //change to not httponly cuz wala na time kewk
                res.status(200).json({ user: user._id })
            } else {
                    throw Error('incorrect password')
            }  
        } else {
            throw Error('incorrect username')
        }
    } catch (error) {
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    } 
} 

const signup = async (req, res) => {
    const {username , password, description, profilePicture} = req.body

    try{
        if (!username && !password) {
            throw Error('no credentials')
        }
        if (!username) {
            throw Error('provide username')
        }
        if (!password) {
            throw Error('provide password')
        }

        let user = await users_db.findOne({username})
        if (user) {
            throw Error('username already in use');
        } else {
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, salt)
            user = await users_db.insertOne({username, password: hash, description, profilePicture})
            const token = createToken(user.insertedId)
            res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge})
            res.status(200).json({ user: user.insertedId })
        }
    } catch (error) {    
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    }
}

const getUser = (req, res) => {
    res.render('user')
}

const showLogin = (req, res) => {
    const data = {
        css: `
            <link rel="stylesheet" href="/static/css/auth.css">
        `,
        js: `
            <script src="/static/js/login.js" defer></script>
        `,
    };
    res.render('login', data)
}

const showSignup = (req, res) => {
    const data = {
        css: `
            <link rel="stylesheet" href="/static/css/auth.css">
        `,
        js: `
            <script src="/static/js/signup.js" defer></script>
        `,
    };
    res.render('signup', data)
}

const logout = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1})
    res.redirect('/')
}

loginRegisterRouter.get('/login', showLogin)
loginRegisterRouter.post('/login', login)
loginRegisterRouter.get('/signup', showSignup)
loginRegisterRouter.post('/signup', signup)
loginRegisterRouter.get('/logout', logout)
loginRegisterRouter.get('/:username', getUser)

export default loginRegisterRouter;
