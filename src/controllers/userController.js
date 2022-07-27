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
             res.status(400).send({ status: false, message: "Please Enter email" })
             return
         }
         userObject.email = userDetails.email
         const isEmailExist = await userModel.findOne({ email: userDetails.email })
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
         const isPhoneUnique = await userModel.findOne({phone:userObject.phone});
         if(isPhoneUnique){
            res.status(400).send({ status: false, message: "Phone number already exists" })
            return
        }
        const address = JSON.parse(userDetails.address)
        
        if (Object.keys(address).length == 0 || userDetails.address == "") {
            return res.status(400).send({ status: false, message: "please Enter address, this field is mandatory" })
        }
        //shipping address
        if (Object.keys(address.shipping).length == 0 || userDetails.address.shipping == "") {
            return res.status(400).send({ status: false, message: "please Enter Shipping address, this field is mandatory" })
        }
        if (!address.shipping.street || !validator.isValid(address.shipping.street)) {
            res.status(400).send({ status: false, message: "Please Enter shipping street, this field is mandatory" })
            return
        }

        if (!address.shipping.city || !validator.isValid(address.shipping.city)) {
            res.status(400).send({ status: false, message: "Please Enter shipping city, this field is mandatory" })
            return
        }

        if (!address.shipping.pincode || !validator.isValidPincode(address.shipping.pincode)) {
            res.status(400).send({ status: false, message: "Please Enter valid shipping pincode, length should be 6, this field is mandatory." })
            return
        }
        //billing address
        if (Object.keys(address.billing).length == 0 || userDetails.address.billing == "") {
            return res.status(400).send({ status: false, message: "please Enter billing address, this field is mandatory" })
        }
        if (!address.billing.street || !validator.isValid(address.billing.street)) {
            res.status(400).send({ status: false, message: "Please Enter billing street, this field is mandatory" })
            return
        }

        if (!address.billing.city || !validator.isValid(address.billing.city)) {
            res.status(400).send({ status: false, message: "Please Enter billing city, this field is mandatory" })
            return
        }

        if (!address.billing.pincode || !validator.isValidPincode(address.billing.pincode)) {
            res.status(400).send({ status: false, message: "Please Enter valid billing pincode, length should be 6, this field is mandatory." })
            return
        }
        userObject.address = address;
        //password
        if (!userDetails.password || !validator.isValidPassword(userDetails.password)) {
            return res.status(400).send({ status: false, message: "please enter valid password, length should be between 8 to 15, this field is mandatory." })
        }
        //Encrypting password
        userObject.password = await bcrypt.hash(userDetails.password,10)

        //Uploading file
        const files = req.files;
        if (!validator.isValidImage(files[0].originalname.toLowerCase())) {
            return res.status(400).send({ status: false, message: "Image format is not correct" })
        }
        if (files && files.length > 0 && files.length < 2) {
            const uploadProfileImage = await awsService.uploadImage(files[0])
            userObject['profileImage'] = uploadProfileImage;
        }
        else {
            return res.status(400).send({ status: false, message: "please provide only one file" })
        }
        const createNewUser = await userModel.create(userObject);
        return res.status(201).send({ status: true, message: 'Success', data: createNewUser })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
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
            res.setHeader("Authorization", "Bearer " + token)
            return res.status(200).send({ status: true, message: "User login successfull, token will be valid for 24 hrs", data: { userId: findUser._id, token } })
        }
        else {
            return res.status(404).send({ status: false, message: `Password is wrong for this emial: ${email}` })
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
        res.status(500).send({ status: false, message: err.message });
    }
}

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        const userDetails = req.body
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Incorrect userId format" })
        }
        //Authorization
        if (req.userId == userId) {
            if (Object.keys(userDetails).length === 0) {
                res.status(400).send({ status: false, message: "Please Enter Details to Update" })
                return
            }
            let userObject = {}
            //fname
            if (userDetails.fname) {
                if (!validator.isValid(userDetails.fname)) {
                    res.status(400).send({ status: false, message: "Please Enter vaild firstname" })
                    return
                }
                userObject.fname = userDetails.fname;
            }
            if (userDetails.fname == "") {
                return res.status(400).send({ status: false, message: "you selected the firstname field but value not provided" })
            }
            //lname
            if (userDetails.lname) {
                if (!validator.isValid(userDetails.lname)) {
                    res.status(400).send({ status: false, message: "Please Enter valid lastname" })
                    return
                }
                userObject.lname = userDetails.lname;
            }
            if (userDetails.lname == "") {
                return res.status(400).send({ status: false, message: "you selected the lastname field but value not provided" })
            }
            //email
            if (userDetails.email) {
                if (!validator.isValidEmail(userDetails.email)) {
                    res.status(400).send({ status: false, message: "Please Enter valid email" })
                    return
                }
                const findEmail = await userModel.findOne({ email: userDetails.email })
                if (findEmail) {
                    return res.status(409).send({ status: false, message: "email is already use" })
                }
                userObject.email = userDetails.email
            }
            if (userDetails.email == "") {
                return res.status(400).send({ status: false, message: "you selected the email field but value not provided" })
            }
            //phone
            if (userDetails.phone) {
                if (!validator.isValidPhone(userDetails.phone)) {
                    res.status(400).send({ status: false, message: "Please Enter valid phone" })
                    return
                }
                const findPhone = await userModel.findOne({ phone: userDetails.phone })
                if (findPhone) {
                    return res.status(409).send({ status: false, message: "phone number is already use" })
                }
                userObject.phone = userDetails.phone
            }
            if (userDetails.phone == "") {
                return res.status(400).send({ status: false, message: "you selected the phone field but value not provided" })
            }
            //address
            if (userDetails.address) {
                const address = JSON.parse(userDetails.address)
                if (Object.keys(address).length == 0) {
                    return res.status(400).send({ status: false, message: "Please Enter shipping or biling address" })
                }
                userObject.address = {};
                //shipping address
                if (address.shipping) {
                    if (Object.keys(address.shipping).length == 0) {
                        return res.status(400).send({ status: false, message: "Please Enter shipping address" })
                    }
                    userObject.address.shipping = {}
                    if (address.shipping.street) {
                        if (!validator.isValid(address.shipping.street)) {
                            return res.status(400).send({ status: false, message: "Please Enter valid shipping address street" })
                        }
                        userObject.address.shipping.street = address.shipping.street
                    }
                    if (address.shipping.street == "") {
                        return res.status(400).send({ status: false, message: "you selected the shipping address street field but value not provided" })
                    }
                    if (address.shipping.city) {
                        if (!validator.isValid(address.shipping.city)) {
                            return res.status(400).send({ status: false, message: "Please Enter valid shipping address city" })
                        }
                        userObject.address.shipping.city = address.shipping.city
                    }
                    if (address.shipping.city == "") {
                        return res.status(400).send({ status: false, message: "you selected the shipping address street field but value not provided" })
                    }
                    if (address.shipping.pincode) {
                        if (!validator.isValidPincode(address.shipping.pincode)) {
                            return res.status(400).send({ status: false, message: "Please Enter valid shipping address street" })
                        }
                        userObject.address.shipping.pincode = address.shipping.pincode
                    }
                    if (address.shipping.pincode == "") {
                        return res.status(400).send({ status: false, message: "you selected the shipping address pincode field but value not provided" })
                    }
                }
                if (address.shipping == "") {
                    return res.status(400).send({ status: false, message: "you selected the shipping address field but value not provided" })
                }
                //billing address
                if (address.billing) {
                    if (Object.keys(address.billing).length == 0) {
                        return res.status(400).send({ status: false, message: "Please Enter billing address" })
                    }
                    userObject.address.billing = {}
                    if (address.billing.street) {
                        if (!validator.isValid(address.billing.street)) {
                            return res.status(400).send({ status: false, message: "Please Enter valid billing address street" })
                        }
                        userObject.address.billing.street = address.billing.street
                    }
                    if (address.billing.street == "") {
                        return res.status(400).send({ status: false, message: "you selected the billing address street field but value not provided" })
                    }
                    if (address.billing.city) {
                        if (!validator.isValid(address.billing.city)) {
                            return res.status(400).send({ status: false, message: "Please Enter valid billing address city" })
                        }
                        userObject.address.billing.city = address.billing.city
                    }
                    if (address.billing.city == "") {
                        return res.status(400).send({ status: false, message: "you selected the billing address street field but value not provided" })
                    }
                    if (address.billing.pincode) {
                        if (!validator.isValidPincode(address.billing.pincode)) {
                            return res.status(400).send({ status: false, message: "Please Enter valid billing address pincode" })
                        }
                        userObject.address.billing.pincode = address.billing.pincode
                    }
                    if (address.billing.pincode == "") {
                        return res.status(400).send({ status: false, message: "you selected the billing address pincode field but value not provided" })
                    }
                }
                if (address.billing == "") {
                    return res.status(400).send({ status: false, message: "you selected the billing address field but value not provided" })
                }
            }
            if (userDetails.address == "") {
                return res.status(400).send({ status: false, message: "you selected the address field but value not provided" })
            }

            //password
            if (userDetails.password) {
                if (!validator.isValidPassword(userDetails.password)) {
                    return res.status(400).send({ status: false, message: "password length should be between 8 to 15" })
                }
                //Encrypting password
                userObject.password = await bcrypt.hash(userDetails.password, 10)
            }
            if (userDetails.password == "") {
                return res.status(400).send({ status: false, message: "you selected the password field but value not provided" })
            }

            //Uploading profile image
            const files = req.files;
            if (files.length > 0) {
                if (!validator.isValidImage(files[0].originalname.toLowerCase())) {
                    return res.status(400).send({ status: false, message: "Image format is not correct" })
                }
                if (files && files.length > 0 && files.length < 2) {
                    const uploadProfileImage = await awsService.uploadImage(files[0])
                    userObject['profileImage'] = uploadProfileImage;
                }
                else {
                    return res.status(400).send({ status: false, message: "please provide only one file" })
                }
            }

            const updateduser = await userModel.findByIdAndUpdate({ _id: userId }, { $set: userObject }, { new: true });
            return res.status(200).send({ status: true, message: "Success", data: updateduser })
        }
        else {
            return res.status(403).send({ status: false, message: "You are not authorize to update other profile" })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { register, userLogin, getProfile, updateUser };
