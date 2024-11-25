const brandModel = require('../model/brand')
const categoryModel = require('../model/category')
const userModel = require('../model/userModel')
const productModel = require('../model/products')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises;
const orderModel= require('../model/order')
const couponModel = require('../model/coupon')
const cartModel = require('../model/cart')
const offerModel = require('../model/offer')
const {applyBestOfferToProduct} = require('../utility/bestoffer')
const moment = require('moment');
const ExcelJS = require('exceljs')
const PDFDocument  = require('pdfkit')
const {handleRefund} = require('../utility/handlerefund')


const renderHome = async (req, res) => {
    try {
        const orders = await orderModel.find()
        const overallSalesCount = orders.length
        const overallOrderAmount = orders.reduce((total,order)=>total+order.totalPrice,0)
        const overallDiscount = orders.reduce((total,order)=>total+(order.discount,0),0)
        res.render('dashboard',{
            overallSalesCount,
            overallOrderAmount:overallOrderAmount.toFixed(2),
            overallDiscount:overallDiscount.toFixed(2)
        })
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

const renderProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 10; 
        const skip = (page - 1) * limit;

     
        const products = await productModel
            .find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); 

        
        const totalProducts = await productModel.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        const success_message = req.flash('success-message');

        res.render('products', {
            products,
            currentPage: page,
            totalPages,
            success_message,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server error');
    }
};


const renderBrands = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 10;
        const skip = (page - 1) * limit;
        const brands = await brandModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1})

        const totalBrands = await brandModel.countDocuments()
        const totalPages = Math.ceil(totalBrands / limit)


        res.render('brands', { brands ,currentPage: page, totalPages})
    } catch (error) {
        console.log(error);
        
    }
}

const renderAddProducts = async (req, res) => {
    const category = await categoryModel.find()
    const brand = await brandModel.find()
    const error_message = req.flash('error-message')
    res.render('addproducts', { category, brand, error_message })
}

const renderCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 10
        const skip = (page - 1) * limit

        const category = await categoryModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })

        const totalCategories = await categoryModel.countDocuments()
        const totalPages = Math.ceil(totalCategories / limit)

        res.render('category', { category ,  currentPage: page, totalPages, })
    } catch (error) {
        console.log(error)
    }
}


const renderAddBrands = async (req, res) => {
    const error_message = req.flash('error-message')
    res.render('addbrands', { error_message })
}
const renderAddCategory = async (req, res) => {
    res.render('addcategory')
}
const renderEditCategory = async (req, res) => {
    const id = req.params.id
    const error_message = req.flash('error-message')
    const category = await categoryModel.findById(id)
    res.render('editcategory', { category, error_message })
}
const renderUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 10
        const skip = (page - 1) * limit

        const users = await userModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })

        const totalUsers = await userModel.countDocuments()
        const totalPages = Math.ceil(totalUsers / limit)

        res.render('users', { users ,currentPage: page, totalPages,})
        
    } catch (error) {
        console.error(error);
    }
}

const addCategories = async (req, res) => {
    const { categoryname, categorydiscription } = req.body
    const categorynameLowerCase = categoryname.toString().toLowerCase()
    try {
        const existingCategory = await categoryModel.findOne({ name: categorynameLowerCase })
        console.log(existingCategory);

        if (existingCategory) {
            return res.render('addcategory', { errorMessage: 'already exits' })
        }
        const categories = new categoryModel({
            name: categorynameLowerCase,
            description: categorydiscription
        })
        await categories.save()
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'server issue in addcategories' })
    }
}
const categoryList = async (req, res) => {
    try {
        const id = req.params.id
        const category = await categoryModel.findByIdAndUpdate(id, { isListed: true })
        await category.save()
        return res.redirect('/admin/category')
    } catch (error) {
        console.log(error);
    }
}

const categoryUnlist = async (req, res) => {
    try {
        const id = req.params.id
        const category = await categoryModel.findByIdAndUpdate(id, { isListed: false })
        await category.save()
        return res.redirect('/admin/category')
    } catch (error) {
        console.log(error);
    }
}

const editCategory = async (req, res) => {
    const { categoryname, categorydiscription } = req.body
    const id = req.params.id
    try {
        const categoryNameLower = categoryname.toLowerCase()
        const existsCategory = await categoryModel.findOne({ name: categoryNameLower });

        if (existsCategory && existsCategory._id.toString() !== id) {
            req.flash('error-message', 'Category already exists with this name');
            return res.redirect(`/admin/editcategory/${id}`);
        }
        const categoryitem = await categoryModel.findByIdAndUpdate(id, { name: categoryNameLower, description: categorydiscription })
        await categoryitem.save()
        return res.redirect('/admin/category')
    } catch (error) {
        console.log(error)
    }
}

const blockUser = async (req, res) => {
    try {
        const id = req.params.id
        const user = await userModel.findByIdAndUpdate(id, { isBlocked: true })
        await user.save()
        return res.redirect('/admin/users')
    } catch (error) {
        console.log(error);

    }
}

const unblockUser = async (req, res) => {
    try {
        const id = req.params.id
        const user = await userModel.findByIdAndUpdate(id, { isBlocked: false })
        await user.save()
        return res.redirect('/admin/users')
    } catch (error) {
        console.log(error);

    }
}

const addBrands = async (req, res) => {
    const { brandname, branddescription } = req.body
    try {
        const brandNameLower = brandname.toLowerCase()
        const existingBrand = await brandModel.findOne({ name: brandNameLower })
        if (existingBrand) {
            req.flash('error-message', 'Brand already exists')
            return res.redirect('/admin/addbrands')
        }
        const brands = new brandModel({
            name: brandNameLower,
            description: branddescription
        })
        await brands.save()
        return res.redirect('/admin/brands')
    } catch (error) {
        console.log(error);

    }
}
const renderEditBrands = async (req, res) => {
    try {
        const id = req.params.id
        const brands = await brandModel.findById(id)
        const error_message = req.flash('error-message')
        res.render('editbrands', { brands, error_message })
    } catch (error) {
        console.log(error);

    }
}

const editBrands = async (req, res) => {
    const { brandname, branddescription } = req.body
    const id = req.params.id
    try {
        const brandnameToLower = brandname.toLowerCase()
        const existingBrand = await brandModel.findOne({ name: brandnameToLower })
        if (existingBrand && existingBrand._id.toString() !== id) {
            req.flash('error-message', 'Brandname already exists');
            return res.redirect(`/admin/editbrands/${id}`);
        }
        const findbrand = await brandModel.findByIdAndUpdate(id, { name: brandnameToLower, description: branddescription })
        await findbrand.save()
        return res.redirect('/admin/brands')
    } catch (error) {
        console.log(error);

    }
}

const unlistBrands = async (req, res) => {
    try {
        const id = req.params.id
        const brand = await brandModel.findByIdAndUpdate(id, { isListed: false })
        await brand.save()
        return res.redirect('/admin/brands')
    } catch (error) {
        console.log(error);
    }

}

const listBrands = async (req, res) => {
    const id = req.params.myid
    try {
        const brand = await brandModel.findByIdAndUpdate(id, { isListed: true })
        await brand.save()
        return res.redirect('/admin/brands')
    } catch (error) {
        console.log(error);
    }
}


const addProduct = async (req, res) => {
    const { price, productDescription, productName, product_category, product_brand, colors,
        product_gender, frame_color, material, frame_style, } = req.body;

    try {
       
        const productNameLower = productName.toLowerCase()
        
    
        const existingProduct = await productModel.findOne({ name: productNameLower })
        if (existingProduct) {
            req.flash('error-message', 'Product with the same name already exists')
            return res.redirect('/admin/addproducts')
        }

      
        const newProduct = new productModel({
            name: productNameLower,
            description: productDescription,
            price: price,
            category: product_category,
            brandname: product_brand,
            gender: product_gender,
            frameColor: frame_color,
            material,
            frameStyle: frame_style,
            colors: {}
        });

        
        if (colors) {
            for (let color in colors) {
                const colorData = colors[color];
                const imagePaths = [];

                if (req.files[`colors[${color}][images][]`]) {
                    req.files[`colors[${color}][images][]`].forEach(file => {
                        const imagePath = path.join(file.filename);  
                        imagePaths.push(imagePath);
                    });
                }

                newProduct.colors[color] = {
                    quantity: colorData.quantity || 0,
                    images: imagePaths
                };
            }
        }

       
        const savedProduct = await newProduct.save();

      
        await applyBestOfferToProduct(savedProduct._id);

        
        return res.redirect('/admin/products');
        
    } catch (error) {
        console.log(error);
        
        req.flash('error-message', 'An error occurred while adding the product.');
        return res.redirect('/admin/addproducts');
    }
};


const unpublishProduct = async (req, res) => {
    const productId = req.params.productId
    try {
        const product = await productModel.findByIdAndUpdate(productId, { isPublished: false })
        await product.save()
        return res.redirect('/admin/products')
    } catch (error) {
        console.log(error);
    }
}

const publishProduct = async (req, res) => {
    const productId = req.params.productId
    try {
        const product = await productModel.findByIdAndUpdate(productId, { isPublished: true })
        await product.save()
        return res.redirect('/admin/products')
    } catch (error) {
        console.log(error)
    }

}

const renderEditProduct = async (req, res) => {
    const id = req.params.id
    try {
        const product = await productModel.findById(id)
            .populate('category', 'name')
            .populate('brandname', 'name')

        const category = await categoryModel.find()
        const brand = await brandModel.find()
        const error_message = req.flash('error-message')
        const success_message = req.flash('success-message')
        return res.render('editproduct', { product, category, brand, error_message, success_message })
    } catch (error) {
        console.log(error)
    }
}


const editproduct = async (req, res) => {
    const id = req.params.id;
    const {
        productName,
        productDescription,
        product_category,
        product_brand,
        price,
        product_gender,
        frame_color,
        material,
        frame_style,
        yellowQuantity,
        blackQuantity,
        redQuantity,
        greenQuantity,
        existingImages
    } = req.body;


    console.log(req.body,'body');
    console.log(product_category,'cataa',product_brand);
    
    try {
        const productNameLower = productName.toLowerCase();

        const existingProduct = await productModel.findOne({ name: productNameLower });
        if (existingProduct && existingProduct._id.toString() !== id) {
            req.flash('error-message', 'Product with the same name already exists');
            return res.redirect(`/admin/editproduct/${id}`);
        }


        const product = await productModel.findById(id)
        const updatedColors = { ...product.colors };
        

        ['red', 'black', 'green', 'yellow'].forEach(color => {

            const colorQuantity = req.body[`${color}Quantity`];
            if (colorQuantity) {
                updatedColors[color].quantity = colorQuantity;

            }

            updatedColors[color].images = existingImages && existingImages[color]
                ? existingImages[color]
                : [];
            

            if (req.files && req.files[`colors[${color}][images][]`]) {
                const newImages = req.files[`colors[${color}][images][]`].map(file => file.filename);
                updatedColors[color].images = [...updatedColors[color].images, ...newImages]; 
            
                
            }
        });

        const updatedProduct = await productModel.findByIdAndUpdate(id, {
            name: productNameLower,
            description: productDescription,
            price,
            category: product_category,
            brandname: product_brand,
            gender: product_gender,
            frameColor: frame_color,
            material,
            frameStyle: frame_style,
            colors: updatedColors,
        }, { new: true });

        await updatedProduct.save();
        await applyBestOfferToProduct(id)
        req.flash('success-message', 'Product updated successfully');
        return res.redirect('/admin/products');

    } catch (error) {
        console.error(error);
        req.flash('error-message', 'An error occurred while updating the product.');
        return res.redirect(`/admin/editproduct/${id}`);
    }
};

const deleteImage = async (req, res) => {
    const { productId, color, index } = req.body
    console.log(req.body);

    try {
        const product = await productModel.findById(productId)

        if (!product) {
            req.flash('error-message', 'Product not found.');
            return res.redirect('/admin/products');
        }

        const imageColor = product.colors[color].images
        if (index < 0 || index >= imageColor.length) {
            console.log(imageColor.length, 'lenaaaaaaaaaaaaaaaaaaaa');

            req.flash('error-message', 'Image index out of range.');
            return res.status(404).json({ message: 'Image index out of range' });
        }


        const imagePath = path.join(__dirname, '..', '/public/uploads', imageColor[index]);

        console.log(imagePath);

        await fs.unlink(imagePath);
        imageColor.splice(index, 1);


        await product.save()
        req.flash('success-message', 'Image removed successfully.');
        return res.status(200).json({ message: 'Image removed successfully' })

    } catch (error) {
        console.error('Error removing image:', error);
        req.flash('error-message', 'Error occurred while removing the image.');
        return res.redirect(`/admin/editproduct/${productId}`);
    }
}


const renderOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 10
        const skip = (page-1)*limit

        const orders = await orderModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1})

        const totalOrders = await orderModel.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);
        res.render('order',{orders,  currentPage: page,totalPages,})
    } catch (error) {
        console.log(error)
    }
}

const cancelOrder = async(req,res)=>{
    try {
        const orderId = req.params.orderId
        console.log(orderId);
        
        const order = await orderModel.findById(orderId)

        if(!order ||  order.status==='Delivered'){
            return res.status(404).json({success:false, message:'order not found or cannot be cancelled'})
        }

        console.log(order,'oooooooooo');
        
        order.status = 'Cancelled'
        await order.save()
        return res.status(200).json({success:true,message:'order has successfully cancelled'})
        

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Internal server error'})
    }
}

const renderOrderDetailPage = async(req,res)=>{
    const id = req.params.id
    try {
        const order= await orderModel.findById(id).populate('items.product')
        const price = order.items.map((item)=>{
           return item.price
        })
        const totalPrice = order.items.map((item)=>{
            return (item.price * item.quantity)
             
        })
        const quantity = order.items.map((item)=>{
            return item.quantity
        })
        
        
        res.render('orderdetails',{order,price,totalPrice,quantity})
    } catch (error) {
        console.log(error);
        
    }
}

const approveReturn = async(req,res)=>{
    const { orderId, itemId } = req.params
    const userId = req.userId
    console.log(orderId,itemId);
    
    try {
        const order = await orderModel.findById(orderId)
        console.log(order,'ooo');
        
        const item = order.items.id(itemId)

        console.log(item,'item');
        

        if (!item || item.status !== 'Returned') {
            return res.status(400).json({ message: 'Item not eligible for approval' });
        }

        item.adminApproval=true

        console.log(item,'after approval');
        

        if(order.paymentMethod==='RazorPay'){
            console.log('hii');
            const refundAmount = await handleRefund(order,item,userId)
            console.log(refundAmount,'ree');
            
            item.refundAmount = refundAmount
        }

        await order.save()
        res.json({ success: true, message: 'Return approved and refund processed', refundAmount: item.refundAmount })
    } catch (error) {
        console.error(error)
    }
}

const updateItemStatus = async(req,res)=>{

    const{ orderId, itemId, status } = req.body
    try {
        const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
        if(!validStatuses.includes(status)){
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }
        const order = await orderModel.findById(orderId)
        if(!order){
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        const item = order.items.id(itemId)
        if(!item){
            return res.status(404).json({ success: false, message: "Order item not found" });
        }
        item.status = status
        await order.save()
        res.status(200).json({ success: true, message: "Item status updated successfully" });
    } catch (error) {
        console.error("Error updating item status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


const renderCouponPage = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 10
        const skip = (page - 1) * limit

        const coupons = await couponModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })

        const totalCoupons  = await couponModel.countDocuments()
        const totalPages = Math.ceil(totalCoupons/limit)
        res.render('coupon',{coupons,currentPage: page,totalPages})
    } catch (error) {
        console.log(error);
    }
}

const renderAddCouponPage = async(req,res)=>{
    res.render('addcoupon')
}

const createCoupon = async(req,res)=>{
    const { code, discountType, discountValue, minOrderValue, maxDiscountValue, expiresAt, isActive } = req.body;
    const userId = req.userId
    try {
        const coupons = new couponModel({
            code,
            discountType,
            discountValue,
            expiresAt,
            isActive,
            minOrderValue,
            maxDiscountValue,
        })
        await coupons.save()
        return res.status(200).json({success:true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:'Internal server error when adding coupon'})
    }
}

const deactivateCoupon = async(req,res)=>{
    const id = req.params.id
    try {
        const coupon = await couponModel.findById(id)
        if(!coupon){
            return res.status(404).json({success:false,message:'No coupon found'})
        }
        coupon.isActive=false
        await coupon.save()
        return res.status(200).json({success:true,message:'Deactivated',coupon})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:'Server error when deactivating coupon'})
    }
}

const deleteCoupon = async(req,res)=>{
    const id = req.params.id
    try {
        const coupon = await couponModel.findByIdAndDelete(id)
        if(!coupon){
            return res.status(404).json({success:false,message:'No coupon found'})
        }
        return res.status(200).json({success:true,message:'Coupon deleted',coupon})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:'Server error when delete coupon'})
    }
}

const renderOfferPage = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 10
        const skip = (page - 1) * limit
        const offers = await offerModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1})

        const totalOffers = await offerModel.countDocuments()
        const totalPages = Math.ceil(totalOffers/limit)

        res.render('offers',{offers,  currentPage: page,totalPages})
    } catch (error) {
        console.log(error);
        
    }
}

const renderAddOffers = async(req,res)=>{
    try {
        const products = await productModel.find()
        const categories  = await categoryModel.find()
        res.render('addoffers',{products, categories })
    } catch (error) {
        console.error('Error fetching products and categories:', err);
        res.status(500).send('Server Error');
    }
}

const createOffers = async (req, res) => {
    const { offerName, offerType, discountType, discountValue, startDate, endDate, applicableProducts, applicableCategories } = req.body;

    try {
        
        const isListed = req.body.isListed === 'on';

        const newOffer = new offerModel({
            offerName,
            offerType,
            discountType,
            discountValue,
            startDate,
            endDate,
            applicableProducts: offerType === 'product' ? applicableProducts : [],
            applicableCategories: offerType === 'category' ? applicableCategories : [],
            isListed,
        });

       
        await newOffer.save();

      
        if (isListed) {
          
            if (offerType === 'product' && applicableProducts && applicableProducts.length > 0) {
                const products = await productModel.find({ _id: { $in: applicableProducts } });
                for (let product of products) {
                    await applyBestOfferToProduct(product._id);  
                }
            }

            
            if (offerType === 'category' && applicableCategories && applicableCategories.length > 0) {
                const products = await productModel.find({
                    category: { $in: applicableCategories },
                });
                for (let product of products) {
                    await applyBestOfferToProduct(product._id);  
                }
            }
        }

        
        return res.redirect('/admin/offers');
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).send('An error occurred while creating the offer.');
    }
};


const offerListUnlist = async (req, res) => {
    const offerId = req.params.id;

    try {
        
        const offer = await offerModel.findById(offerId);
        if (!offer) {
            return res.status(404).send("Offer not found");
        }

       
        offer.isListed = !offer.isListed;

        
        await offer.save();

        
        if (offer.isListed) {
            if (offer.offerType === 'product' && offer.applicableProducts && offer.applicableProducts.length > 0) {
                const products = await productModel.find({ _id: { $in: offer.applicableProducts } });
                for (let product of products) {
                    await applyBestOfferToProduct(product._id);  
                }
            }

            if (offer.offerType === 'category' && offer.applicableCategories && offer.applicableCategories.length > 0) {
                const products = await productModel.find({ category: { $in: offer.applicableCategories } });
                for (let product of products) {
                    await applyBestOfferToProduct(product._id); 
                }
            }
        } else {
            
            if (offer.offerType === 'product' && offer.applicableProducts && offer.applicableProducts.length > 0) {
                const products = await productModel.find({ _id: { $in: offer.applicableProducts } });
                for (let product of products) {
                    product.bestOffer = null;
                    product.discountedPrice = null;  
                    await product.save(); 
                }
            }

            if (offer.offerType === 'category' && offer.applicableCategories && offer.applicableCategories.length > 0) {
                const products = await productModel.find({ category: { $in: offer.applicableCategories } });
                for (let product of products) {
                    product.bestOffer = null;
                    product.discountedPrice = null;  
                    await product.save();  
                }
            }
        }

        
        res.redirect('/admin/offers');
    } catch (error) {
        console.error("Error toggling offer listing:", error);
        res.status(500).send("Server Error");
    }
};


const deleteOffer = async (req, res) => {
    const id = req.params.id;
    try {
       
        const offer = await offerModel.findByIdAndDelete(id);
        if (!offer) {
            req.flash("error-message", "Offer not found.");
            return res.redirect("/admin/offers");
        }

        
        const products = await productModel.find({
            $or: [
                { bestOffer: id }, 
                { category: { $in: offer.applicableCategories } }, 
                { _id: { $in: offer.applicableProducts } } 
            ]
        });

        
        for (const product of products) {
            await applyBestOfferToProduct(product._id); 
        }

       
        req.flash("success-message", "Offer deleted and products updated successfully.");
        return res.redirect("/admin/offers");
    } catch (error) {
       
        console.error("Error deleting offer:", error);
        req.flash("error-message", "Failed to delete offer. Please try again.");
        return res.redirect("/admin/offers");
    }
};

const renderSalesReportPage = async (req, res) => {
    try {
        const { startDate, endDate, timeFilter, page = 1 } = req.query;
        let filter = {};

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: moment(startDate).startOf('day').toDate(),
                $lte: moment(endDate).endOf('day').toDate(),
            };
        }

        if (timeFilter) {
            const now = moment();
            switch (timeFilter) {
                case 'day':
                    filter.createdAt = { $gte: now.startOf('day').toDate() };
                    break;
                case 'week':
                    filter.createdAt = { $gte: now.startOf('week').toDate() };
                    break;
                case 'month':
                    filter.createdAt = { $gte: now.startOf('month').toDate() };
                    break;
            }
        }

        const orders = await orderModel.find(filter)
            .skip((page - 1) * 10)
            .limit(10)
            .sort({ createdAt: -1 });

        const totalOrders = await orderModel.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / 10);
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            previousPage: page - 1,
            nextPage: page + 1
        };

        res.render('salesreport', {
            orders,
            pagination,
            startDate,
            endDate,
            timeFilter
        });
    } catch (error) {
        console.error('Error rendering sales report page:', error);
    }
};

const downloadExcelSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, timeFilter } = req.body;
        let filter = {};

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (timeFilter) {
            const now = moment();
            switch (timeFilter) {
                case 'day':
                    filter.createdAt = { $gte: now.startOf('day').toDate() };
                    break;
                case 'week':
                    filter.createdAt = { $gte: now.startOf('week').toDate() };
                    break;
                case 'month':
                    filter.createdAt = { $gte: now.startOf('month').toDate() };
                    break;
            }
        }

        const orders = await orderModel.find(filter);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'orderID', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Discount', key: 'discount', width: 15 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', width: 20 }
        ];

        orders.forEach(order => {
            worksheet.addRow({
                orderID: order._id,
                date: new Date(order.createdAt).toLocaleDateString(),
                discount: `Rs.${order.discount.toFixed(2)}`,
                amount: `Rs.${order.totalPrice.toFixed(2)}`,
                paymentMethod: order.paymentMethod
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Disposition', 'attachment; filename=salesreport.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Error downloading Excel sales report:', error);
   
    }
};

const downloadPdfSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, timeFilter } = req.query;
        let filter = {};

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (timeFilter) {
            const now = moment();
            switch (timeFilter) {
                case 'day':
                    filter.createdAt = { $gte: now.startOf('day').toDate() };
                    break;
                case 'week':
                    filter.createdAt = { $gte: now.startOf('week').toDate() };
                    break;
                case 'month':
                    filter.createdAt = { $gte: now.startOf('month').toDate() };
                    break;
            }
        }

        const orders = await orderModel.find(filter);

       
        const doc = new PDFDocument({ margin: 30, bufferPages: true });

        
        doc.fontSize(18).text('Sales Report', { align: 'center', underline: true });
        doc.moveDown(0.5);
        if (startDate && endDate) {
            doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`, { align: 'center' });
        }
        if (timeFilter) {
            doc.fontSize(12).text(`Time Filter: ${timeFilter}`, { align: 'center' });
        }
        doc.moveDown(1);

       
        doc.fontSize(10).text('Order ID', 50, doc.y, { width: 100, continued: true })
            .text('Date', 150, doc.y, { width: 100, continued: true })
            .text('Discount', 250, doc.y, { width: 80, continued: true, align: 'right' })
            .text('Amount', 330, doc.y, { width: 80, continued: true, align: 'right' })
            .text('Payment Method', 410, doc.y, { width: 120, align: 'right' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate instanceof Date && !isNaN(orderDate) ? orderDate.toLocaleDateString() : 'Invalid Date';

            doc.text(order._id, 50, doc.y, { width: 100, continued: true })
                .text(formattedDate, 150, doc.y, { width: 100, continued: true })
                .text(`Rs.${order.discount.toFixed(2)}`, 250, doc.y, { width: 80, continued: true, align: 'right' })
                .text(`Rs.${order.totalPrice.toFixed(2)}`, 330, doc.y, { width: 80, continued: true, align: 'right' })
                .text(order.paymentMethod, 410, doc.y, { width: 120, align: 'right' });
            doc.moveDown(0.5);
        });

       
        doc.moveDown(2);
        doc.fontSize(10).text('Thank you for using our services.', { align: 'center', italic: true });

        const range = doc.bufferedPageRange(); 
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);
            doc.text(`Page ${i + 1} of ${range.count}`, 0, 750, { align: 'center' });
        }

        // Send PDF
        res.setHeader('Content-Disposition', 'attachment; filename=salesreport.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Error downloading PDF sales report:', error);
        res.status(500).send('Error generating PDF report');
    }
};




const adminSalesData = async(req,res)=>{
    const { filter, startDate, endDate } = req.query;
    let start, end;

    try {
        if (filter === 'yearly') {
            const year = new Date().getFullYear();
            start = new Date(`${year}-01-01`);
            end = new Date(`${year}-12-31`);
        } else if (filter === 'monthly') {
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            start = new Date(`${year}-${month}-01`);
            end = new Date(`${year}-${month + 1}-01`);
        } else if (filter === 'custom') {
            start = new Date(startDate);
            end = new Date(endDate);
        }

        const salesData = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        res.status(200).json({ success: true, salesData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getBestSellingItems = async (req, res) => {
    try {
        const { type, days } = req.query; // Include `days` in the query parameters
        console.log({ type, days });

        let groupByField, lookupCollection, localField, foreignField, projectFields;

        if (type === 'products') {
            groupByField = '$items.product';
            lookupCollection = 'productmodels'; 
            localField = '_id';
            foreignField = '_id';
            projectFields = {
                _id: 0,
                productId: '$_id',
                name: '$productDetails.name',
                totalQuantity: 1,
            };
        } else if (type === 'categories') {
            groupByField = '$productDetails.category';
            lookupCollection = 'categories'; 
            localField = '_id';
            foreignField = '_id';
            projectFields = {
                _id: 0,
                categoryId: '$_id',
                name: '$categoryDetails.name',
                totalQuantity: 1,
            };
        } else if (type === 'brands') {
            groupByField = '$productDetails.brandname';
            lookupCollection = 'brands';
            localField = '_id';
            foreignField = '_id';
            projectFields = {
                _id: 0,
                brandId: '$_id',
                name: '$brandDetails.name',
                totalQuantity: 1,
            };
        } else {
            return res.status(400).json({ success: false, message: "Invalid type parameter" });
        }

        // Calculate the date filter based on `days`
        const dateFilter = days
            ? {
                createdAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(days))),
                },
            }
            : {};

        // Build the aggregation pipeline
        const aggregationPipeline = [
            { $match: dateFilter }, // Add the date filter to the pipeline
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'productmodels', 
                    localField: 'items.product', 
                    foreignField: '_id', 
                    as: 'productDetails',
                },
            },
            { 
                $unwind: { 
                    path: '$productDetails', 
                    preserveNullAndEmptyArrays: true, 
                },
            },
            {
                $group: {
                    _id: groupByField, 
                    totalQuantity: { $sum: '$items.quantity' },
                },
            },
            { $sort: { totalQuantity: -1 } }, 
            { $limit: 10 },
            {
                $lookup: {
                    from: lookupCollection, 
                    localField: '_id', 
                    foreignField: '_id', 
                    as: `${type}Details`,
                },
            },
            { $unwind: `$${type}Details` },
            {
                $project: {
                    _id: 0,
                    name: `$${type}Details.name`,
                    totalQuantity: 1,
                },
            },
        ];

        const bestSellingItems = await orderModel.aggregate(aggregationPipeline);
        console.log(bestSellingItems);

        return res.status(200).json({ success: true, data: bestSellingItems });
    } catch (error) {
        console.error("Error in fetching best-selling items:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch best-selling items" });
    }
};



module.exports = {
    renderHome,
    renderProducts,
    renderBrands,
    renderAddProducts,
    renderCategories,
    renderOrders,
    renderAddBrands,
    renderAddCategory,
    addCategories,
    categoryList,
    categoryUnlist,
    renderEditCategory,
    editCategory,
    renderUsers,
    blockUser,
    unblockUser,
    addBrands,
    renderEditBrands,
    editBrands,
    unlistBrands,
    listBrands,
    addProduct,
    unpublishProduct,
    publishProduct,
    renderEditProduct,
    editproduct,
    deleteImage,
    cancelOrder,
    renderOrderDetailPage,
    renderCouponPage,
    renderAddCouponPage,
    createCoupon,
    deactivateCoupon,
    deleteCoupon,
    renderOfferPage,
    renderAddOffers,
    createOffers,
    offerListUnlist,
    deleteOffer,
    updateItemStatus,
    renderSalesReportPage,
    downloadExcelSalesReport,
    downloadPdfSalesReport,
    adminSalesData,
    getBestSellingItems,
    approveReturn
}
