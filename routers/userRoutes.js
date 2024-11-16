const express = require('express')
const router = express.Router()
const { renderHome, renderProductPage, renderMyAccount, editUserName, renderEditUserName,
    editPassword, renderAddressPage, renderAddAdress,
    enteredAddress, renderEditAddress, editAddress, deleteAddress, addToCart,
    renderCartPage, updateQuantity, removeProductCart,renderCheckOutPage ,
    placeOrder,renderOrderConfrimPage,renderOrderPage,cancelOrder,returnOrder,
    renderShop,filterShop,showCoupons,applyCoupon,removeCoupon,
    verifyRazorPay,renderWishList,addToWishList,removeFromWishList,orderDetailedPage,
    renderWalletPage,
    downloadInvoice} = require('../controllers/user.controller')

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
router.route('/verify-payment').post(verifyRazorPay)

///orderpage
router.route('/myorder').get(renderOrderPage)
router.route('/order/details/:id').get(orderDetailedPage)
router.route('/download-invoice/:id').get(downloadInvoice)
router.route('/order/cancel/:orderId/:itemId').post(cancelOrder)
router.route('/order/return/:orderId/:itemId').post(returnOrder)

//shop
router.route('/shop').get(renderShop)
router.route('/shopfilter').get(filterShop)


//coupons
router.route('/showCoupons').get(showCoupons)
router.route('/applycoupon').post(applyCoupon)
router.route('/removecoupon').post(removeCoupon)

//wishlist
router.route('/wishlist').get(renderWishList)
router.route('/addwishlist').post(addToWishList)
router.route('/remove-from-wishlist').post(removeFromWishList)

//wallet
router.route('/wallet').get(renderWalletPage)

module.exports = router