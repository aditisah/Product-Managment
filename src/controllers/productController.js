const productModel = require("../models/productModel");

const create = async function (req, res) {
  let data = req.body;
  let createData = await productModel.create(data);
  res.send(createData);
};
const getProducts = async function (req, res) {
  try {
    let productDetail = req.query;
    let productFilter = {
      isDeleted: false,
    };

    if (Object.keys(productDetail).includes('size')) {
      if (productDetail.size.length == 0 || productDetail.size.trim() == '') {
        res.status(400).send({ status: false, message: 'you selected the size field but value not provided' });
        return;
      }
    }
    if (Object.keys(productDetail).includes('name')) {
    if (productDetail.name.length == 0 || productDetail.name.trim() == "''") {
      res.status(400).send({ status: false, message: 'you selected the name field but value not provided' });
      return;
    }
}
if (Object.keys(productDetail).includes('priceLessThan')) {
    if (productDetail.priceLessThan.length.trim() == 0) {
      res
        .status(400)
        .send({ status: false, message: 'you selected the priceLessThan field but value not provided' });
      return;
    }
}
if (Object.keys(productDetail).includes('priceGreaterThan')) {
    if (productDetail.priceGreaterThan.trim().length == 0) {
      res
        .status(400)
        .send({ status: false, message: 'you selected the priceGreaterThan field but value not provided' });
      return;
    }
}
    if (productDetail.size) {
      productFilter.availableSizes = productDetail.size;
    }
    if (productDetail.name) {
      productFilter.title = {$regex: productDetail.name, $options: "i"};
    }
    if (productDetail.priceLessThan) {
      productFilter.price = { $lt: productDetail.priceLessThan };
    }
    if (productDetail.priceGreaterThan) {
      if (productFilter.price) {
        productFilter.price = {
          $lt: productDetail.priceLessThan,
          $gt: productDetail.priceGreaterThan,
        };
      } else {
        productFilter.price = { $gt: productDetail.priceGreaterThan };
      }
    }

    let filteredProduct = await productModel
      .find(productFilter)
      .sort({ price: 1 });
      if(filteredProduct.length==0){
        res.status(404).send({status: false, message: 'No product found!!'})
        return
      }else{
    res
      .status(200)
      .send({ status: true, message: "Success", data: filteredProduct });
      return
      }
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { create, getProducts };
