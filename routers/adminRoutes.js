const express = require('express')
const router = express.Router()
const { renderHome, renderProducts, renderBrands,
    renderAddProducts, renderCategories,
    renderOrders, renderAddBrands, renderAddCategory,
    addCategories, categoryList, categoryUnlist, renderEditCategory,
    editCategory, renderUsers, blockUser, unblockUser, addBrands,
    renderEditBrands, editBrands, unlistBrands, listBrands,
    addProduct, unpublishProduct, publishProduct, renderEditProduct, editproduct,
    deleteImage,cancelOrder ,renderOrderDetailPage,renderCouponPage,
    renderAddCouponPage,createCoupon,deactivateCoupon,deleteCoupon,renderOfferPage,
    renderAddOffers,createOffers,offerListUnlist,deleteOffer,updateItemStatus,
    renderSalesReportPage,
    downloadExcelSalesReport,
    downloadPdfSalesReport,} = require('../controllers/admin.Controller')

const upload = require('../middleware/upload')
router.route('/home').get(renderHome)

// brands
router.route('/brands').get(renderBrands)
router.route('/addbrands').get(renderAddBrands).post(addBrands)
router.route('/editbrands/:id').get(renderEditBrands).post(editBrands)
router.route('/unlist/:id').post(unlistBrands)
router.route('/list/:myid').post(listBrands)

//products
router.route('/products').get(renderProducts)
router.route('/addproducts').get(renderAddProducts).post(upload.fields([
    { name: 'colors[red][images][]', maxCount: 5 },
    { name: 'colors[black][images][]', maxCount: 5 },
    { name: 'colors[green][images][]', maxCount: 5 },
    { name: 'colors[yellow][images][]', maxCount: 5 }
]), addProduct)

router.route('/unpublish-product/:productId').post(unpublishProduct)
router.route('/publish-product/:productId').post(publishProduct)
router.route('/editproduct/:id').get(renderEditProduct).post(upload.fields([
    { name: 'colors[red][images][]', maxCount: 5 },
    { name: 'colors[black][images][]', maxCount: 5 },
    { name: 'colors[green][images][]', maxCount: 5 },
    { name: 'colors[yellow][images][]', maxCount: 5 }
]), editproduct)

router.route('/deleteimage').post(deleteImage)




//categories
router.route('/category').get(renderCategories)
router.route('/addcategory').get(renderAddCategory).post(addCategories)
router.route('/list/:id').post(categoryList)
router.route('/unlist/:id').post(categoryUnlist)
router.route('/editcategory/:id').get(renderEditCategory).post(editCategory)

//USER
router.route('/users').get(renderUsers)
router.route('/block/:id').post(blockUser)
router.route('/unblock/:id').post(unblockUser)

//order
router.route('/order').get(renderOrders)
router.route('/cancelorder/:orderId').post(cancelOrder)
router.route('/orderdetails/:id').get(renderOrderDetailPage)
router.route('/orderdetails/update-item-status').post(updateItemStatus)

//coupon
router.route('/coupon').get(renderCouponPage)
router.route('/addcoupon').get(renderAddCouponPage)
router.route('/createcoupon').post(createCoupon)
router.route('/deactivatecoupon/:id').post(deactivateCoupon)
router.route('/deletecoupon/:id').delete(deleteCoupon)

//OFFERS
router.route('/offers').get(renderOfferPage)
router.route('/addoffers').get(renderAddOffers).post(createOffers)
router.route('/list_unlist_offers/:id/toggle-list').post(offerListUnlist)
router.route('/delete_offer/:id').post(deleteOffer)

//salesreport
router.route('/salesreport').get(renderSalesReportPage)
router.route('/download-excel-salesreport').get(downloadExcelSalesReport)
router.route('/download-pdf-salesreport').get(downloadPdfSalesReport)

module.exports = router