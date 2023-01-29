const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const route=require('./routes/route')
const app = express();
const multer = require("multer")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())

app.use("/", route);

mongoose.connect("mongodb+srv://aditisah:HdtoVDUgrpCUNRmS@cluster0.jjd4zhp.mongodb.net/Product_Managment?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDB is Connected."))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || 3000, function () {
  console.log("Express is running on port " + (process.env.PORT || 3000));
});
