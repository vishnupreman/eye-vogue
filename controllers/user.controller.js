const productModel = require('../model/products');
const userModel = require('../model/userModel')
const brandModel = require('../model/brand')
const categoryModel = require('../model/category')
const addressModel = require('../model/address');
const cartModel = require('../model/cart');
const orderModel = require('../model/order');
const { default: mongoose } = require('mongoose');
const couponModel = require('../model/coupon')
const Razorpay = require('razorpay')
const crypto = require("crypto")
require('dotenv').config()
const wishlistModel = require('../model/wishlist')
const walletModel = require('../model/wallet')
const {handleRefund} = require('../utility/handlerefund')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

const renderHome = async (req, res) => {
    try {
        const currentDate = new Date();
        
        const category = await categoryModel.find();
  
        const products = await productModel.find({ isPublished: true })
            .populate({
                path: 'category', 
                match: { isListed: true }, 
                select: 'name'
            })
            .populate('bestOffer');

        
        const productsWithDiscounts = products.map(product => {
            if (product.bestOffer && product.bestOffer.isListed && product.bestOffer.endDate >= currentDate && product.bestOffer.startDate <= currentDate) {
                let discountAmount = 0;
                if (product.bestOffer.discountType === 'percentage') {
                    discountAmount = product.price * (product.bestOffer.discountValue / 100);
                } else if (product.bestOffer.discountType === 'fixed') {
                    discountAmount = product.bestOffer.discountValue;
                }
                
               
                product.discountedPrice = Math.max(product.price - discountAmount, 0);
                product.offerLabel = `Save ${product.bestOffer.discountValue}%`; 
            } else {
                product.discountedPrice = product.price; 
            }
            return product;
        });

        res.render('home', { products: productsWithDiscounts, category });
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Error retrieving products for homepage.");
    }
};


///products
// ----------------------------------------------------------------------------------------------
const renderProductPage = async (req, res) => {
    const id = req.params.id;
    try {
        const currentDate = new Date();
        
      
        const product = await productModel.findById(id)
            .populate('brandname', 'name')
            .populate('category', 'name')
            .populate('bestOffer');
        
       
        if (product.bestOffer && product.bestOffer.isListed && product.bestOffer.endDate >= currentDate && product.bestOffer.startDate <= currentDate) {
            let discountAmount = 0;
            if (product.bestOffer.discountType === 'percentage') {
                discountAmount = product.price * (product.bestOffer.discountValue / 100);
            } else if (product.bestOffer.discountType === 'fixed') {
                discountAmount = product.bestOffer.discountValue;
            }
            product.discountedPrice = Math.max(product.price - discountAmount, 0); 
            product.offerLabel = `Save ${product.bestOffer.discountValue}%`; 
        } else {
            product.discountedPrice = product.price; 
            product.offerLabel = null; 
        }

        
        res.render('productpage', { products:product });
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Error retrieving product details.");
    }
};



//accounts address,edit,delete,add
// -----------------------------------------------------------------------------------------
const renderMyAccount = async (req, res) => {
    try {
        const userId = req.userId
        const user = await userModel.findById(userId)
        const error_message = req.flash('error-message')
        const new_message = req.flash('new-message')
        res.render('myaccount', { user, error_message, new_message })
    } catch (error) {
        console.log(error)
    }
}
const renderEditUserName = async (req, res) => {
    const id = req.params.id
    try {
        const user = await userModel.findById(id)
        res.render('editusername', { user })
    } catch (error) {
        console.log(error)
    }
}

const editUserName = async (req, res) => {
    const id = req.params.id
    const { dname } = req.body
    try {
        const user = await userModel.findByIdAndUpdate(id, { name: dname })
        await user.save()
        return res.redirect('/user/myaccount')
    } catch (error) {
        console.log(error)
    }
}

const editPassword = async (req, res) => {
    const userId = req.userId
    const { password, cpassword } = req.body
    console.log(req.body)
    try {
        const user = await userModel.findById(userId)
        if (!(await user.comparePassword(password))) {
            req.flash('error-message', 'Incorrect password')
            return res.redirect('/user/myaccount')
        }
        user.password = cpassword
        await user.save()

        req.flash('new-message', 'password has updated')
        return res.redirect('/user/myaccount')
    } catch (error) {
        console.log(error)
    }
}

const renderAddressPage = async (req, res) => {
    try {
        const userId = req.userId
        const address = await addressModel.findOne({ user: userId })
        const success_message = req.flash('success-message')
        const addresses = address ? address.addressDetails : []
        res.render('address', { addresses, success_message })
    } catch (error) {
        console.log(error)
    }
}

const renderAddAdress = async (req, res) => {
    res.render('addaddress')
}

const enteredAddress = async (req, res) => {
    const { name, address, country, state, city, landmark, pincode } = req.body
    const userId = req.userId
    try {
        let userAddress = await addressModel.findOne({ user: userId })
        if (!userAddress) {
            userAddress = new addressModel({
                user: userId,
                addressDetails: [{
                    name,
                    address,
                    country,
                    state,
                    city,
                    landmark,
                    pincode
                }]
            })

        } else {
            userAddress.addressDetails.push({
                name,
                address,
                country,
                state,
                city,
                landmark,
                pincode
            })
        }

        await userAddress.save()
        return res.redirect('/user/address')
    } catch (error) {
        console.log(error)
    }
}

const renderEditAddress = async (req, res) => {
    try {
        const id = req.params.id
        const userId = req.userId
        const success_message = req.flash('success-message')
        const userAddress = await addressModel.findOne({ user: userId, 'addressDetails._id': id })
        if (!userAddress) {
            req.flash('error-message', 'Address not found')
            return res.redirect('/user/myaccount')
        }

        const address = userAddress.addressDetails.id(id)
        return res.render('editaddress', { address, success_message })
    } catch (error) {
        console.log(error)
    }
}

const editAddress = async (req, res) => {
    const userId = req.userId
    const id = req.params.id
    const { name, address, country, state, city, landmark, pincode } = req.body
    try {
        const userAddress = await addressModel.findOne({ user: userId })
        if (!userAddress) {
            req.flash('error-message', 'Address not found');
            return res.redirect('/user/address');
        }

        const updateAddress = userAddress.addressDetails.id(id)
        if (!updateAddress) {
            req.flash('error-message', 'Address not found');
            return res.redirect('/user/address');
        }

        updateAddress.name = name
        updateAddress.address = address
        updateAddress.country = country
        updateAddress.state = state
        updateAddress.city = city
        updateAddress.landmark = landmark
        updateAddress.pincode = pincode

        await userAddress.save()
        req.flash('success-message', 'Address updated successfully');
        res.redirect('/user/address');

    } catch (error) {
        console.log(error)
    }
}

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const userId = req.userId;

        const addressDoc = await addressModel.findOne({ user: userId });
        if (addressDoc) {
            addressDoc.addressDetails = addressDoc.addressDetails.filter(address => address._id.toString() !== addressId);
            await addressDoc.save();
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ message: 'Address not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//-------------------------------------------------------------------------------------------------

const addToCart = async (req, res) => {
    const userId = req.userId;
    const { id, color } = req.body; 

    try {
        
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

       
        if (!product.colors[color]) {
            return res.status(400).json({ error: 'This color is not available' });
        }

        
        const availableStock = product.colors[color].quantity;
        if (availableStock <= 0) {
            return res.status(400).json({ error: 'This color is out of stock' });
        }

   
        let cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            cart = new cartModel({
                user: userId,
                items: [],
            });
        }

     
        const existingItem = cart.items.find(item => 
            item.product.toString() === id && item.color === color
        );

        if (existingItem) {
    
            const updatedQuantity = existingItem.quantity + 1;
            if (updatedQuantity > availableStock) {
                return res.status(400).json({ error: 'Quantity exceeds available stock' });
            }
            existingItem.quantity = updatedQuantity;
        } else {
 
            cart.items.push({
                product: new mongoose.Types.ObjectId(id),
                color,
                quantity: 1,
                price: product.discountedPrice || product.price, 
            });
        }


        cart.calculateTotalPrice();  

  
        await cart.save();

        return res.status(200).json({ message: 'Product successfully added to cart', cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const renderCartPage = async (req, res) => {
    const userId = req.userId
    try {
        const cart = await cartModel.findOne({ user: userId }).populate('items.product')

        const cartItems = cart ? cart.items : []

        console.log(cartItems);


        res.render('cart', { cart, cartItems })

    } catch (error) {
        console.log('error')
    }
}

const updateQuantity = async (req, res) => {
    const { productId, newQuantity, color } = req.body;
    const userId = req.userId;

    try {
       
        const cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.items.find(item =>
            item.product.toString() === productId &&
            item.color === color
        );

        if (!item) {
            return res.status(404).json({ success: false, message: 'No item found in the cart' });
        }

     
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

    
        const availableStock = product.colors[color].quantity;

        if (newQuantity > availableStock) {
            return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' });
        }

        item.quantity = newQuantity;

      
        let updatedPrice = product.discountedPrice || product.price;

      
        if (product.bestOffer && product.bestOffer.isListed) {
            updatedPrice = updatedPrice - (updatedPrice * product.bestOffer.discountPercentage) / 100;
        }

     
        item.price = updatedPrice;

    
        cart.totalPrice = cart.items.reduce((acc, item) => {
            return acc + (item.price * item.quantity);
        }, 0);

      
        await cart.save();

        return res.status(200).json({ success: true, message: 'Quantity and price updated successfully', cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



const removeProductCart = async (req, res) => {
    const userId = req.userId
    const { productId } = req.body

    try {

        const cart = await cartModel.findOne({ user: userId })

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' })
        }



        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)



        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in cart ' })
        }
        cart.items.splice(itemIndex, 1)
        cart.totalPrice = cart.items.reduce((acc, item) => {
            return acc + (item.price * item.quantity)
        }, 0)

        await cart.save()
        res.json({ success: true, message: 'Item removed from the cart', cart });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const renderCheckOutPage = async (req, res) => {
    const userId = req.userId
    try {
        const cart = await cartModel.findOne({ user: userId }).populate('items.product')
        
        console.log(cart,'cc');
        
        const address = await addressModel.find({ user: userId })
        const cartItems = cart ? cart.items : []
        
        if (!cart || cart.items.length === 0) {
            return res.redirect('/user/cart')
        }

        console.log(cart.totalPrice,'tt');
        
        // const deliveryCharge = cart.totalPrice > 1000 ? 0 : 40
        let deliveryCharge
        if(cart.totalPrice >= 1000){
            deliveryCharge = 40
        }

        console.log(deliveryCharge,'ddd');
        
        res.render('checkout', {
            cart,
            cartItems,
            address,
            user: userId,
            items: cart.items,
            totalPrice: cart.totalPrice+deliveryCharge,
            deliveryCharge
        })
    } catch (error) {
        console.log(error)

    }
}


const placeOrder = async (req, res) => {
    const { addressID, payment_option, code , deliveryCharge} = req.body;
    const userId = req.userId;

    try {
        const cart = await cartModel.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ success: false, message: 'No items in cart' });
        }

        const addresses = await addressModel.findOne({ user: userId });
        const address = addresses.addressDetails.find(addr => addr.id.toString() === addressID);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        let totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        let discountAmount = 0;

        if (code) {
            const coupon = await couponModel.findOne({
                code: code.toUpperCase(),
                isActive: true,
                expiresAt: { $gte: new Date() },
                usedBy: { $ne: userId }
            });

            if (!coupon) {
                return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
            }

            if (totalPrice < coupon.minOrderValue) {
                return res.status(400).json({
                    success: false,
                    message: `This coupon requires a minimum order value of ${coupon.minOrderValue}.`
                });
            }

            if (coupon.discountType === 'percentage') {
                discountAmount = (totalPrice * coupon.discountValue) / 100;
                if (coupon.maxDiscountValue) {
                    discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
                }
            } else if (coupon.discountType === 'fixed') {
                discountAmount = coupon.discountValue;
            }

            totalPrice -= discountAmount;
        }

        totalPrice = Math.max(totalPrice, 0);
        
        // const deliveryCharge = totalPrice >= 1000 ? 0 : 40; 
        // totalPrice += deliveryCharge;
        const deliveryCharge = 40
        if(totalPrice >= 1000){
            totalPrice += deliveryCharge
        }

        if(payment_option==='COD' && totalPrice>1000){
            return res.status(400).json({success:false,message: 'Cash on Delivery is not available for orders above ₹1000.'})
        }

        const order = new orderModel({
            user: userId,
            items: cart.items,
            totalPrice,
            billingAddress: address,
            paymentMethod: payment_option,
            status: payment_option === 'RazorPay' ? 'Pending' : 'Confirmed',
            paymentStatus: payment_option==='COD' ? 'Paid' : 'Pending',
            discount: discountAmount,
            deliveryCharge
        });

        await order.save();
        
        if (payment_option === 'COD') {
            for (const item of cart.items) {
                const product = await productModel.findById(item.product._id);
                if (product.colors[item.color].quantity < item.quantity) {
                    await order.remove();
                    return res.status(400).json({ success: false, message: 'Insufficient stock for some items' });
                }
                product.colors[item.color].quantity -= item.quantity;
                await product.save();
            }

            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();

            
            if (code) {
                await couponModel.updateOne({ code: code.toUpperCase() }, { $push: { usedBy: userId } });
            }

        } else if (payment_option === 'RazorPay') {
            try {
                const razorpayOrder = await razorpay.orders.create({
                    amount: totalPrice * 100,
                    currency: 'INR',
                    receipt: `receipt_order_${Date.now()}`,
                });

                return res.json({
                    success: true,
                    orderId: order._id,
                    razorpay_order_id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    code:code
                });
            } catch (error) {
                console.error("Error creating Razorpay order:", error);
                await order.remove();
                return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
            }
        }

        return res.status(200).json({
            success: true,
            orderId: order._id,
            addressID,
            discountAmount,
            deliveryCharge
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};







const renderOrderConfrimPage = async (req, res) => {
    try {
        const orderId = req.params.id
        const orders = await orderModel.findById(orderId).populate('items.product').populate('user')
        if (!orders) {
            return res.status(404).send('Order  not found')
        }

        const address = orders.billingAddress
        const totalPrice = orders.totalPrice
        const items = orders.items
        const date = orders.createdAt.toLocaleString()

        res.render('orderplaced', { address, totalPrice, items, orderId, date })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal server error')
    }
}

const renderOrderPage = async (req, res) => {
    const userId = req.userId;

    try {
        const orders = await orderModel.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 });
          
            console.log(orders,'ooo');
            
        res.render('myorder', { orders});
    } catch (error) {
        console.log("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
};

const orderDetailedPage = async(req,res)=>{
    const id = req.params.id
    try {
        const orders = await orderModel.findById(id).populate('items.product')
        return res.render('userorderdetails',{orders})
    } catch (error) {
        console.log(error);
    }
}

const cancelOrder = async (req, res) => {
    const userId = req.userId
    console.log('hii');
    
    try {
        const{orderId, itemId} = req.params
        const order = await orderModel.findById(orderId).populate('items.product')
        console.log(itemId,'aa');
    
        const item = order.items.find(item=>item.id.toString()===itemId)

        if(!item || (item.status !== 'Pending' && item.status !== 'Confirmed' && item.status !== 'Shipped')){
            return res.status(400).json({ message: 'Item not eligible for cancellation' })
        }
        item.status = 'Cancelled'

        const product = item.product
        if(product.colors && product.colors[item.color]){
            product.colors[item.color].quantity += item.quantity
        }

        await product.save()

        if(order.paymentMethod==='RazorPay'){
            const refundAmount = await handleRefund(order, item, userId)
            item.refundAmount = refundAmount;
        }
        await order.save()

        res.json({ success: true, status: 'Cancelled', refundAmount: item.refundAmount })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error cancelling item' });
    }
};


const returnOrder = async (req, res) => {
    const { orderId, itemId } = req.params
    const userId = req.userId
    try {
        const order = await orderModel.findById(orderId).populate('items.product')
        const item = order.items.id(itemId)

        if (!item || item.status !== 'Delivered') {
            return res.status(400).json({ message: 'Item not eligible for return' })
        }
        item.status='Returned'
        
        const product = item.product
        if(product.colors && product.colors[item.color]){
            product.colors[item.color].quantity += item.quantity
        }
        await product.save()

        if(order.paymentMethod === 'RazorPay'){
            const refundAmount = await handleRefund(order,item,userId)
            item.refundAmount = refundAmount
        }

        await order.save()
        res.json({ success: true, status: 'Returned', refundAmount: item.refundAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error returning item' });
    }

};


const renderShop = async (req, res) => {
    try {
        const category = await categoryModel.find();

      
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

       
        const totalProducts = await productModel.countDocuments({ isPublished: true });

        
        const totalPages = Math.ceil(totalProducts / limit);

     
        const products = page > totalPages
            ? []
            : await productModel.find({ isPublished: true })
                .populate({
                    path: 'category',
                    match: { isListed: true },
                })
                .skip((page - 1) * limit)
                .limit(limit);

      
        res.render('shop', {
            products,
            category,
            totalPages,
            currentPage: page,
            totalProducts,
        });
    } catch (error) {
        console.log(error);
    }
};



const filterShop = async (req, res) => {
    try {
       
        const { category, color, min_price, max_price, sort,name } = req.query
        console.log(req.query);
        
     
        let filter = { isPublished: true };

        if (category) {
            filter.category = category;
        }

        if (color) {
            filter[`colors.${color}.quantity`] = { $gt: 0 }; 
        }

        if (min_price || max_price) {
            filter.price = {}; 

            if (min_price) {
                filter.price.$gte = parseFloat(min_price);
            }

            if (max_price) {
                filter.price.$lte = parseFloat(max_price); 
            }
        }

        if (name) {
            filter.name = { $regex: name, $options: 'i' };  
        }
     
        let sortOrder = {}; 
        if (sort === 'priceLowHigh') {
            sortOrder = { price: 1 }; 
        } else if (sort === 'priceHighLow') {
            sortOrder = { price: -1 }; 
        } else if (sort === 'nameAsc') {
            sortOrder = { name: 1 }; 
        } else if (sort === 'nameDesc') {
            sortOrder = { name: -1 }; 
        } else {
            sortOrder = { createdAt: -1 };
        }

        
        const products = await productModel.find(filter).sort(sortOrder).populate('category');

       
        res.json({ products });
        
    } catch (error) {
        console.error("Error occurred while filtering products:", error);
        res.status(500).json({ error: 'An error occurred while filtering products' });
    }
};



const showCoupons = async (req, res) => {
    try {
        const userId = req.userId;

       
        const cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const cartTotal = cart.totalPrice;
        // console.log("Cart Total:", cartTotal); 
        // console.log(cartTotal);
        
        const availableCoupons = await couponModel.find({
            minOrderValue: { $lt: cartTotal },
            isActive: true,
            usedBy: { $ne: userId },
            expiresAt: { $gte: new Date() }
        });

        console.log(availableCoupons,'aaa');
        
        if (!availableCoupons || availableCoupons.length === 0) {
            return res.status(404).json({ success: false, message: 'No coupons available for your cart total.' });
        }

        return res.status(200).json({ success: true, coupons: availableCoupons });
    } catch (error) {
        console.error("Error in showCoupons controller:", error);
        return res.status(500).json({ success: false, message: 'Server error when finding coupons' });
    }
};

const applyCoupon = async (req, res) => {
    try {
        const userId = req.userId;
        const { code } = req.body;

       
        const cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const coupon = await couponModel.findOne({
            code: code.toUpperCase(),
            isActive: true,
            expiresAt: { $gte: new Date() },
            usedBy: { $ne: userId }
        });

    
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
        }

    
        if (cart.totalPrice < coupon.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `This coupon requires a minimum order value of ${coupon.minOrderValue}.`
            });
        }

   
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cart.totalPrice * coupon.discountValue) / 100;
            if (coupon.maxDiscountValue) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
            }
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        }

    
        const newTotal = Math.max(cart.totalPrice - discountAmount, 0);

       
        cart.totalPrice = newTotal;
        cart.appliedCoupon = coupon._id;

        await cart.save();
        
        
        await coupon.save();

        return res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            discountAmount,
            newTotal
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error when applying coupon' });
    }
};

const removeCoupon = async(req,res)=>{
    const userId = req.userId
    try {
        const cart = await cartModel.findOne({user:userId})
        if(!cart){
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        if(!cart.appliedCoupon){
            return res.status(400).json({ success: false, message: 'No coupon applied' });
        }


        const total = cart.items.reduce((acc,item)=>{
            return acc+(item.price*item.quantity)
        },0)

        cart.totalPrice = total
        const coupon = await couponModel.findById(cart.appliedCoupon);
        const userIndex = coupon.usedBy.indexOf(userId)
        coupon.usedBy.splice(userIndex,1)
        
        cart.appliedCoupon = null
        await cart.save()
        await coupon.save()
        return res.status(200).json({ success: true,message: 'Coupon removed successfully',updatedCart: cart});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error when removing coupon' });
    }
}

const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEYSECRET
})




const verifyRazorPay = async (req, res) => {
    const userId = req.userId;
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, code } = req.body;
        console.log(code,'codee');
        console.log(req.body,'body');
        
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEYSECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature === razorpay_signature) {
            const order = await orderModel.findById(orderId).populate('items.product');
            
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }
            // const deliveryCharge = order.deliveryCharge || 0; 
            // const totalAmountWithDelivery = order.totalPrice + deliveryCharge;

            order.paymentStatus = 'Paid';
            order.status = 'Confirmed';

           
            for (const item of order.items) {
                const product = await productModel.findById(item.product._id);
                if (product.colors[item.color].quantity < item.quantity) {
                    order.paymentStatus = 'Pending';
                    order.status = 'Failed';
                    await order.save();
                    return res.status(400).json({ success: false, message: 'Insufficient stock for some items' });
                }

                product.colors[item.color].quantity -= item.quantity;
                await product.save();
            }

            await order.save();

            const cart = await cartModel.findOne({ user: userId });
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();

            if (code) {
                console.log('inside code');
                
                const couponUpdateResult = await couponModel.findOneAndUpdate(
                    { code: code.toUpperCase() },
                    { $addToSet: { usedBy: userId } },  
                    { new: true }  
                );

                if (!couponUpdateResult) {
                    console.error("Coupon update failed. Coupon not found or already used.");
                } else {
                    console.log("Coupon successfully updated:", couponUpdateResult);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Payment verified and stock deducted successfully",
                orderId: orderId
            });
        } else {
            
            await orderModel.findByIdAndDelete(orderId);
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        return res.status(500).json({ success: false, message: "Failed to verify payment" });
    }
};






const renderWishList = async(req,res)=>{
    const userId = req.userId
    console.log(userId);
    
    try {
        const wishlist = await wishlistModel.findOne({user:userId}).populate({
            path:'items.product',
            select:'name price discountedPrice colors images' 
        })
        if(!wishlist){
            return res.render('wishlist', { items: [] });
        }
        const items = wishlist ? wishlist.items.map(item => {
            const product = item.product;
            const colorData = product.colors[item.color];
            return {
                name: product.name,
                price: item.price,
                discountedPrice: product.discountedPrice,
                color: item.color,
                image: colorData.images[0], 
                stockStatus: colorData.quantity > 0 ? 'In Stock' : 'Out of Stock',
                productId: product._id
            };
        }) : [];
        
        
        res.render('wishlist',{items,wishlist})
    } catch (error) {
        console.log(error);
    }
}




const addToWishList = async (req, res) => {
    const userId = req.userId; 
    const { color, id } = req.body; 
    
    try {
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!product.colors || !product.colors[color]) {
            return res.status(400).json({ message: 'Invalid color selected' });
        }

        const productColor = product.colors[color];
        if (productColor.quantity <= 0) {
            return res.status(400).json({ message: `Sorry, this product in ${color} is out of stock` });
        }

        const existingWishListItem = await wishlistModel.findOne({
            user: userId,
            'items.product': id,
            'items.color': color,
        });

        if (existingWishListItem) {
            return res.json({ message: 'Product already in wishlist' });
        }

        const wishList = await wishlistModel.findOne({ user: userId });
        const itemPrice = product.discountedPrice || product.price; 

        if (wishList) {
            
            wishList.items.push({
                product: id,
                color: color,
                price: itemPrice, 
            });
            await wishList.save();
        } else {
            
            const newWishList = new wishlistModel({
                user: userId,
                items: [{
                    product: id,
                    color: color,
                    price: itemPrice, 
                }]
            });
            await newWishList.save();
        }

        return res.json({ message: 'Product successfully added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return res.status(500).json({ message: 'Server error, please try again later' });
    }
};



const removeFromWishList = async (req, res) => {
    const userId = req.userId
    const { productId, color } = req.body

    try {
        await wishlistModel.updateOne(
            { user: userId },
            { $pull: { items: { product: productId, color: color } } }
        );

        return res.json({ message: 'Product removed from wishlist' })
    } catch (error) {
        console.error('Error removing from wishlist:', error)
        return res.status(500).json({ message: 'Server error, please try again later' })
    }
}

const renderWalletPage = async(req,res)=>{
    try {
        const userId = req.userId
        const wallet = await walletModel.findOne({user:userId}).populate('transactions')
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found for user' });
        }
        res.render('wallet', {
            balance: wallet.balance,
            transactions: wallet.transactions
        });
    } catch (error) {
        console.log(error)
    }
}

const downloadInvoice = async(req,res)=>{
    const {id} = req.params
    try {
        const order = await orderModel.findById(id).populate('items.product')
        if(!order){
            return res.status(404).send('Order not found')
        }
        const doc = new PDFDocument()

        const filePath = path.join(__dirname,'\downloads')
        const writeStream = fs.createWriteStream(filePath)
        doc.pipe(writeStream)

        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text(`Order ID: ${order._id}`);
        doc.text(`User: ${order.user}`);
        doc.text(`Payment Method: ${order.paymentMethod}`);
        doc.text(`Total Price: Rs.${order.totalPrice.toFixed(2)}`);
        doc.moveDown();

        doc.text('Billing Address:');
        const { billingAddress } = order;
        doc.text(`${billingAddress.name},`);
        doc.text(`${billingAddress.address}, ${billingAddress.city},`);
        doc.text(`${billingAddress.state}, ${billingAddress.country} - ${billingAddress.pincode}`);
        doc.moveDown();


        doc.text('Items:');
        order.items.forEach((item, index) => {
            const productName = item.product ? item.product.name : 'Product not found';
            doc.text(
                `${index + 1}. ${productName} - Rs.${item.price.toFixed(2)} x ${item.quantity} = Rs.${(
                    item.price * item.quantity
                ).toFixed(2)}`
            );
        });

        doc.end();

        writeStream.on('finish', () => {
            res.download(filePath, `invoice-${order._id}.pdf`, (err) => {
                if (err) {
                    console.error('Error downloading the invoice:', err);
                }
                
                fs.unlinkSync(filePath);
            });
        });

        writeStream.on('error', (err) => {
            console.error('Error writing PDF:', err);
            res.status(500).send('Error generating the invoice.');
        });
    } catch (error) {
        console.error('Error fetching order or generating invoice:', error);
    }
}



module.exports = {
    renderHome,
    renderProductPage,
    renderMyAccount,
    editUserName,
    renderEditUserName,
    editPassword,
    renderAddressPage,
    renderAddAdress,
    enteredAddress,
    renderEditAddress,
    editAddress,
    deleteAddress,
    addToCart,
    renderCartPage,
    updateQuantity,
    removeProductCart,
    renderCheckOutPage,
    placeOrder,
    renderOrderConfrimPage,
    renderOrderPage,
    cancelOrder,
    returnOrder,
    renderShop,
    filterShop,
    showCoupons,
    applyCoupon,
    removeCoupon,
    verifyRazorPay,
    renderWishList,
    addToWishList,
    removeFromWishList,
    orderDetailedPage,
    renderWalletPage,
    downloadInvoice
}

