const express = require("express");
const router = express.Router();
const { updateUser, userLogin, register, getProfile } = require("../controllers/userController");
const { createProduct, getProducts, getProductbyId, deleteProductbyId, updateProduct } = require("../controllers/productController");

const { authentication } = require('../middleware/auth');

const {createOrder }= require("../controllers/orderController")

// ========================user routes================================//
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


//=========================Order API ==============================//
router.post('/users/:userId/orders' ,createOrder)

//=================unknown route===================================//
router.all('/*', function (req, res) {
    res.status(400).send({ status: false, message: "Invaild url" })
})


module.exports = router;