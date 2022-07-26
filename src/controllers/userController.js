const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const validator = require("../validator/validator")
const awsService = require('../aws/config')

//const bcrypt = require('bcrypt')
const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        const userDetails = req.body
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({ status: false, message: "Incorrect userId format" })
        }
        if (Object.keys(userDetails).length === 0) {
            res.status(400).send({ status: false, message: "Please Provide Necessary Details" })
            return
        }

        const userObject = {
            // fname: userDetails.fname,
            // lname: userDetails.lname,
            // email: userDetails.email,
            // phone: userDetails.phone
        }

        if (userDetails.fname) {
            if (!validator.isValid(userDetails.fname)) {
                res.status(400).send({ status: false, message: "Please Enter  vaild firstname" })
                return
            }
            userObject.fname = userDetails.fname;
        }
        if (userDetails.fname == "") {
            return res.status(400).send({ status: false, message: "Please Enter firstname" })
        }
        if (userDetails.lname) {
            if (!validator.isValid(userDetails.lname)) {
                res.status(400).send({ status: false, message: "Please Enter valid lastname" })
                return
            }
            userObject.lname = userDetails.lname;
        }
        if (userDetails.lname == "") {
            return res.status(400).send({ status: false, message: "Please Enter lastname" })
        }
        if (userDetails.email) {
            if (!validator.isValidEmail(userDetails.email)) {
                res.status(400).send({ status: false, message: "Please Enter valid email" })
                return
            }
            userObject.email = userDetails.email
        }
        if (userDetails.email == "") {
            return res.status(400).send({ status: false, message: "you selected the email field but value not provided" })
        }
        if (userDetails.phone) {
            if (!validator.isValidPhone(userDetails.phone)) {
                res.status(400).send({ status: false, message: "Please Enter valid phone" })
                return
            }
            userObject.email = userDetails.email
        }
        if (userDetails.phone == "") {
            return res.status(400).send({ status: false, message: "you selected the phone field but value not provided" })
        }

        if (userDetails.address) {
            const address = JSON.parse(userDetails.address)
            if (Object.keys(address).length == 0) {
                return res.status(400).send({ status: false, message: "Please Enter shipping or biling address" })
            }
            userObject.address = {};
            if (address.shipping) {
                if (Object.keys(address.shipping).length == 0) {
                    return res.status(400).send({ status: false, message: "Please Enter shipping address" })
                }
            }
            if (address.billing) {
                if (Object.keys(address.billing).length == 0) {
                    return res.status(400).send({ status: false, message: "Please Enter biling address" })
                }
            }
        }
       

      const updateduser = await userModel.findByIdAndUpdate({ _id: userId }, { $set: userObject },
            { new: true }
        );
        console.log(updateduser)
        return res.status(200).send({ status: true, message: "Success", data: updateduser })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

const register = async function (req, res) {
    try {
        const userDetails = req.body;
        const files = req.files;
        let uploadProfileImage;

        const validPhoneNumber = /^[6-9][0-9]{9}$/;
        //let {fname, lname, email, profileImage, phone, password} = userDetails;

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


        if (!validator.isValidImage(files[0].originalname.toLowerCase())) {
            return res.status(400).send({ status: false, message: "Image format is not correct" })
        }

        if (files && files.length > 0) {
            uploadProfileImage = await awsService.uploadImage(files[0])
        }
        userDetails['profileImage'] = uploadProfileImage;

        if (!userDetails.phone || !validator.isValidPhone(userDetails.phone)) {
            res.status(400).send({ status: false, message: "Please Enter phone number" })
            return
        }
        if (!validator.isValidPhone(userDetails.phone)) {
            res.status(400).send({ status: false, message: "Please Enter valid phone number" })
            return
        }
        userObject.phone = userDetails.phone;

        if (!userDetails.address.shipping.street || !validator.isValid(userDetails.address.shipping.street)) {
            res.status(400).send({ status: false, message: "Please Enter shipping street" })
            return
        }
        userObject.address.shipping.street = userDetails.address.shipping.street;

        if (!userDetails.address.shipping.city || !validator.isValid(userDetails.address.shipping.city)) {
            res.status(400).send({ status: false, message: "Please Enter shipping city" })
            return
        }
        userObject.address.shipping.city = userDetails.address.shipping.city;

        if (!userDetails.address.pincode || !validator.isValidPincode(userDetails.address.pincode)) {
            res.status(400).send({ status: false, message: "Please Enter shipping pincode" })
            return
        }
        userObject.address.shipping.pincode = userDetails.address.shipping.pincode;

        if (!userDetails.billing.address.street || !validator.isValid(userDetails.billing.address.street)) {
            res.status(400).send({ status: false, message: "Please Enter billing street" })
            return
        }
        userObject.address.shipping.street = userDetails.address.shipping.street;

        if (!userDetails.billing.address.city || !validator.isValid(userDetails.billing.address.city)) {
            res.status(400).send({ status: false, message: "Please Enter billing city" })
            return
        }
        userObject.address.shipping.city = userDetails.address.shipping.city;

        if (!userDetails.billing.address.pincode || !validator.isValid(userDetails.billing.address.pincode)) {
            res.status(400).send({ status: false, message: "Please Enter billing pincode" })
            return
        }
        userObject.address.shipping.pincode = userDetails.address.shipping.pincode;
        userObject.password = await bcrypt.hash(userDetails.password, 10)


        //Generating salt
        //   const salt = await bcrypt.genSalt(10);
        //  userDetails.password = await bcrypt.hash(userDetails.password, salt)
        const createNewUser = await userModel.create(userDetails);
        res.status(201).send({ status: true, message: 'Success', data: createNewUser })
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


module.exports.updateUser = updateUser
