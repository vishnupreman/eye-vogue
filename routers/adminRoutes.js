const express = require('express')
const router = express.Router()
const { renderHome, renderProducts, renderBrands,
    renderAddProducts, renderCategories,
    renderOrders, renderAddBrands, renderAddCategory,
    addCategories, categoryList, categoryUnlist, renderEditCategory,
    editCategory, renderUsers, blockUser, unblockUser, addBrands,
    renderEditBrands, editBrands, unlistBrands, listBrands,
    addProduct, unpublishProduct, publishProduct, renderEditProduct, editproduct,
    deleteImage,cancelOrder ,renderOrderDetailPage} = require('../controllers/admin.Controller')

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

//orders
router.route('/order').get(renderOrders)

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
router.route('/cancelorder/:orderId').post(cancelOrder)
router.route('/orderdetails/:id').get(renderOrderDetailPage)
module.exports = router