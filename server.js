//routes will be splitted to a seperate router file for simplification
//users will be saved into the database

if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

var users = [] //temporary user array, will be connected to the database

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => { //route to the main screen
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => { //route to the login page
    res.render("login.ejs")
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    faliureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => { //route to the register page
    res.render("register.ejs")
})

app.post('/register', checkNotAuthenticated, async (req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({//this user stack is just for educational purposes, I will integrate a database as soon as I get an understanding of login system
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(3000)