const orderValidationSchema = {
    amount: {
        notEmpty: {
            errorMessage: 'This field is required'
        }
    },
    'menuItems.quantity': {
        notEmpty: {
            errorMessage: 'This field is required'
        }
    }
};

module.exports = {
    ordersSchema:orderValidationSchema
}
    

