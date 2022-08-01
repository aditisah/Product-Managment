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
    const isCartCreated = await cartModel.findOne({ _id: cartId });
    if (!isCartCreated) {
      res
        .status(400)
        .send({
          status: false,
          message: "Cart is not created yet with this cartId",
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
module.exports = { createCart };
