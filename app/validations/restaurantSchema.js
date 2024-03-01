// const Restaurant =require('../models/restaurant-model')
// const restaurantValidationSchema={
//     name:{
//         notEmpty:{
//             errorMessage:'name is required'
//         },
//         isLength:{
//             options:{
//                 min:10,max:64
//             },
//             errorMessage:'name should be in between 10 to 64 characters'
//         }
//     },
//     'address.street':{
//         notEmpty:{
//             errorMessage:'street is required'
//         },
//         isLength:{
//             options:{
//                 min:4,max:64
//             },
//             errorMessage:'street name should be in between 4 to 64 characters'
//         }

//     },
//     'address.area':{
//         notEmpty:{
//             errorMessage:'area is required'
//         },
//         isLength:{
//             options:{
//                 min:4,max:64
//             },
//             errorMessage:'area name should be in between 4 to 64 characters'
//         }
//     },
//     'address.city':{
//         notEmpty:{
//             errorMessage:'city name is required'
//         },
//         isLength:{
//             options:{
//                 min:4,max:64
//             },
//             errorMessage:'city name should be in between 4 to 64 characters'
//         }
//     },
//     'address.state':{
//         notEmpty:{
//             errorMessage:'state name is required'
//         },
//         isLength:{
//             options:{
//                 min:4,max:64
//             },
//             errorMessage:'state name should be in between 4 to 64 characters'
//         }
//     },
//     'address.pincode':{
//         notEmpty:{
//             errorMessage:' pincode is required'
//         },
//         isLength:{
//             options:{
//                 min:6,max:6
//             },
//             errorMessage:'number should be of 6 characters'
//         }
//     },
//     description:{
//         notEmpty:{
//             errorMessage:'discription is mandatory for more detail about restaurant'
//         }
//     },
//     gstNo:{
//         notEmpty:{
//             errorMessage:'gst number is required'
//         }
//     },
//     image:{
//         notEmpty:{
//             errorMessage:'this field is required'
//         }
//     },
//     licenseNumber:{
//         notEmpty:{
//             errorMessage:'this field is required'
//         },
        
//     },
//     ownerId:{
//         custom:{
//             options:async (value,{req})=>{
//                 const restaurant=await Restaurant.findOne({ownerId:req.user.id})
//                 if(!restaurant){
//                     return true
//                 }else{
//                     throw new Error('restaurant is already created')
//                 }
//             }
//         }
//     }
    

// }
// module.exports={
//     restaurantSchema:restaurantValidationSchema
// }
const Joi = require('joi')
const Restaurant =require('../models/restaurant-model')
const restaurantValidationSchema={
    name:{
        notEmpty:{
            errorMessage:'name is required'
        },
        isLength:{
            options:{
                min:5,max:64
            },
            errorMessage:'name should be in between 5 to 64 characters'
        }
    },
  
    'address.street':{
        notEmpty:{
            errorMessage:'street is required'
        },
        isLength:{
            options:{
                min:4,max:64
            },
            errorMessage:'street name should be in between 4 to 64 characters'
        }

    },
    'address.area':{
        notEmpty:{
            errorMessage:'area is required'
        },
        isLength:{
            options:{
                min:4,max:64
            },
            errorMessage:'area name should be in between 4 to 64 characters'
        }
    },
    'address.city':{
        notEmpty:{
            errorMessage:'city name is required'
        },
        isLength:{
            options:{
                min:4,max:64
            },
            errorMessage:'city name should be in between 4 to 64 characters'
        }
    },
    'address.state':{
        notEmpty:{
            errorMessage:'state name is required'
        },
        isLength:{
            options:{
                min:4,max:64
            },
            errorMessage:'state name should be in between 4 to 64 characters'
        }
    },
    'address.pincode':{
        notEmpty:{
            errorMessage:' pincode is required'
        },
        isLength:{
            options:{
                min:6,max:6
            },
            errorMessage:'number should be of 6 characters'
        }
    },
    description:{
        notEmpty:{
            errorMessage:'discription is mandatory for more detail about restaurant'
        }
    },
    gstNo:{
        notEmpty:{
            errorMessage:'gst number is required'
        }
    },
   ownerId:{
        custom:{
            options:async (value,{req})=>{
                const restaurant=await Restaurant.findOne({ownerId:req.user.id})
                if(!restaurant){
                    return true
                }else{
                    throw new Error('restaurant is already created')
                }
            }
        }
    }
    

}
const restaurantUpdateSchema = {
    name:{
        notEmpty:{
            errorMessage:'name is required'
        },
        isLength:{
            options:{
                min:5,max:64
            },
            errorMessage:'name should be in between 5 to 64 characters'
        }
    },
  
   
    description:{
        notEmpty:{
            errorMessage:'discription is mandatory for more detail about restaurant'
        }
    }

}
const restaurantPasswordUpdateSchema={
    oldPassword:{
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

    },
    newPassword:{
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
}
module.exports={
    restaurantSchema:restaurantValidationSchema,
    restaurantPasswordSchema:restaurantPasswordUpdateSchema,
    restaurantUpdateSchema:restaurantUpdateSchema

    
}
