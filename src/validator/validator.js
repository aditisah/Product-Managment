const { isValidObjectId } = require("mongoose")

const isValidEmail = function (value) {
    const regEx = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    return regEx.test(value)
}

const isValidPassword = function (value) {
    if (value.length > 7 && value.length < 16) {
        return true
    }
    else {
        return false
    }
}

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    // const regEx = /[a-zA-Z0-9]$/
    // if(!value.match(regEx)) return false
    return true
}

const isValidDecimalNumber = function (value) {
    const regEx = /^\d+(\.\d+)?$/
    return regEx.test(value)
}

const isValidPhone = function (value) {
    const regEx = /^[6-9][0-9]{9}$/
    return regEx.test(value)
}

const isValidPincode = function (value) {
    if (value < 100000) {
        return false
    }
    const regEx = /^[0-9]{6}$/
    return regEx.test(value)
}

const isValidImage = (value) => {
    const regEx = /\.(gif|jpeg|jpg|png|webp|bmp)$/
    const result = regEx.test(value)
    return result
}

const isValidSize = function (value) {
    const sizeArray = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    let valueArray = value.split(",")
    valueArray = [...new Set(valueArray)]
    notFoundSize = []
    for(let i=0;i<valueArray.length;i++){
        let found = sizeArray.find(element=> element == valueArray[i].toUpperCase().trim())
        if(found==undefined){
            notFoundSize.push(found)
            break;
        }
    }
    if(notFoundSize.length==0){
        return true
    }
    else{
        return false
    }
}

const isValidOrderStatus = function(value){
    const orderStatusArr = ["pending","completed","canceled"]
    if(orderStatusArr.includes(value.trim()))
    return true
}
module.exports = { isValidEmail, isValidPassword, isValid, isValidDecimalNumber, isValidPhone, isValidPincode, isValidImage, isValidObjectId, isValidSize, isValidOrderStatus }