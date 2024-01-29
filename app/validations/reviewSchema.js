const reviewValidationSchema={
    title:{
        notEmpty:{
            errorMessage:"title is  required"
        },
        isLength:{
           options:{min:5,max:64},
           errorMessage:"title should be in 5 to 64 characters"
        }
    },
    description:{
        notEmpty:{
            errorMessage:'description is required'
        },
        isLength:{
            options:{min:8,max:128},
            errorMessage:'description should be in between 8 to 128 characters'
        }
    },
    rating:{
        notEmpty:{
            errorMessage:'rating is required'
        }
    }
}
module.exports={
    reviewSchema:reviewValidationSchema
}