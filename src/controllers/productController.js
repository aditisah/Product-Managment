const productModel = require("../models/productModel")
const validator = require("../validator/validator")
const awsService = require("../aws/config")

const createProduct = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide Necessary Details to create product" })
        }
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = req.body
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "please enter title, this field is mandatory" })
        }
        const findTitle = await productModel.findOne({ title })
        if (findTitle) {
            return res.status(409).send({ status: false, message: "product title already present" })
        }
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "please enter description, this field is mandatory" })
        }
        if (!validator.isValid(price) || !validator.isValidDecimalNumber(price)) {
            return res.status(400).send({ status: false, message: "please enter valid price, this field is mandatory" })
        }
        if (!validator.isValid(currencyId) || currencyId.toUpperCase() != "INR") {
            return res.status(400).send({ status: false, message: "please enter valid currencyId, this field is mandatory, e.g: INR" })
        }
        if (!validator.isValid(currencyFormat) || currencyFormat != "₹") {
            return res.status(400).send({ status: false, message: "please enter valid currencyFormat, this field is mandatory, e.g: ₹" })
        }
        if (!validator.isValid(availableSizes) || !validator.isValidSize(availableSizes)) {
            return res.status(400).send({ status: false, message: "please enter valid availableSizes, at least on Size, e.g: M" })
        }
        availableSizes = availableSizes.split(",").map(a => a.trim().toUpperCase())

        let productData = { title, description, price, currencyId, currencyFormat, availableSizes }

        if (isFreeShipping) {
            if (isFreeShipping == "true") {
                productData.isFreeShipping = true
            }
            else if (isFreeShipping == "false") {
                productData.isFreeShipping = true
            }
            else {
                return res.status(400).send({ status: false, message: "isFreeShipping should be true or false" })
            }
        }
        if (isFreeShipping == "") {
            return res.status(400).send({ status: false, message: "you selected the isFreeShipping field but value not provided" })
        }
        if (style) {
            if (!validator.isValid(description)) {
                return res.status(400).send({ status: false, message: "please enter valid style" })
            }
            productData.style = style
        }
        if (style == "") {
            return res.status(400).send({ status: false, message: "you selected the style field but value not provided" })
        }
        if (installments) {
            if (!validator.isValid(installments) || !validator.isValidDecimalNumber(installments)) {
                return res.status(400).send({ status: false, message: "please enter valid installments" })
            }
            productData.installments = installments
        }
        if (installments == "") {
            return res.status(400).send({ status: false, message: "you selected the installments field but value not provided" })
        }

        //product image
        const files = req.files;
        if (files.length == 0) {
            return res.status(400).send({ status: false, message: "please provide profile Image" })
        }
        if (!validator.isValidImage(files[0].originalname.toLowerCase())) {
            return res.status(400).send({ status: false, message: "Image format is not correct" })
        }
        if (files && files.length > 0 && files.length < 2) {
            const uploadproductImage = await awsService.uploadImage(files[0])
            productData.productImage = uploadproductImage
        }
        else {
            return res.status(400).send({ status: false, message: "please provide only one product Image" })
        }

        const createProduct = await productModel.create(productData)
        return res.status(201).send({ status: true, message: "product data create sucessfully", data: createProduct })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getProducts = function (req, res) {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createProduct, getProducts };