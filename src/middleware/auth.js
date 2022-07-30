const jwt = require("jsonwebtoken");

const authentication = (req, res, next) => {
    try {
        let token = req.headers[`Authorization`];
        if (!token) {
            token = req.headers[`authorization`];
        }
        if (!token) {
            return res.status(400).send({ status: false, msg: "Token must be present" });
        }
        token = token.split(" ")
        token = token[1]
        jwt.verify(token, "project/productManagementGroup52", (error, decodedToken) => {
            if (error) {
                return res.status(400).send({ status: false, message: "Token is invalid" });
            }
            else {
                if (decodedToken.exp > Date.now()) {
                    req.userId = decodedToken.userId;
                    next();
                }
                else {
                    return res.status(401).send({ status: false, message: "Token has expired" });
                }
            }

        })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports = { authentication };