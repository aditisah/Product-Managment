const { object } = require("mongoose/lib/utils");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const validator = require("../validator/validator");
const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")

const createOrder = async function (req, res) {
    try {
        let orderDetail = req.body
        const userId = req.params.userId
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide Necessary Details to create order", });
        }


        const order = await orderModel.create(orderDetail)
        res.status(201).send({ status: true, message: "success", data: order })


    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = { createOrder }