const transactionsModel = require('../model/transaction')
const walletModel = require('../model/wallet')

async function handleRefund(order, item, userId) {
    let wallet = await walletModel.findOne({user:userId})
    if(!wallet){
        throw new Error('Wallet not found for user');
    }

    const itemTotal = item.price * item.quantity
    let refundAmount = itemTotal
    
    if(order.discount>0){
        const totalOrderValue = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        console.log(totalOrderValue,'totalOrderValue');
        
        const discountRatio = itemTotal / totalOrderValue
        console.log(discountRatio,'discountRatio');
        
        const discountForItem = discountRatio * order.discount
        console.log(discountForItem,'discountForItem');
        
        refundAmount -= discountForItem
        console.log(refundAmount,'refundAmount');
        
    }

   const transaction= await transactionsModel.create({
        type: 'credit',
        amount: refundAmount,
        description: `${item.status === 'Cancelled' ? 'Cancellation' : 'Return'} refund for item`,
        date: new Date()
    });
    wallet.transactions.push(transaction._id);
    wallet.balance += refundAmount
    await wallet.save()

    return refundAmount
}

module.exports = {handleRefund}