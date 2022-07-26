const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const validator = require("../validator/validator")
const awsService = require('../aws/config')

const register = async function (req, res) {
    try {
        const userDetails = req.body;
        if (Object.keys(userDetails).length === 0) {
            res.status(400).send({ status: false, message: "Please Provide Necessary Details" })
            return
        }
        const userObject = {};
        if (!userDetails.fname || !validator.isValid(userDetails.fname)) {
            res.status(400).send({ status: false, message: "Please Enter firstname" })
            return
        }
        userObject.fname = userDetails.fname;

        if (!userDetails.lname || !validator.isValid(userDetails.lname)) {
            res.status(400).send({ status: false, message: "Please Enter lastname" })
            return
        }
        userObject.lname = userDetails.lname;

        if (!userDetails.email || !validator.isValidEmail(userDetails.email)) {
            res.status(400).send({ status: false, message: "Please Enter firstname" })
            return
        }
        userObject.email = userDetails.email
        const isEmailExist = await userModel.findOne({ email: userObject.email })
        if (isEmailExist) {
            res.status(409).send({ status: false, message: "Given email id already exists!!" })
            return
        }

        if (!userDetails.phone || !validator.isValidPhone(userDetails.phone)) {
            res.status(400).send({ status: false, message: "Please Enter phone number" })
            return
        }
        if (!validator.isValidPhone(userDetails.phone)) {
            res.status(400).send({ status: false, message: "Please Enter valid phone number" })
            return
        }
        userObject.phone = userDetails.phone;

        const address = JSON.parse(userDetails.address)
        console.log(address)
        if (!address.shipping.street || !validator.isValid(address.shipping.street)) {
            res.status(400).send({ status: false, message: "Please Enter shipping street" })
            return
        }

        if (!userDetails.address.shipping.city || !validator.isValid(userDetails.address.shipping.city)) {
            res.status(400).send({ status: false, message: "Please Enter shipping city" })
            return
        }
        userObject.address = userDetails.address.shipping.city;

        if (!userDetails.address.pincode || !validator.isValidPincode(userDetails.address.pincode)) {
            res.status(400).send({ status: false, message: "Please Enter shipping pincode" })
            return
        }
        userObject.address.shipping.pincode = userDetails.address.shipping.pincode;

        if (!userDetails.billing.address.street || !validator.isValid(userDetails.billing.address.street)) {
            res.status(400).send({ status: false, message: "Please Enter billing street" })
            return
        }
        userObject.address.billing.street = userDetails.address.billing.street;
        
        if (!userDetails.address.billing.city || !validator.isValid(userDetails.address.billing.city)) {
            res.status(400).send({ status: false, message: "Please Enter billing city" })
            return
        }
        userObject.address.billing.city = userDetails.address.billing.city;

        if (!userDetails.billing.address.pincode || !validator.isValid(userDetails.billing.address.pincode)) {
            res.status(400).send({ status: false, message: "Please Enter billing pincode" })
            return
        }
        userObject.address.billing.pincode = userDetails.address.billing.pincode;

        userObject.password = await bcrypt.hash(userDetails.password, 10)

        const files = req.files;
        let uploadProfileImage;
        if(!validator.isValidImage(files[0].originalname.toLowerCase())){
            return res.status(400).send({ status: false, message: "Image format is not correct" })
        }
        if (files && files.length > 0 && files.length<2) {
            uploadProfileImage = await awsService.uploadImage(files[0])
        }
        else{
            return res.status(400).send({status:false, message:"please provide only one file"})
        }
        userObject['profileImage'] = uploadProfileImage;

        const createNewUser = await userModel.create(userObject);
        return res.status(201).send({ status: true, message: 'Success', data: createNewUser })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const userLogin = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Enter email and password to LogIn" })
        }
        const email = req.body.email
        const password = req.body.password
        if (!email || email == "") {
            return res.status(400).send({ status: false, message: "Please Enter Email" })
        }
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid Email" })
        }
        if (!password || password == "") {
            return res.status(400).send({ status: false, message: "Please Enter password" })
        }
        if (Object.keys(req.body).length > 2) {
            return res.status(400).send({ status: false, message: "please don't enter any other key, except email and password" })
        }
        const findUser = await userModel.findOne({ email })
        if (!findUser) {
            return res.status(404).send({ status: false, message: "User not found" })
        }
        // const encryptPassword = await bcrypt.hash(password, 10)
        const decodePassword = await bcrypt.compare(password, findUser.password)
        if (decodePassword == true) {
            const iat = Date.now()
            const exp = (iat) + (24 * 60 * 60 * 1000)
            const token = jwt.sign(
                {
                    userId: findUser._id.toString(),
                    iat: iat,
                    exp: exp
                },
                "project/productManagementGroup52"
            )
            return res.status(200).send({ status: true, message: "User login successfull, token will be valid for 24 hrs", data: { userId: findUser._id, token } })
        }
        else {
            return res.status(404).send({ status: false, message: "Password is wrong" })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

module.exports = { register, userLogin }
