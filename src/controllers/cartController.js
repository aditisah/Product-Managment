const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel")
const validator = require("../validator/validator");

const createCart = async function (req, res) {
    const userId = req.params.userId;
    const { cartId, productId } = req.body;
    if (req.body.quantity <= 0) {
        res.status(400).send({ status: false, message: "Please enter the quantity of the product atleast 1" });
        return;
    }
    const quantity = req.body.quantity ? req.body.quantity : 1;

    if (!validator.isValidObjectId(userId)) {
        res.status(400).send({ status: false, message: "userId is not valid id" });
        return;
    }
    const findUser = await userModel.findById(userId)
    if (!findUser) {
        return res.status(404).send({ status: false, message: "User Not Found" })
    }
    if (Object.keys(req.body).length == 0) {
        res.status(400).send({ status: false, message: "Please add product to the cart" });
        return;
    }
    if (!validator.isValid(productId)) {
        res.status(400).send({ status: false, message: "Please enter productId" });
        return;
    }
    if (cartId) {
        if (!validator.isValidObjectId(cartId)) {
            res.status(400).send({ status: false, message: "cartId is not valid id" });
            return;
        }
    }
    if (productId) {
        if (!validator.isValidObjectId(productId)) {
            res.status(400).send({ status: false, message: "Please add products to the cart" });
            return;
        }
    }


    if (userId !== req.userId) {
        res.status(403).send({ status: false, message: "userId does not match with loggedin user id" });
        return;
    }
    const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false });
    if (!isProductExist) {
        res.status(404).send({ status: false, message: "Product not found" });
        return;
    }
    if (!cartId) {
        const isCartCreatedWithUser = await cartModel.findOne({ userId , _id:cartId});
        if (isCartCreatedWithUser) {
            res.status(400).send({ status: false, message: "Please provide cartId,cart already has been created with this user!!" });
            return;
        } 
        else {
            console.log(isProductExist.price)
            console.log(quantity)
            const cartDeatils = {
                userId: userId,
                items: {
                    productId: productId,
                    quantity: quantity
                },
                totalPrice: (isProductExist.price * quantity),
                totalItems: 1,
            };
            let newCart = await cartModel.create(cartDeatils);
            res.status(201).send({ status: true, data: newCart });
            return;
        }
    }
    else {
        const isCartCreated = await cartModel.findOne({ _id: cartId, userId });
        if (!isCartCreated) {
            res.status(400).send({ status: false, message: "Cart is not created yet with this cartId" });
            return;
        }
        const isProductExistInCart = await cartModel.findOne({ _id: cartId, items: { $elemMatch: { productId } } })
        const addedProductDetail = {}
        if (!isProductExistInCart) {
            let items = {
                productId: productId,
                quantity: quantity
            }
            isCartCreated.items.push(items)
            addedProductDetail.items = isCartCreated.items

            //console.log(isCartCreated.items)
        }
        else {
            // console.log(isCartCreated)
            console.log(isProductExistInCart.items.productId)
            addedProductDetail.items = isCartCreated.items.map(el => {
                console.log(el.productId)
                if (el.productId == productId) {
                    el.quantity += quantity
                }
                return el
            })
        }
        addedProductDetail.totalPrice = isCartCreated.totalPrice + (isProductExist.price * quantity)
        addedProductDetail.totalItems = addedProductDetail.items.length
        let addProductToCart = await cartModel.findOneAndUpdate({ userId: userId }, addedProductDetail, { new: true });

        res.status(200).send({ status: true, data: addProductToCart });
        return;
    }
};

const cartUpdate = async function (req, res) {
    try {
        const userId = req.params.userId
        //user
        if (!userId) {
            return res.status(400).send({ status: false, message: "Please Enter userId" })
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please Enter valid userId" })
        }
        const findUser = await userModel.findById(userId)
        if (!findUser) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }
        //user Authorization
        if (req.userId == userId) {
            if (Object.keys(req.body).length == 0) {
                return res.status(400).send({ status: false, message: "Please enter required data to update cart" })
            }
            const { cartId, productId, removeProduct } = req.body
            //cart
            if (!cartId) {
                return res.status(400).send({ status: false, message: "Please Enter cartId, this field is mandatory" })
            }
            if (!validator.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "Please Enter valid cartId" })
            }
            const findCart = await cartModel.findOne({ _id: cartId, userId })
            if (!findCart) {
                return res.status(404).send({ status: false, message: "Cart Not Found" })
            }
            //product
            if (!productId) {
                return res.status(400).send({ status: false, message: "Please Enter productId, this field is mandatory" })
            }
            if (!validator.isValidObjectId(productId)) {
                return res.status(400).send({ status: false, message: "Please Enter valid productId" })
            }
            const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!findProduct) {
                return res.status(404).send({ status: false, message: "Product Not Found" })
            }
            //finding product Index number
            const findProductIndexFromCart = findCart.items.findIndex(product => product.productId == productId)
            if (findProductIndexFromCart == -1) {
                return res.status(404).send({ status: false, message: "Product Not Found in Your Cart" })
            }
            //removeProduct
            if (!removeProduct) {
                return res.status(400).send({ status: false, message: "Please Enter removeProduct, this field is mandatory" })
            }
            if (removeProduct == 0 || removeProduct == 1) {
                let filteredProduct
                //removeProduct is 0
                if (removeProduct == 0 || findCart.items[findProductIndexFromCart].quantity - 1 == 0) {
                    filteredProduct = {
                        totalPrice: findCart.totalPrice - findProduct.price * findCart.items[findProductIndexFromCart].quantity,
                        $pull: { items: { productId } },
                        totalItems: findCart.totalItems - 1
                    }
                }
                //removeProduct is 1
                if (removeProduct == 1 && findCart.items[findProductIndexFromCart].quantity - 1 != 0) {
                    filteredProduct = {
                        totalPrice: findCart.totalPrice - findProduct.price,
                        $set: { "items.$.quantity": findCart.items[findProductIndexFromCart].quantity - 1 }
                    }
                }
                //update cart
                const updateCart = await cartModel.findOneAndUpdate({ _id: cartId, items: { $elemMatch: { productId: productId } } }, filteredProduct, { new: true })
                return res.status(200).send({ status: true, message: "cart update successfully", data: updateCart })
            }
            else {
                return res.status(400).send({ status: false, message: "Please Enter valid removeProduct Number from 0 or 1" })
            }
        }
        else {
            return res.status(403).send({ status: false, message: "you are not authorize to update cart" })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createCart, cartUpdate }