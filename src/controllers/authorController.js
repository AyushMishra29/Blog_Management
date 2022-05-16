const AuthorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken")

const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (typeof (value) === "string" && (value).trim().length > 0) { return true }
}

const createAuthor = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "BAD REQUEST NO DATA PROVIDED" })
        const { fname, lname, title, email, password } = data

        if (!isValid(fname)) { return res.status(400).send({ status: false, msg: "First name is required" }) }

        if (!isValid(lname)) { return res.status(400).send({ status: false, msg: "Last name is required" }) }

        if (!isValid(title)) { return res.status(400).send({ status: false, msg: "Title is required" }) }

        if ( !(title == "Mr" || title == "Miss" || title == "Mrs")){
            return res.status(400).send({ status: false, message: 'please provide valid title ( Mr , Mrs or Miss)' })}

        if (!isValid(email)) { return res.status(400).semd({ status: false, msg: "Email is required" }) }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: 'please provide valid email' })}
        
        let emailMatch = await AuthorModel.findOne({ email })
        if (emailMatch) return res.status(400).send({ status: false, message: "This eamil is already in use,please provide another email or login" })

        if (!isValid(password)) { return res.status(400).send({ status: false, msg: "Password is required" }) }
        let savedData = await AuthorModel.create(data)
        return res.status(201).send({ msg: savedData })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })


    }
}


const login = async function (req, res) {
    try {
        const mail = req.body.email
        const pass = req.body.password
        const data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "No input provided" })
        if (!isValid(mail)) { return res.status(400).send({ status: false, msg: "Email is required" }) }
        if (!isValid(pass)) { return res.status(400).send({ status: false, msg: "Password is required" }) }

        const userMatch = await AuthorModel.findOne({ email: mail, password: pass })
        if (!userMatch) return res.status(400).send({ status: false, msg: "Email or Password is incorrect" })

        const token = jwt.sign({
            userId: userMatch._id.toString() , expiresIn: "1h"
        }, "Secret-Key")

        res.setHeader("x-api-key", "token");
        return res.status(200).send({ status: true, msg: "You are successfully logged in", token })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })
    }
}


module.exports.createAuthor = createAuthor
module.exports.login = login
