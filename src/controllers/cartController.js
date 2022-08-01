const { object } = require("mongoose/lib/utils");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const validator = require("../validator/validator");
const userModel = require("../models/userModel")


const deleteCartbyId= async function(req,res){
try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({ status: false, message: "userId is required" });
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is not valid" });
        }
        if (req.userId == userId) { 
        let user= await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
    
        const cart= await cartModel.findOneAndUpdate({userId},{totalItems:0,totalPrice:0,items:[]}, { new: true });
        if (!cart) {
            return res.status(404).send({ status: true, message: "cart not found " });
        }
    
        return res.status(200).send({ status: true, message: " cart is deleted sucessfully" });
    }
    else{
        return res.status(403).send({ status: false, message: 'You are not authorize to delete the cart' })
    }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }



}
 module.exports={deleteCartbyId}

