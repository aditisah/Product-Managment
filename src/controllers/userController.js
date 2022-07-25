const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const validator = require("../validator/validator")
const awsService = require('../aws/config')
const bcrypt = require('bcrypt')

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
        if (!validator.validEmail(email)) {
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

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };

const register = async function(req, res){
    try{
        const userDetails = req.body;
        const files = req.files;
        let uploadProfileImage;
        const validPhoneNumber = /^[6-9][0-9]{9}$/;
        //let {fname, lname, email, profileImage, phone, password} = userDetails;
        if(Object.keys(userDetails).length === 0){
            res.status(400).send({status: false, message: "Please Provide Necessary Details"})
            return
        }
        // const userObject = {};
        // if(!userDetails.fname || !isValid(userDetails.fname)){
        //     res.status(400).send({status: false, message: "Please Enter firstname"})
        //     return
        // }
        // userObject.fname = userDetails.fname;

        // if(!userDetails.lname || !isValid(userDetails.lname)){
        //     res.status(400).send({status: false, message: "Please Enter lastname"})
        //     return
        // }
        // userObject.lname = userDetails.lname;

        // if(!userDetails.email || !isValid(userDetails.email)){
        //     res.status(400).send({status: false, message: "Please Enter firstname"})
        //     return
        // }
        // userObject.email = userDetails.email
        // const isEmailExist = await userModel.findOne({email: userObject.email})
        // if(isEmailExist){
        //     res.status(409).send({status: false, message: "Given email id already exists!!"})
        //     return
        // }

         if(files && files.length>0){
             uploadProfileImage = await awsService.uploadImage(files[0])
         }
         userDetails['profileImage'] = uploadProfileImage;

        // if(!userDetails.phone || !isValid(userDetails.phone)){
        //     res.status(400).send({status: false, message: "Please Enter phone number"})
        //     return
        // }
        // if(!validPhoneNumber.test(userDetails.phone)){
        //     res.status(400).send({status: false, message: "Please Enter valid phone number"})
        //     return
        // }
        // userObject.phone = userDetails.phone;

        // if(!userDetails.address.shipping.street || !isValid(userDetails.address.shipping.street)){
        //     res.status(400).send({status: false, message: "Please Enter street"})
        //     return
        // }
        // userObject.address.shipping.street = userDetails.address.shipping.street;

        // if(!userDetails.address.shipping.city || !isValid(userDetails.address.shipping.city)){
        //     res.status(400).send({status: false, message: "Please Enter city"})
        //     return
        // }
        // userObject.address.shipping.city = userDetails.address.shipping.city;

        // if(!userDetails.address.pincode || !isValid(userDetails.address.pincode)){
        //     res.status(400).send({status: false, message: "Please Enter pincode"})
        //     return
        // }
        // userObject.address.shipping.pincode = userDetails.address.shipping.pincode;

        // if(!userDetails.billing.address.street || !isValid(userDetails.billing.address.street)){
        //     res.status(400).send({status: false, message: "Please Enter street"})
        //     return
        // }
        // userObject.address.shipping.street = userDetails.address.shipping.street;

        // if(!userDetails.billing.address.city || !isValid(userDetails.billing.address.city)){
        //     res.status(400).send({status: false, message: "Please Enter city"})
        //     return
        // }
        // userObject.address.shipping.city = userDetails.address.shipping.city;

        // if(!userDetails.billing.address.pincode || !isValid(userDetails.billing.address.pincode)){
        //     res.status(400).send({status: false, message: "Please Enter pincode"})
        //     return
        // }
        // userObject.address.shipping.pincode = userDetails.address.shipping.pincode;

        //Generating salt
         //const salt = await bcrypt.genSalt(10);
        // userDetails.password = await bcrypt.hash(userDetails.password, salt)
        const createNewUser = await userModel.create(userDetails);
        res.status(201).send({status: true, message: 'Success', data: createNewUser})
    }
   catch(err){
    res.status(500).send({ status: false, message: err.message })
   }
}


module.exports = {userLogin, register}
