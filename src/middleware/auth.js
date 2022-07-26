const jwt = require("jsonwebtoken");

const authentication = (req, res, next) => {
    try {
        let token=req.headers[`Authorization`];
        if(!token) token=req.headers[`authorization`];
        if (!token) return res.status(401).send({ status: false, msg: "Token must be present in Auth" });
//! Need to implement that Bearer authentication Token
//! https://youtu.be/BnN3TQOG5-g
        let decodedToken = jwt.verify(token, "project/productManagementGroup52", (error, decodedToken) => {
            if (error) {
                const message = error.message == "jwt expired" ? "Token is expired" : "Token is invalid";
                return res.status(401).send({ status: false, message });
            }
            req.userId = decodedToken.userId;
            next();
        })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports = { authentication };