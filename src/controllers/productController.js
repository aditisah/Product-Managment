const productModel = require("../models/productModel")

const getProducts = function(req, res){
    try{

    }
    catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}

module.exports = { getProducts };