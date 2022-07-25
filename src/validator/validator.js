const validEmail = function (value){
    const regEx = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    return regEx.test(value)
}

const validPassword = function (value){
    if(value.length>7 && value.length<16){
        return true
    }
    else{
        return false
    }
}

module.exports = {validEmail, validPassword}