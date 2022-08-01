const express = require("express");
const router = express.Router();
const { updateUser, userLogin, register, getProfile } = require("../controllers/userController");
const { createProduct, getProducts, getProductbyId, deleteProductbyId, updateProduct } = require("../controllers/productController");
const { createCart, updateCart, getCart, deleteCart } = require("../controllers/cartController")
const { authentication } = require('../middleware/auth');


// ========================USER API================================//
router.post("/register", register);
router.post("/login", userLogin);
router.get('/user/:userId/profile', authentication, getProfile);
router.put("/user/:userId/profile", authentication, updateUser);

//==========================PRODUCT API================================//
router.post("/products", createProduct);
router.get("/products", getProducts)
router.get('/products/:productId', getProductbyId);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProductbyId);

//==========================CART API================================//

router.post("/users/:userId/cart", authentication, createCart)
router.get('/users/:userId/cart', getCart);
router.put("/users/:userId/cart", authentication, updateCart)
router.delete('/users/:userId/cart', deleteCart);

//=================unknown route===================================//
router.all('/*', function (req, res) {
    res.status(400).send({ status: false, message: "Invaild url" })
})


module.exports = router;