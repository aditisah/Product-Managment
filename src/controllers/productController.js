const productModel = require("../models/productModel");
const validator = require("../validator/validator");
const awsService = require("../aws/config");

const createProduct = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide Necessary Details to create product", });
        }
        let { title, description, price, isFreeShipping, style, availableSizes, installments } = req.body;
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "please enter title, this field is mandatory" });
        }
        const findTitle = await productModel.findOne({ title });
        if (findTitle) {
            return res.status(409).send({ status: false, message: "product title already present" });
        }
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "please enter description, this field is mandatory" });
        }
        if (!validator.isValid(price) || !validator.isValidDecimalNumber(price)) {
            return res.status(400).send({ status: false, message: "please enter valid price, this field is mandatory" });
        }
        if (!validator.isValid(availableSizes) || !validator.isValidSize(availableSizes)) {
            return res.status(400).send({ status: false, message: "please enter valid availableSizes, at least one Size, e.g: M" });
        }
        availableSizes = availableSizes.split(",").map((a) => a.trim().toUpperCase());
        availableSizes = [...new Set(availableSizes)];

        let productData = { title, description, price, currencyId: "INR", currencyFormat: "₹", availableSizes };

        if (isFreeShipping) {
            if (isFreeShipping == "true") {
                productData.isFreeShipping = true;
            }
            else if (isFreeShipping == "false") {
                productData.isFreeShipping = false;
            }
            else {
                return res.status(400).send({ status: false, message: "isFreeShipping should be true or false" });
            }
        }
        if (isFreeShipping == "") {
            return res.status(400).send({ status: false, message: "you selected the isFreeShipping field but value not provided" });
        }
        if (style) {
            if (!validator.isValid(style)) {
                return res.status(400).send({ status: false, message: "please enter valid style" });
            }
            productData.style = style;
        }
        if (style == "") {
            return res.status(400).send({ status: false, message: "you selected the style field but value not provided" });
        }
        if (installments) {
            if (!validator.isValid(installments) || !validator.isValidDecimalNumber(installments)) {
                return res.status(400).send({ status: false, message: "please enter valid installments" });
            }
            productData.installments = installments;
        }
        if (installments == "") {
            return res.status(400).send({ status: false, message: "you selected the installments field but value not provided" });
        }

        //product image
        const files = req.files;
        if (files.length == 0) {
            return res.status(400).send({ status: false, message: "please provide product Image" });
        }
        if (!validator.isValidImage(files[0].originalname.toLowerCase())) {
            return res.status(400).send({ status: false, message: "Image format is not correct" });
        }
        if (files && files.length > 0 && files.length < 2) {
            const uploadproductImage = await awsService.uploadImage(files[0]);
            productData.productImage = uploadproductImage;
        }
        else {
            return res.status(400).send({ status: false, message: "please provide only one product Image" });
        }

        const createProduct = await productModel.create(productData);
        return res.status(201).send({ status: true, message: "Success", data: createProduct });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};

const getProducts = async function (req, res) {
    try {
        let productDetail = req.query;
        let productFilter = { isDeleted: false };

        if (Object.keys(productDetail).includes("size")) {
            if (!validator.isValid(productDetail.size)) {
                res.status(400).send({ status: false, message: "you selected the size field but value not provided", });
                return;
            }
        }
        if (Object.keys(productDetail).includes("name")) {
            if (!validator.isValid(productDetail.name)) {
                res.status(400).send({ status: false, message: "you selected the name field but value not provided", });
                return;
            }
        }
        if (Object.keys(productDetail).includes("priceLessThan")) {
            if (!validator.isValid(productDetail.priceLessThan)) {
                res.status(400).send({ status: false, message: "you selected the priceLessThan field but value not provided", });
                return;
            }
        }
        if (Object.keys(productDetail).includes("priceGreaterThan")) {
            if (!validator.isValid(productDetail.priceGreaterThan)) {
                res.status(400).send({ status: false, message: "you selected the priceGreaterThan field but value not provided", });
                return;
            }
        }
        if (productDetail.size) {
            let sizeArr = productDetail.size.split(",");
            productFilter.availableSizes = { $in: sizeArr };
        }
        if (productDetail.name) {
            productFilter.title = { $regex: productDetail.name, $options: "i" };
        }
        if (productDetail.priceLessThan) {
            productFilter.price = { $lt: productDetail.priceLessThan };
        }
        if (productDetail.priceGreaterThan) {
            if (productFilter.price) {
                productFilter.price = {
                    $lt: productDetail.priceLessThan,
                    $gt: productDetail.priceGreaterThan,
                };
            }
            else {
                productFilter.price = { $gt: productDetail.priceGreaterThan };
            }
        }
        let priceSortObj = { price: 1 }
        if (productDetail.priceSort) {
            if (productDetail.priceSort == 1 || productDetail.priceSort == -1) {
                priceSortObj.price = productDetail.priceSort
            }
            else {
                res.status(400).send({ status: false, message: 'Please enter valid value for sorting e.g. 1 or -1' })
                return
            }
        }
        let filteredProduct = await productModel.find(productFilter).sort(priceSortObj);
        if (filteredProduct.length == 0) {
            res.status(404).send({ status: false, message: "No product found!!" });
            return;
        }
        else {
            res.status(200).send({ status: true, message: "Success", data: filteredProduct });
            return;
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};

const getProductbyId = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).send({ status: false, message: "productId is required" });
        }
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is not valid" });
        }

        const getproduct = await productModel.findOne({ _id: productId, isDeleted: false, });

        if (!getproduct) {
            return res.status(404).send({ status: false, message: "product not found" });
        }
        return res.status(200).send({ status: true, message: "Success", data: getproduct });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId" })
        }
        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "No product found" })
        }
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide atleast one data to update product" })
        }
        let { title, description, price, isFreeShipping, style, availableSizes, installments } = req.body
        let productData = {}
        //title
        if (title) {
            if (!validator.isValid(title)) {
                return res.status(400).send({ status: false, message: "please enter title" })
            }
            const findTitle = await productModel.findOne({ title })
            if (findTitle) {
                return res.status(409).send({ status: false, message: "product title already present" })
            }
            productData.title = title
        }
        if (title == "") {
            return res.status(400).send({ status: false, message: "you selected the title field but value not provided" })
        }

        //description
        if (description) {
            if (!validator.isValid(description)) {
                return res.status(400).send({ status: false, message: "please enter description" })
            }
            productData.description = description
        }
        if (description == "") {
            return res.status(400).send({ status: false, message: "you selected the description field but value not provided" })
        }

        //price
        if (price) {
            if (!validator.isValid(price) || !validator.isValidDecimalNumber(price)) {
                return res.status(400).send({ status: false, message: "please enter valid price" })
            }
            productData.price = price
        }
        if (price == "") {
            return res.status(400).send({ status: false, message: "you selected the price field but value not provided" })
        }
        //availableSizes
        if (availableSizes) {
            if (!validator.isValid(availableSizes) || !validator.isValidSize(availableSizes)) {
                return res.status(400).send({ status: false, message: "please enter valid availableSizes, at least one Size, e.g: M" })
            }
            availableSizes = availableSizes.trim().split(",").map(a => a.trim().toUpperCase())
            availableSizes = [...new Set(availableSizes)]
            productData.$addToSet = { availableSizes: { $each: availableSizes } }
        }
        if (availableSizes == "") {
            return res.status(400).send({ status: false, message: "you selected the availableSizes field but value not provided" })
        }
        //isFreeShipping
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
        //style
        if (style) {
            if (!validator.isValid(style)) {
                return res.status(400).send({ status: false, message: "please enter valid style" })
            }
            productData.style = style
        }
        if (style == "") {
            return res.status(400).send({ status: false, message: "you selected the style field but value not provided" })
        }
        //installments
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
        const files = req.files
        if (files.length > 0) {
            if (files && files.length < 2) {
                if (!validator.isValidImage(files[0].originalname.toLowerCase())) {
                    return res.status(400).send({ status: false, message: "Image format is not correct" })
                }
                const uploadproductImage = await awsService.uploadImage(files[0])
                productData.productImage = uploadproductImage
            }
            else {
                return res.status(400).send({ status: false, message: "please provide only one product Image" })
            }
        }

        if (Object.keys(productData).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide valid data to update product" })
        }
        const updatedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, productData, { new: true });
        return res.status(200).send({ status: true, message: "Success", data: updatedProduct })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const deleteProductbyId = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).send({ status: false, message: "productId is required" });
        }
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is not valid" });
        }
        const product = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });
        if (!product) {
            return res.status(404).send({ status: true, message: "product not found " });
        }
        return res.status(200).send({ status: true, message: "product is deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { createProduct, getProducts, getProductbyId, updateProduct, deleteProductbyId };
