 const userModel=require("../models/userModel")
    const updateUser=async function(req,res){
        try{
        let userId=req.params.userId
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send({ status: false, message: "Incorrect userId format" })
        }
        if (!Object.keys(requestBody).length>0) {
            return res.status(400).send({ status: false, message: "Body is empty, please Provide data" })
        };

        let user= await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({ status: false, message: "user not Found" })
        }
        if (req.token.userId != user.userId) {
            return res.status(403).send({ status: false, message: "Not Authorised" })
        }
        let {fname,lname,email, profileImage, phone,password,address} = req.body
        let updateduser = await userModel.findOneAndUpdate({ _id:userId},{fname,lname,email,profileImage, phone,password,address }, { new: true })
        return res.status(200).send({ status: true, message: "Success", data: updateduser })
}
catch (error) {
    res.status(500).send({ status: false, message: error.message })
}
    }
    


    module.exports.updateUser=updateUser