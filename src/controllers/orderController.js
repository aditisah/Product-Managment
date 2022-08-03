const { object } = require("mongoose/lib/utils");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const validator = require("../validator/validator");
const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")
  
const createOrder= async function(req,res){
   try{
    let orderDetail= req.body
    const userId = req.params.userId
    if (Object.keys(req.body).length == 0) {
        return res.status(400).send({ status: false, message: "Please Provide Necessary Details to create order", });
    }
           
         
        const order = await orderModel.create(orderDetail)
        res.status(201).send({status:true,message:"success",data:order})


    }
    catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

const updateOrder = async function(req, res){
    try{
    const userId = req.params.userId;

    if(Object.keys(req.body).length == 0){
        res.status(400).send({status: false, message: 'Please provide deatails to update the order status'})
        return
    }
    const { orderId, status } = req.body;

    if(!validator.isValidObjectId(userId)){
        res.status(400).send({status: false, message: 'Please provide valid user id'})
        return
    }
    
    const isUserExist = await userModel.findById(userId)

    if(!isUserExist){
        res.status(404).send({status: false, message: 'User not found!!'})
        return
    }

    if(userId != req.userId){
        res.status(403).send({status: false, message: 'you are not authorized to update other user\'s order'});
        return
    }

    if(!validator.isValid(orderId)){
        res.status(400).send({status: false, message: 'Please provide order id'})
        return
    }
     
    if(!validator.isValidObjectId(orderId)){
        res.status(400).send({status: false, message: 'Please provide valid order id'})
        return
    }

    if(!validator.isValidOrderStatus(status)){
        res.status(400).send({status: false, message: 'Please provide valid order status'})
        return
    }

    const isOrderExist = await orderModel.findOne({ _id: orderId,userId: userId, isDeleted: false })

    if(!isOrderExist){
        res.status(404).send({status: false, message: 'Either you have given the wrong orderId or Order is not made with this user'})
        return
    }

    if(status== 'canceled'){
        if(isOrderExist.cancellable == false){
            res.status(400).send({status: false, message: 'This order is not cancellable'})
            return
        }
    }
    const updateOrderStatus = await orderModel.findOneAndUpdate({_id:orderId}, {$set: {status: status}}, {new: true})
    res.status(200).send({status: true, message: 'Success', data: updateOrderStatus})
    return
    }
    catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}


module.exports={ createOrder, updateOrder }