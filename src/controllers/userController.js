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

        const files = req.files;
        let uploadProfileImage;
        if (!validator.isValidImage(files[0].originalname.toLowerCase())) {
            return res.status(400).send({ status: false, message: "Image format is not correct" })
        }
        if (files && files.length > 0 && files.length < 2) {
            uploadProfileImage = await awsService.uploadImage(files[0])
        }
        else {
            return res.status(400).send({ status: false, message: "please provide only one file" })
        }
        userObject['profileImage'] = uploadProfileImage;

        const createNewUser = await userModel.create(userObject);
        return res.status(201).send({ status: true, message: 'Success', data: createNewUser })
    }
    catch (err) {
        console.log(err)
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
            return res.status(404).send({ status: false, message: `User not found for this email: ${email}` })
        }
        const decodePassword = await bcrypt.compare(password, findUser.password)
        if (decodePassword) {
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
            res.setHeader("Authorization", "Bearer "+token)
            return res.status(200).send({ status: true, message: "User login successfull, token will be valid for 24 hrs", data: { userId: findUser._id, token } })
        }
        else {
            return res.status(404).send({ status: false, message: `Password is wrong for this emial: ${email}`})
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

const getProfile = async (req, res) => {
    try {
        let userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({ status: false, message: 'User Id is required' });
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'User Id is not valid' });
        }
        if (req.userId == userId) {
            const user = await userModel.findOne({ _id: userId });
            if (user) {
                return res.status(200).send({ status: true, message: 'User Profile Details', data: user });
            }
            else {
                return res.status(404).send({ status: false, message: 'User not found' });
            }
        }
        else {
            return res.status(403).send({ status: false, message: 'You are not authorize to see others profile' });
        }
    }
    catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
}



module.exports = { register, userLogin, getProfile, updateUser };
