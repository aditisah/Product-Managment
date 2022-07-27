const productModel = require("../models/productModel")
const validator = require("../validator/validator")




const getProductbyId = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!productId) {
            return res.status(400).send({ status: false, message: "productId is required" });
        }
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is not valid" });
        }
        
            const getproduct = await productModel.findOne({ _id: productId, isDeleted: false });
           
            if(!getproduct){
               return res.send({status:false,message:"productId not found"})
            }
            return res.status(200).send({ status: true, message: "product details", data: getproduct })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const deleteProductbyId = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!productId) {
            return res.status(400).send({ status: false, message: "productId is required" });
        }
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is not valid" });
        }
       const product = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt:new Date()}, { new: true })
            if (!product) {
              return res.status(200).send({ status: true, message: "product is  already deleted " })
            }
                 return res.status(200).send({ status: true, message: "product is deleted sucessfully" })
                }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { getProductbyId, deleteProductbyId};