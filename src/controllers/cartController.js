const productModel = require("../models/productModel");
const validator = require("../validator/validator");
const userModel = require("../models/userModel")
const cartModel = require("../models/cartModel")


const deleteCartbyId= async function(req,res){

    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({ status: false, message: "userId is required" });
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is not valid" });
        }
        let user= await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
    
        const cart= await cartModel.findOneAndUpdate({_id:userId},{ totalPrice:0,totalPrice:0 }, { new: true });
        
        if (!cart) {
            return res.status(404).send({ status: true, message: "cart not found " });
        }
        return res.status(200).send({ status: true, message: " cart is deleted sucessfully" });
    
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }



}
 module.exports={deleteCartbyId}