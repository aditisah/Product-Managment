const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const validator = require("../validator/validator")
const awsService = require('../aws/config')

const register = async function (req, res) {
    try {
        const userDetails = req.body;
        const files = req.files;
        let uploadProfileImage;
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
             res.status(400).send({ status: false, message: "Please Enter email" })
             return
         }
         userObject.email = userDetails.email
         const isEmailExist = await userModel.findOne({ email: userDetails.email })
         if (isEmailExist) {
             res.status(409).send({ status: false, message: "Given email id already exists!!" })
             return
         }

         if(!validator.isValidImage(files[0].originalname.toLowerCase())){
             return res.status(400).send({ status: false, message: "Image format is not correct" })
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
         const isPhoneUnique = await userModel.findOne({phone:userObject.phone});
         if(isPhoneUnique){
            res.status(400).send({ status: false, message: "Phone number already exists" })
            return
         }
         const address = JSON.parse(userDetails.address)
         console.log(address)
         if (!address.shipping.street || !validator.isValid(address.shipping.street)) {
             res.status(400).send({ status: false, message: "Please Enter shipping street" })
             return
         }

         if (!address.shipping.city || !validator.isValid(address.shipping.city)) {
             res.status(400).send({ status: false, message: "Please Enter shipping city" })
             return
         }
         

         if (!address.shipping.pincode || !validator.isValidPincode(address.shipping.pincode)) {
             res.status(400).send({ status: false, message: "Please Enter shipping pincode" })
             return
         }

         if (!address.billing.street || !validator.isValid(address.billing.street)) {
             res.status(400).send({ status: false, message: "Please Enter billing street" })
             return
         }
         

         if (!address.billing.city || !validator.isValid(address.billing.city)) {
             res.status(400).send({ status: false, message: "Please Enter billing city" })
             return
         }

         if (!address.billing.pincode || !validator.isValid(address.billing.pincode)) {
             res.status(400).send({ status: false, message: "Please Enter billing pincode" })
             return
         }
         userObject.address = address;

        //Encrypting password
        userObject.password = await bcrypt.hash(userDetails.password, 10)

        //Uploading file
        if (files && files.length > 0) {
            uploadProfileImage = await awsService.uploadImage(files[0])
        }
        userObject['profileImage'] = uploadProfileImage;

        const createNewUser = await userModel.create(userObject);
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
         //const encryptPassword = await bcrypt.hash(password, 10)
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
