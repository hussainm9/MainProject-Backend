const User = require('../models/users-model')

const usernameSchemaValidation = {
    notEmpty:{
        errorMessage:'username cannot be empty'
    },
    isLength:{
        options:{
            min:4
        },
        errorMessage:'username should contain atleast 4 characters'
    },
    custom:{
        options: async(value)=>{
            const username = await User.findOne({username:value})
            if(username){
                throw new Error('This username is already registered with us')
            }else{
                return true
            }

        }
    }

}
const emailSchemaValidation = {
    notEmpty:{
        errorMessage:'email should not be empty'
    },
    isEmail:{
        errorMessage:'invalid email format'
    },
    custom:{
        options: async(value)=>{
            const email = await User.findOne({email:value})
            if(email){
                throw new Error('This email is already registered with us')
            }else{
                return true
            }

        }
    }
}
const mobileSchemaValidation = {
    notEmpty:{
        errorMessage:'mobile number should not be empty'
    },
    isLength:{
        options:{
            min:10,max:10
        },
        errorMessage:'mobile number should consist of 10 numbers'
    },
    isNumeric:{
        errorMessage:'mobile number should contain only numbers'
    },
    custom:{
        options: async(value)=>{
            const mobile = await User.findOne({mobile:value})
            if(mobile){
                throw new Error('mobile number is already registered with us')
            }else{
                return true
            }


        }
    }
}
const passwordSchemaValidation = {
    notEmpty:{
        errorMessage:'password should not be Empty'
    },
    isLength:{
        options:{
            min:8,max:64
        },
        errorMessage:'password should be in between 8-64 characters'
    },
    isStrongPassword:{
        errorMessage:'password should contain atleast 1 lowercase,1 uppercase,1 digit,1 symbool'
    }

}
const roleSchemaValidation = {
    notEmpty:{
        errorMessage:'role should not be empty'
    },
    isIn:{
        options:[['admin','restaurantOwner','guest']],
        errorMessage:'not a valid role'
    }
}
const userRegisterValidationSchema = {
    username:usernameSchemaValidation,
    email:emailSchemaValidation,
    mobile:mobileSchemaValidation,
    password:passwordSchemaValidation,
    role:roleSchemaValidation

}
const userLoginValidationSchema = {
    email:{
        notEmpty:{
            errorMessage:'email should not be empty'
        },
        isEmail:{
            errorMessage:'email should be in valid format'
        }
    },
    password:passwordSchemaValidation
}
module.exports = {
    userRegisterSchema : userRegisterValidationSchema,
    userLoginSchema:userLoginValidationSchema

}