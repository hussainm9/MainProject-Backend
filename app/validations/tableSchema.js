const tableSchemaValidation = {
    tableNumber:{
        notEmpty:{
            errorMessage:'tableNumber should not be empty'
        },
        isLength:{
            options:{min:1,max:3},
            errorMessage:'tableNumber should be in between 1-999'
        }
    },
    noOfSeats:{
        notEmpty:{
            errorMessage:'noOfSeats should not be empty'
        },
        isLength:{
            options:{min:1,max:2},
            errorMessage:'noOfSeats should be in between 1-20'
        }
        
    },
    isAvaliable:{
        notEmpty:{
            errorMessage:'isAvaliable should not be empty'
        },
        isBoolean:{
            errorMessage:'is Avaliable should be true or false'
        }

    },
    advanceAmount:{
        notEmpty:{
            errorMessage:'advanceAmount should not be empty'
        }
    }
}
module.exports = {
    tableSchema:tableSchemaValidation
}