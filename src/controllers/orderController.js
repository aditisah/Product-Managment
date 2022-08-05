const cartModel = require("../models/cartModel");
const validator = require("../validator/validator");
const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel");

const createOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }
        const findUser = await userModel.findById(userId)
        if (!findUser) {
            return res.status(404).send({ status: false, message: 'user not found' })
        }
        if (userId == req.userId) {
            if (Object.keys(req.body).length == 0) {
                return res.status(400).send({ status: false, message: "Please Provide Necessary Details to create order", });
            }
            const { cartId, cancellable } = req.body
            if (!validator.isValid(cartId)) {
                return res.status(400).send({ status: false, message: 'Please provide cartId' })
            }
            if (!validator.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: 'Please provide valid cart Id' })
            }
            const findCart = await cartModel.findOne({ _id: cartId, userId }).select({ userId: 1, _id: 0, items: 1, totalPrice: 1, totalItems: 1 })
            if (!findCart) {
                return res.status(404).send({ status: false, message: 'cart not found for loggedin user' })
            }
            if (findCart.totalItems == 0) {
                return res.status(400).send({ status: false, message: 'no product found in cart to order' })
            }
            let orderDetail = {
                userId: userId,
                items: findCart.items,
                totalPrice: findCart.totalPrice,
                totalItems: findCart.totalItems,
                totalQuantity: findCart.items.reduce((a, b) => { return a + b.quantity }, 0)
            }
            if (Object.keys(req.body).includes("cancellable")) {
                if (!validator.isValid(cancellable)) {
                    return res.status(400).send({ status: false, message: 'You have selected the cancellable key, but value not provided' })
                }
                if (cancellable.toString().toLowerCase() == 'true' || cancellable.toString().toLowerCase() == 'false') {
                    orderDetail.cancellable = cancellable.toString().toLowerCase()
                }
                else {
                    return res.status(400).send({ status: false, message: 'please enter only true or false in cancellable' })
                }
            }
            const order = await orderModel.create(orderDetail)
            await cartModel.findByIdAndUpdate(cartId, { items: [], totalPrice: 0, totalItems: 0 })
            res.status(201).send({ status: true, message: "success", data: order })
        }
        else {
            return res.status(403).send({ status: false, message: 'You are not authorized to order' })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId;

        if (Object.keys(req.body).length == 0) {
            res.status(400).send({ status: false, message: 'Please provide deatails to update the order status' })
            return
        }
        const { orderId, status } = req.body;

        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: 'Please provide valid user id' })
            return
        }
        const isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            res.status(404).send({ status: false, message: 'User not found!!' })
            return
        }

        if (userId != req.userId) {
            res.status(403).send({ status: false, message: 'you are not authorized to update other user\'s order' });
            return
        }

        if (!validator.isValid(orderId)) {
            res.status(400).send({ status: false, message: 'Please provide order id' })
            return
        }

        if (!validator.isValidObjectId(orderId)) {
            res.status(400).send({ status: false, message: 'Please provide valid order id' })
            return
        }

        if(!validator.isValid(status)){
            res.status(400).send({ status: false, message: 'Please provide order status to update' })
            return
        }

        if (!validator.isValidOrderStatus(status)) {
            res.status(400).send({ status: false, message: 'Please provide valid order status' })
            return
        }

        const isOrderExist = await orderModel.findOne({ _id: orderId, userId: userId, isDeleted: false })

        if (!isOrderExist) {
            res.status(404).send({ status: false, message: 'Either you have given the wrong orderId or Order is not made with this user' })
            return
        }

        if(isOrderExist.status == 'canceled'){
            res.status(400).send({ status: false, message: 'This order is already cancelled' })
            return
        }

        if(isOrderExist.status == 'completed'){
            res.status(400).send({ status: false, message: 'This order is completed' })
            return
        }
        if (status == 'canceled') {
            if (isOrderExist.cancellable == false) {
                res.status(400).send({ status: false, message: 'This order is not cancellable' })
                return
            }
        }
        const updateOrderStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })
        res.status(200).send({ status: true, message: 'Success', data: updateOrderStatus })
        return
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = { createOrder, updateOrder }
