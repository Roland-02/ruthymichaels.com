const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const rawBody = require('raw-body');
const axios = require('axios');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PlctuBPrf3ZwXpUYLS372UPf6irWUnckOGGldQOxforsh8uZvoxkONgGtKtd288wFWfItlWUYp6TyGcCiHgl8Gk00JytJof5o') // secret key

// const stripe = Stripe('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') 

const endpointSecret = 'whsec_8917d1ea703c0101e6ac2fe358ce2d59bd2d504c596696cb5c8ff5ea18af24ea';


router.post('/create_checkout_session', async (req, res) => {
    const { cartItems, user_id } = req.body;

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
            shipping_address_collection: {
                allowed_countries: ['GB', 'US', 'CA'], // Specify the countries you want to accept shipping addresses from
            },
            success_url: `http://localhost:8080/index?order_success=true`,
            cancel_url: `http://localhost:8080/cart`,
            metadata: {
                user_id: user_id
            }
        });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to create Stripe session' });

    }

});


router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    // const sig = req.headers['stripe-signature'];
    const event = req.body;

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const user_id = session.metadata.user_id;

            try {
                // Call the delete_cart endpoint to clear the user's cart
                const response = await axios.post('http://localhost:8080/server/delete_cart', { user_id });

                if (response.status === 200) {
                    console.log('Cart cleared successfully after payment');
                    // Continue with any other post-payment logic here, if necessary
                    break;
                } else {
                    console.log('Cart deletion failed with status:', response.status);
                }

            } catch (error) {
                console.log('Error clearing cart', error);
            }

            // If the cart is not cleared successfully, this point will not be reached
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
});


module.exports = router;