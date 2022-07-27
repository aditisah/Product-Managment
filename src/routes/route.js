const express = require("express");
const router = express.Router();
const {updateUser, userLogin, register, getProfile} = require("../controllers/userController");
const {create, getProducts} = require("../controllers/productController")
const {authentication} = require('../middleware/auth');

router.post("/register", register);
router.post("/login", userLogin);
router.get('/user/:userId/profile',authentication, getProfile);
router.put("/user/:userId/profile", authentication, updateUser);
router.post("/products", create)
router.get("/products", getProducts)
router.all('/*', function(res){
    res.status(400).send({status:false,message:"Invaild url"})
})

module.exports = router;