const productModel = require("../models/productModel")

const create = async function(req, res){
    let data = req.body
    let createData = await productModel.create(data)
    res.send(createData)
}
const getProducts = async function(req, res){
    try{
        let productDetail = req.query;
        let productFilter = {
            isDeleted: false
        };
        if(productDetail.size){
            productFilter.availableSizes = productDetail.size
        }
        if(productDetail.name){
            productFilter.title = productDetail.name
        }
        if(productDetail.priceLessThan){
            productFilter.price = {$lt: productDetail.priceLessThan}
        }
        if(productDetail.priceGreaterThan){
            if(productFilter.price){
                productFilter.price = {$lt: productDetail.priceLessThan,$gt: productDetail.priceGreaterThan}
            }else{
                productFilter.price = {$gt: productDetail.priceGreaterThan}
            }
            
        }
        let filteredProduct = await productModel.find(productFilter)
        res.status(200).send({status: true, data: filteredProduct})
    }
    catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}

module.exports = { create, getProducts };