const bookingSchemaValidation = {
 
    noOfPeople:{
        exists:{
            errorMessage:'noOfPeople should not be empty'
        },
        isInt:{
            errorMessage:'not a valid number'
        }
    }

}
module.exports = {
    bookingSchemaValidation
}
            // tableIds :{
            //     isMongoId:{
            //         errorMessage:'invalid tableId'
            //     }
            // },
            // restaurantId:{
            //     isMongoId:{
            //         errorMessage:'invalid restaurantId'
            //     }
            // },
            // userId:{
            //     isMongoId:{
            //         errorMessage:'invalid userId'
            //     }
            // },
            // endDateTime:{
            //     isDate:{
            //         errorMessage:'invalid end Date Time'
            //     }
            // },