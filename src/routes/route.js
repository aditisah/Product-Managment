const express = require("express");
const router = express.Router();
const { updateUser, userLogin, register, getProfile } = require("../controllers/userController");
const { createProduct, getProducts, getProductbyId, deleteProductbyId, updateProduct } = require("../controllers/productController");
<<<<<<< HEAD
const { cartUpdate, createCart } = require("../controllers/cartController")
=======
const { createCart, getCart, deleteCart } = require("../controllers/cartController")
>>>>>>> 65ac41c1cff6109a5e1de2371e13913e6573f6fa
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
<<<<<<< HEAD

router.post("/users/:userId/cart", authentication, createCart)
router.put("/users/:userId/cart", authentication, cartUpdate)

=======
router.post("/users/:userId/cart", authentication, createCart);
router.get('/users/:userId/cart', getCart);
router.delete('/users/:userId/cart', deleteCart);
>>>>>>> 65ac41c1cff6109a5e1de2371e13913e6573f6fa
//=================unknown route===================================//
router.all('/*', function (req, res) {
    res.status(400).send({ status: false, message: "Invaild url" })
})


module.exports = router;