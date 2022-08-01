const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const validator = require("../validator/validator");

const createCart = async function (req, res) {
  const userId = req.params.userId;
  const {cartId, productId} = req.body;
  if(req.body.quantity<=0){
    res
          .status(400)
          .send({ status: false, message: "Please enter the quantity of the product atleast 1" });
        return;
  }
  const quantity = req.body.quantity?req.body.quantity:1;
  
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
        .send({ status: false, message: "Please add product to the cart" });
      return;
  }
  if(!validator.isValid(productId)){
    res
        .status(400)
        .send({ status: false, message: "Please enter productId" });
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
      if (!validator.isValidObjectId(productId)) {
        res
          .status(400)
          .send({ status: false, message: "productId is not valid id" });
        return;
      }
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
  const isProductExist = await productModel.findOne({
    _id: productId,
    isDeleted: false,
  });
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
      console.log(isProductExist.price)
      console.log(quantity)
      const cartDeatils = {
        userId: userId,
        items: {
          productId: productId,
          quantity: quantity
        },
        totalPrice:(isProductExist.price*quantity),
        totalItems: 1,
      };
      let newCart = await cartModel.create(cartDeatils);
      res.status(201).send({ status: true, data: newCart });
      return;
    }
  } else {
    const isCartCreated = await cartModel.findOne({ _id: cartId, userId: userId });
    if (!isCartCreated) {
      res
        .status(400)
        .send({
          status: false,
          message: "Cart is not created with this cartId",
        });
      return;
    }
      const isProductExistInCart = await cartModel.findOne({_id: cartId, items: {$elemMatch: {productId}}})
      const addedProductDetail = {}
      if(!isProductExistInCart){
    let items = {
      productId: productId,
      quantity: quantity
    }
    isCartCreated.items.push(items)
    addedProductDetail.items= isCartCreated.items
    
    //console.log(isCartCreated.items)
      }else{
       // console.log(isCartCreated)
        console.log(isProductExistInCart.items.productId)
        addedProductDetail.items = isCartCreated.items.map(el=>{
          console.log(el.productId)
        if(el.productId==productId){
          el.quantity += quantity
        }
        return el
       })
      }
      addedProductDetail.totalPrice= isCartCreated.totalPrice + (isProductExist.price*quantity),
    addedProductDetail.totalItems= addedProductDetail.items.length
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
