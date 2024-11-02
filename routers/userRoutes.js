const express = require('express')
const router = express.Router()
const { renderHome, renderProductPage, renderMyAccount, editUserName, renderEditUserName,
    editPassword, renderAddressPage, renderAddAdress,
    enteredAddress, renderEditAddress, editAddress, deleteAddress, addToCart,
    renderCartPage, updateQuantity, removeProductCart,renderCheckOutPage ,
    placeOrder,renderOrderConfrimPage,renderOrderPage,cancelOrder,returnOrder,
    renderShop,filterShop} = require('../controllers/user.controller')

router.route('/home').get(renderHome)


//productPage
router.route('/product/:id').get(renderProductPage)

//myAccount
router.route('/myaccount').get(renderMyAccount)
router.route('/changepass').post(editPassword)
///edit user details
router.route('/editdname/:id').get(renderEditUserName)
router.route('/updatename/:id').post(editUserName)
router.route('/address').get(renderAddressPage)
router.route('/addaddress').get(renderAddAdress).post(enteredAddress)
router.route('/editaddress/:id').get(renderEditAddress).post(editAddress)
router.route('/deleteaddress/:addressId').delete(deleteAddress);

///cart
router.route('/addcart').post(addToCart)
router.route('/cart').get(renderCartPage)
router.route('/cart/updatequantity').post(updateQuantity)
router.route('/cart/removeitem').post(removeProductCart)

///checkout
router.route('/checkout').get(renderCheckOutPage)
router.route('/placeorder').post(placeOrder)
router.route('/orderconfirmed/:id').get(renderOrderConfrimPage)

///orderpage
router.route('/myorder').get(renderOrderPage)
router.route('/ordercancel/:orderId').post(cancelOrder)
router.route('/orderreturn/:orderId').post(returnOrder)

//shop
router.route('/shop').get(renderShop)
router.route('/shopfilter').get(filterShop)
module.exports = router