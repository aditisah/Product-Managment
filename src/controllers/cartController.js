const { object } = require("mongoose/lib/utils");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const validator = require("../validator/validator");

const createCart = async function (req, res) {
  const userId = req.params.userId;
  const cartId = req.body.cartId;
  const items = req.body.items;
  console.log(items)
  const productId = items.map((el) => el.productId);
  


//   if(!validator.isValid(items)){
//     res
//         .status(400)
//         .send({ status: false, message: "Please enter item" });
//       return;
//   }
// if(items){
//     productId = req.body.items.map((el) => el.productId);
//  }
  if (userId) {
    if (!validator.isValidObjectId(userId)) {
      res
        .status(400)
        .send({ status: false, message: "userId is not valid id" });
      return;
    }
  }
  if(Object.keys(req.body).length == 0){
    res
        .status(400)
        .send({ status: false, message: "Please add products to the cart" });
      return;
  }
  if(items.length == 0){
    res
        .status(400)
        .send({ status: false, message: "Please provide items" });
      return;
  }
  if (cartId) {
    if (!validator.isValidObjectId(cartId)) {
      res
        .status(400)
        .send({ status: false, message: "cartId is not valid id" });
      return;
    }
  }
  if (productId) {
    productId.map((id) => {
      if (!validator.isValidObjectId(id)) {
        res
          .status(400)
          .send({ status: false, message: "productId is not valid id" });
        return;
      }
    });
  }

  if (userId !== req.userId) {
    res
      .status(403)
      .send({
        status: false,
        message: "userId does not match with loggedin user id",
      });
    return;
  }
  const isProductExist = await productModel.find({
    _id: { $in: productId },
    isDeleted: false,
  });
  let productsPriceArr = isProductExist.map((el) => el.price);
  let totalProductsPrice = productsPriceArr.reduce((acc, el) => acc + el, 0);
  //console.log(isProductExist);
  if (!isProductExist) {
    res.status(404).send({ status: false, message: "Product not found" });
    return;
  }
  if (!cartId) {
    const isCartCreatedWithUser = await cartModel.findOne({ userId });
    if (isCartCreatedWithUser) {
      res
        .status(400)
        .send({
          status: false,
          message:
            "Please provide cartId,cart already has been created with this user!!",
        });
      return;
    } else {
      const cartDeatils = {
        userId: userId,
        items: req.body.items,
        totalPrice:req.body.items.length == 1? isProductExist[0].price: totalProductsPrice,
        totalItems: req.body.items.length,
      };
      let newCart = await cartModel.create(cartDeatils);
      res.status(201).send({ status: true, data: newCart });
      return;
    }
  } else {
    const isCartCreated = await cartModel.findOne({ _id: cartId });
    //console.log(typeof isCartCreated.items)
    if (!isCartCreated) {
      res
        .status(400)
        .send({
          status: false,
          message: "Cart is not created yet with this cartId",
        });
      return;
    }
    const addedProductDetail = {}
    isCartCreated.items.push(...items)
    // const isProductAlreadyAdded = await cartModel.find({productId: {$in: productId}})
    // if(isProductAlreadyAdded.length>0){
    //     for(let i=0;i<isProductAlreadyAdded.length;i++){
    //     addedProductDetail.items[i].quantity = isProductAlreadyAdded.items[i].quantity+
    //     }
    // }
    addedProductDetail.items= isCartCreated.items,
    addedProductDetail.totalPrice= isCartCreated.totalPrice + totalProductsPrice,
    addedProductDetail.totalItems= addedProductDetail.items.length
    console.log(isCartCreated.items)
    let addProductToCart = await cartModel.findOneAndUpdate(
      {userId:userId},
      addedProductDetail,
      { new: true }
    );
    
    res.status(200).send({ status: true, data: addProductToCart });
    return;
  }
};

const getCart = async (req, res) => {
  try{
      let userId = req.params.userId;
      if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Invalid user id`});

      let userData = await userModel.findById(userId);
      if(!userData) return res.status(404).json({status: false, message: `User does not exist`});
      if(req.userId != userData._id.toString()) return res.status(400).json({status: false, message: 'You are not authorize'});

      let cartData = await cartModel.findOne({userId});
      if(!cartData) return res.status(404).json({status: false, message: 'Cart does not exist'});
      res.status(200).json({status: true, message: 'Cart details', data: cartData});
  }
  catch(err){
      res.status(500).json({status: false, message: err.message});
  }
}

const deleteCart = async (req, res) => {
  try{
      let userId = req.params.userId;
      if(!isValidObjectId(userId)) return res.status(400).json({status: false, message: `Invalid user id`});

      let userData = await userModel.findById(userId);
      if(!userData) return res.status(404).json({status: false, message: `User does not exist`});
      if(req.userId != userData._id.toString()) return res.status(400).json({status: false, message: 'You are not authorize'});

      let cartData = await cartModel.findOne({userId});
      if(!cartData) return res.status(404).json({status: false, message: 'Cart does not exist'});
      if(cartData.totalPrice == 0) return res.status(404).json({status: false, message: 'Your cart is empty'});

      let deletion = await cartModel.findOneAndUpdate({userId}, {$set: {items: [], totalPrice: 0, totalItems: 0}});
      res.status(204).json({status: false, message: 'Cart deleted successfully', data: deletion});
  }
  catch(err){
      res.status(500).json({status: false, message: err.message});
  }
}

module.exports = { createCart, getCart, deleteCart };
