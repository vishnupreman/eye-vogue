const brandModel = require('../model/brand')
const categoryModel = require('../model/category')
const userModel = require('../model/userModel')
const productModel = require('../model/products')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises;
const orderModel= require('../model/order')
const { log } = require('console')

const renderHome = async (req, res) => {
    res.render('dashboard')
}

const renderProducts = async (req, res) => {
    const product = await productModel.find()
    const success_message = req.flash('success-message')
    console.log('product is', product);
    res.render('products', { product, success_message })
}

const renderBrands = async (req, res) => {
    const brands = await brandModel.find()
    res.render('brands', { brands })
}

const renderAddProducts = async (req, res) => {
    const category = await categoryModel.find()
    const brand = await brandModel.find()
    const error_message = req.flash('error-message')
    res.render('addproducts', { category, brand, error_message })
}

const renderCategories = async (req, res) => {
    const category = await categoryModel.find()
    res.render('category', { category })
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
    const users = await userModel.find()
    res.render('users', { users })
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
        product_gender, frame_color, material, frame_style, small, medium, large } = req.body;

    try {
        console.log("colors", colors)
        const productNameLower = productName.toLowerCase()
        const existingProduct = await productModel.findOne({ name: productNameLower })
        if (existingProduct) {
            req.flash('error-message', 'Product with same name already exists')
            return res.redirect('/admin/addproducts')
        }
        // if (!req.files || req.files.length < 3) {
        //     req.flash('error_message', 'Add atleast three images')
        //     return res.redirect('/admin/addproducts')
        // }
        // const media = req.files.map(file => file.filename);

        const newProduct = new productModel({
            name: productNameLower,
            description: productDescription,
            price: price,
            category: product_category,
            brandname: product_brand,
            // images: media,
            // stock: stock,
            gender: product_gender,
            frameColor: frame_color,
            material,
            frameStyle: frame_style,
            // color:{

            // },
            size: {
                s: {
                    quantity: small
                },
                m: {
                    quantity: medium
                },
                l: {
                    quantity: large
                },
            },
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
                console.log("imagePatharrary", imagePaths)


                newProduct.colors[color] = {
                    quantity: colorData.quantity || 0,
                    images: imagePaths
                };
            }
        }






        await newProduct.save();
        return res.redirect('/admin/products');
    } catch (error) {
        console.log(error);
        // return res.render('addproducts', { errorMessage: 'An error occurred while adding the product.' });
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
        small,
        medium,
        large,
        existingImages
    } = req.body;

    console.log(req.files);
    console.log(req.body);
    try {
        const productNameLower = productName.toLowerCase();

        const existingProduct = await productModel.findOne({ name: productNameLower });
        if (existingProduct && existingProduct._id.toString() !== id) {
            req.flash('error-message', 'Product with the same name already exists');
            return res.redirect(`/admin/editproduct/${id}`);
        }


        const product = await productModel.findById(id);
        const updatedColors = { ...product.colors };

        // console.log({ ...product.colors },'hiiiiiiiiiiiiiiiiiii');
        

        ['red', 'black', 'green', 'yellow'].forEach(color => {

            const colorQuantity = req.body[`${color}Quantity`];
            if (colorQuantity) {
                updatedColors[color].quantity = colorQuantity;


                // console.log(updatedColors[color].quantity,'secodndddd');
                
            }

            updatedColors[color].images = existingImages && existingImages[color]
                ? existingImages[color]
                : [];

            // console.log(updatedColors[color].images,'thirdddd');
            

            if (req.files && req.files[`colors[${color}][images][]`]) {
                const newImages = req.files[`colors[${color}][images][]`].map(file => file.filename);
                updatedColors[color].images = [...updatedColors[color].images, ...newImages]; 
                
                // console.log(newImages,'fourthhhhh');
                // console.log(updatedColors[color].images,'fifthhhhhh');
                
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
            size: {
                s: { quantity: small },
                m: { quantity: medium },
                l: { quantity: large }
            }
        }, { new: true });

        await updatedProduct.save();
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
        const orders = await orderModel.find()
        res.render('order',{orders})
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
    renderOrderDetailPage
}
