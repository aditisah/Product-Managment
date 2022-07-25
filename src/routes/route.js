const express = require("express");
const router = express.Router();


router.all('/*', function(req,res){
    res.status(400).send({status:false,message:"Invaild url"})
})
module.exports = router;
