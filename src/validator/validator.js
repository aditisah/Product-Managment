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
    return true;
}

const isValidPhone = function (value) {
    const regEx = /^[6-9][0-9]{9}$/
    return regEx.test(value)
}

const isValidPincode = function (value){
    const regEx = /^[0-9]{6}$/
    return regEx
}

const isValidImage = (value) => {
    const regEx = /\.(gif|jpeg|jpg|png|webp|bmp)$/
    const result = regEx.test(value)
    return result
}

module.exports = { isValidEmail, isValidPassword, isValid, isValidPhone, isValidPincode, isValidImage}