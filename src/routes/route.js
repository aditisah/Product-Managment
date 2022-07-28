const { Route53RecoveryCluster } = require("aws-sdk");
const express = require("express");
const router = express.Router();
const { updateUser, userLogin, register, getProfile } = require("../controllers/userController");
const { createProduct, getProducts, getProductbyId, deleteProductbyId, updateProduct } = require("../controllers/productController");
const { authentication } = require('../middleware/auth');


// ========================user routes================================//
router.post("/register", register);

router.post("/login", userLogin);
router.get('/user/:userId/profile', authentication, getProfile);
router.put("/user/:userId/profile", authentication, updateUser);


//==========================PRODUCT API================================//
router.post("/products", createProduct);
router.get('/products/:productId', getProductbyId);
router.delete('/products/:productId', deleteProductbyId);
router.get("/products", getProducts);
router.update('/products/:productId', updateProduct);

//=================unknown route===================================//
router.all('/*', function (res) {
    res.status(400).send({ status: false, message: "Invaild url" })
})


module.exports = router;