const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")

router.post("/register", userController.register);
router.post("/login", userController.userLogin)
router.all('/*', function(req,res){
    res.status(400).send({status:false,message:"Invaild url"})
})

module.exports = router;