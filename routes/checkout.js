const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
// secret key
const stripe = Stripe('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') 

router.post('/create_checkout_session', async (req, res) => {
    const { cartItems } = req.body;

    // transform cartItems into the format required by Stripe
    const line_items = cartItems.map(item => ({
        price_data: {
            currency: 'gbp',
            product_data: {
                name: item.name,
            },
            unit_amount: item.price * 100, // Stripe expects the amount in cents
        },
        quantity: item.qty,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `https://localhost:8080/index`,
            cancel_url: `https://localhost:8080/cart`,
        });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to create Stripe session' });
    }

});

module.exports = router;
