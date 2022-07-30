const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const validator = require("../validator/validator")

const createCart = async function (req, res) {
    try {
        const createCart = await cartModel.create(req.body)
        return res.status(201).send({ status: true, message: "cart created successfully", data: createCart })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const cartUpdate = async function (req, res) {
    try {
        const userId = req.params.userId
        //user
        if (!userId) {
            return res.status(400).send({ status: false, message: "Please Enter userId" })
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please Enter valid userId" })
        }
        const findUser = await userModel.findById(userId)
        if (!findUser) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }
        //user Authorization
        if (req.userId == userId) {
            if (Object.keys(req.body).length == 0) {
                return res.status(400).send({ status: false, message: "Please enter required data to update cart" })
            }
            const { cartId, productId, removeProduct } = req.body
            //cart
            if (!cartId) {
                return res.status(400).send({ status: false, message: "Please Enter cartId, this field is mandatory" })
            }
            if (!validator.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "Please Enter valid cartId" })
            }
            const findCart = await cartModel.findOne({ _id: cartId, userId })
            if (!findCart) {
                return res.status(404).send({ status: false, message: "Cart Not Found" })
            }
            //product
            if (!productId) {
                return res.status(400).send({ status: false, message: "Please Enter productId, this field is mandatory" })
            }
            if (!validator.isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: "Please Enter valid productId" })
            }
            const findProduct = await productModel.findOne({ _Id: productId, isDeleted: false })
            if (!findProduct) {
                return res.status(404).send({ status: false, message: "Product Not Found" })
            }
            //finding product Index number
            const findProductIndexFromCart = findCart.items.findIndex(product => product.productId == productId)
            if (findProductIndexFromCart == -1) {
                return res.status(404).send({ status: false, message: "Product Not Found in Your Cart" })
            }
            //removeProduct
            if (!removeProduct) {
                return res.status(400).send({ status: false, message: "Please Enter removeProduct, this field is mandatory" })
            }
            if (removeProduct == 0 || removeProduct == 1) {
                let filteredProduct
                //removeProduct is 0
                if (removeProduct == 0 || findCart.items[findProductIndexFromCart].quantity - 1 == 0) {
                    filteredProduct = {
                        totalPrice: findCart.totalPrice - findProduct.price * findCart.items[findProductIndexFromCart].quantity,
                        $pull: { items: { productId } },
                        totalItems: findCart.totalItems - 1
                    }
                }
                //removeProduct is 1
                if (removeProduct == 1 && findCart.items[findProductIndexFromCart].quantity - 1 != 0) {
                    filteredProduct = {
                        totalPrice: findCart.totalPrice - findProduct.price,
                        $set: { "items.$.quantity": findCart.items[findProductIndexFromCart].quantity - 1 }
                    }
                }
                //update cart
                const updateCart = await cartModel.findOneAndUpdate({ _id: cartId, items: { $elemMatch: { productId: productId } } }, filteredProduct, { new: true })
                return res.status(200).send({ status: true, message: "cart update successfully", data: updateCart })
            }
            else {
                return res.status(400).send({ status: false, message: "Please Enter valid removeProduct Number from 0 or 1" })
            }
        }
        else {
            return res.status(403).send({ status: false, message: "you are not authorize to update cart" })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createCart, cartUpdate }