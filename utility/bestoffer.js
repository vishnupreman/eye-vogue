const productModel = require('../model/products');
const offerModel = require('../model/offer');

const applyBestOfferToProduct = async (productId) => {
    try {
        const product = await productModel.findById(productId).populate('category');
        if (!product) {
            throw new Error('Product not found');
        }

        const offers = await offerModel.find({
            isListed: true,
            $or: [
                { applicableProducts: product._id },
                { applicableCategories: product.category._id }
            ],
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        
        if (offers.length === 0) {
            product.bestOffer = null;
            product.discountedPrice = null;
        } else {
          
            offers.sort((a, b) => {
                const discountA = a.discountType === 'percentage' ? (a.discountValue / 100) * product.price : a.discountValue;
                const discountB = b.discountType === 'percentage' ? (b.discountValue / 100) * product.price : b.discountValue;
                
               
                return discountB - discountA || new Date(a.endDate) - new Date(b.endDate);
            });

            const bestOffer = offers[0];
            const discountedPrice = bestOffer.discountType === 'percentage'
                ? product.price - (bestOffer.discountValue / 100) * product.price
                : product.price - bestOffer.discountValue;
            
            
            product.bestOffer = bestOffer._id;
            product.discountedPrice = discountedPrice;
        }

        await product.save();
    } catch (error) {
        console.log(error);
    }
};

module.exports = { applyBestOfferToProduct };
