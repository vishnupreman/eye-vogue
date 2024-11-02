const productModel = require('../model/products');
const userModel = require('../model/userModel')
const brandModel = require('../model/brand')
const categoryModel = require('../model/category')
const addressModel = require('../model/address');
const cartModel = require('../model/cart');
const orderModel = require('../model/order');
const { default: mongoose } = require('mongoose');


const renderHome = async (req, res) => {
    try {
        const category = await categoryModel.find()
        const product = await productModel.find({ isPublished: true }).populate({
            path: 'category',  ///category in the product model have ref of category model
            match: { isListed: true }, ///  matched islisted from the catgorymodel
            select: 'name'  /// name in the categorymodel
        })
        res.render('home', { product, category });
    } catch (error) {
        console.log(error);
    }
}
///products
// ----------------------------------------------------------------------------------------------
const renderProductPage = async (req, res) => {
    const id = req.params.id
    try {
        const products = await productModel.findById(id)
            .populate('brandname', 'name')
            .populate('category', 'name')

        console.log(products, 'the product is :');
        res.render('productpage', { products })
    } catch (error) {
        console.log(error);

    }
}

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
    const userId = req.userId
    const { id, color, size } = req.body
    console.log(req.body, 'from the cart')
    try {
        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ message: 'product not found' })
        }
        let cart = await cartModel.findOne({ user: userId, })
        console.log(cart, 'cartaaaaaaaaa');


        if (!cart) {
            cart = new cartModel({
                user: userId,
                items: []
            })
        }
        const existingItem = cart.items.find(item =>
            item.product.toString() === id &&
            item.color === color &&
            item.size === size
        )
        if (existingItem) {
            existingItem.quantity += 1
        }
        else {
            cart.items.push({
                product: new mongoose.Types.ObjectId(id),
                color,
                size,
                quantity: 1,
                price: product.price

            })
        }

        cart.totalPrice = cart.items.reduce((acc, item) => {
            return acc + (item.price * item.quantity)
        }, 0)

        await cart.save()

        return res.status(200).json({ message: 'Product successfully added to cart', cart })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

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
    const { productId, newQuantity, color, size } = req.body
    // console.log(productId,'id:',newQuantity,'qty:');

    const userId = req.userId
    try {
        const cart = await cartModel.findOne({ user: userId })
        // console.log(cart,'caaarr');

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' })
        }
        const item = cart.items.find(item =>
            item.product.toString() === productId &&
            item.color === color &&
            item.size === size
        )

        if (!item) {
            return res.status(404).json({ success: false, message: 'No item found in the cart' })
        }
        item.quantity = newQuantity

        cart.totalPrice = cart.items.reduce((acc, item) => {
            return acc + (item.price * item.quantity)
        }, 0)

        await cart.save()
        return res.status(200).json({ success: true, message: 'price updated', cart })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'internal server error' })
    }

}

const removeProductCart = async (req, res) => {
    const userId = req.userId
    const { productId } = req.body
    // console.log(productId,'prorrrr');

    try {
        // console.log('hiiiii');

        const cart = await cartModel.findOne({ user: userId })
        // console.log(cart,'mycaaarttt');

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' })
        }
        // console.log(cart.items,'11111111111');


        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)

        // console.log(itemIndex,'indeeexxx');

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
        const address = await addressModel.find({ user: userId })
        const cartItems = cart ? cart.items : []
        if (!cart || cart.items.length === 0) {
            return res.redirect('/user/cart')
        }

        res.render('checkout', {
            cartItems,
            address,
            user: userId,
            items: cart.items,
            totalPrice: cart.totalPrice
        })
    } catch (error) {
        console.log(error)

    }
}


const placeOrder = async (req, res) => {
    const { addressID, payment_option } = req.body;
    const userId = req.userId;

    try {
        const cart = await cartModel.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ success: false, message: 'No items in cart' });
        }

        const addressess = await addressModel.findOne({ user: userId });
        const address = addressess.addressDetails.find(addr => addr.id.toString() === addressID);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const order = new orderModel({
            user: userId,
            items: cart.items,
            totalPrice,
            billingAddress: address,
            paymentMethod: payment_option,
            status: payment_option === 'paypal' ? 'Pending' : 'Confirmed'
        });

        await order.save();


        for (const item of cart.items) {
            const product = await productModel.findById(item.product._id);
            if (product.colors[item.color].quantity < item.quantity) {
                return res.status(400).json({ success: false, message: 'Insufficient stock for some items color ' });
            }

            if (product.size[item.size].quantity < item.quantity) {
                return res.status(400).json({ success: false, message: 'Insufficient stock for some items size ' })
            }
            product.colors[item.color].quantity -= item.quantity;
            product.size[item.size].quantity -= item.quantity
            await product.save();
        }

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(200).json({ success: true, orderId: order._id });
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

        res.render('myorder', { orders });
    } catch (error) {
        console.log("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
};

const cancelOrder = async (req, res) => {
    const orderId = req.params.orderId
    try {
        const order = await orderModel.findById(orderId)
        console.log(order, 'ooooooooo');


        if (!order || order.status === 'Pending' || order.status === 'Shipped') {
            console.log('hiiii');

            return res.status(400).json({ success: false, message: 'Order cannot be canceld', redirectUrl: '/user/myorder' })
        }

        order.status = 'Cancelled'



        for (const item of order.items) {
            const product = await productModel.findById(item.product._id);
            if (product) {
                product.colors[item.color].quantity += item.quantity;
                product.size[item.size].quantity += item.quantity;
                await product.save();
            }
        }
        await order.save();

        return res.status(200).json({ success: true, message: 'Order canceled successfully', redirectUrl: '/user/myorder' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: true, message: 'An error occurred while canceling the order.', redirectUrl: '/user/myorder' });
    }
}

const returnOrder = async (req, res) => {
    const orderId = req.params.orderId
    try {
        const order = await orderModel.findById(orderId)
        if (!order || order.status !== 'Delivered') {
            return res.status(400).json({ success: false, message: 'Order cannot be Returned', redirectUrl: '/user/myorder' })
        }

        order.status = 'Returned'
        for (const item of order.items) {
            const product = await productModel.findById(item.product._id);
            if (product) {
                product.colors[item.color].quantity += item.quantity;
                product.size[item.size].quantity += item.quantity;
                await product.save();
            }
        }
        await order.save();

        return res.status(200).json({ success: true, message: 'Order Returned successfully', redirectUrl: '/user/myorder' })

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: true, message: 'An error occurred while canceling the order.', redirectUrl: '/user/myorder' });
    }

}

const renderShop = async (req, res) => {
    try {
        const category = await categoryModel.find()
        const products = await productModel.find({ isPublished: true }).populate({
            path: 'category',
            match: { isListed: true },
        })
        res.render('shop', { products, category });
    } catch (error) {
        console.log(error)
    }
}

const filterShop = async (req, res) => {
    try {
        console.log("Received query parameters:", req.query);

        const { category, color, sizes, min_price, max_price } = req.query;
        let filter = { isPublished: true };

        if (category) {
            filter.category = category;
        }


        if (sizes) {
            filter[`size.${sizes}.quantity`] = { $gt: 0 };
        }


        if (color) {
            filter[`colors.${color}.quantity`] = { $gt: 0 };
        }

        if (min_price && max_price) {
            filter.price = { $gte: parseFloat(min_price), $lte: parseFloat(max_price) };
        }


        const products = await productModel.find(filter).populate('category');
        return res.json({ products });
    } catch (error) {
        console.error("Error occurred while filtering products:", error);
        res.status(500).json({ error: 'An error occurred while filtering products' });
    }
};





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
    filterShop
}

