const { object } = require("mongoose/lib/utils");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const validator = require("../validator/validator");
const userModel = require("../models/userModel")
  
const createOrder= async function(req,res){
   try{
    if (Object.keys(req.body).length == 0) {
        return res.status(400).send({ status: false, message: "Please Provide Necessary Details to create order", });
    }

    }
    catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

module.exports={createOrder}