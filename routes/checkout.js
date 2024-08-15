const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PlctuBPrf3ZwXpUYLS372UPf6irWUnckOGGldQOxforsh8uZvoxkONgGtKtd288wFWfItlWUYp6TyGcCiHgl8Gk00JytJof5o') // secret key
const nodemailer = require('nodemailer');
const tokenStore = {};
const customerEmails = {};

// const stripe = Stripe('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') 


const transporter = nodemailer.createTransport({
    service: 'Gmail', // or another email service
    auth: {
        user: `${process.env.myEmail}`,
        pass: `${process.env.myEmailPassword}`,
    },
});

const generateToken = () => {
    return crypto.randomBytes(16).toString('hex');
};

const validateOrderToken = (token, user_id) => {
    // Check if the token exists in the store and matches the user_id
    if (tokenStore[user_id] && tokenStore[user_id] === token) {
        return true;
    }
    return false;
};

router.post('/create_checkout_session', async (req, res) => {
    const { cartItems, user_id, user_email } = req.body;
    const generatedToken = generateToken();
    tokenStore[user_id] = generatedToken;

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
            success_url: `http://localhost:8080/cart?order_success=true&token=${generatedToken}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:8080/cart`,
            metadata: {
                user_id: user_id
            },
            ...(user_email && { customer_email: user_email })
        });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to create Stripe session' });

    }

});

// only called over http or valid https
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const event = req.body;

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const session_id = session.id;
            const user_id = session.metadata.user_id;
            const customer_email = session.customer_details.email;
            const shipping_address = session.customer_details.address;
            const line_items = session.display_items || [];
            const orderDetails = line_items.map(item => `${item.quantity} x ${item.custom.name} (${item.amount_total / 100} GBP)`).join('\n');

            const paymentIntentId = session.payment_intent;
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            const last4 = paymentIntent.charges

            console.log(paymentIntent);

            // console.log(event)

            // Try to send the confirmation email
            // try {

            //     // Create the email content
            //     const emailContent = `
            //     Dear Customer,

            //     Thank you for your order! Here are your order details:

            //     Order ID: ${session.id}
            //     Payment Status: ${session.payment_status}

            //     Items Ordered:
            //     ${orderDetails}

            //     Shipping Address:
            //     ${shipping_address.line1}, 
            //     ${shipping_address.line2 ? `${shipping_address.line2},` : ''}
            //     ${shipping_address.city}, 
            //     ${shipping_address.postal_code}, 
            //     ${shipping_address.country}

            //     We hope you enjoy your purchase!

            //     Regards,
            //     Ruthy Michaels
            //     `;

            //     await transporter.sendMail({
            //         from: 'RuthyMichaels@gmail.com', // Sender address
            //         to: customer_email, // Receiver address
            //         subject: 'Order Confirmation - Thank you for your purchase!',
            //         text: emailContent,
            //     });
            //     console.log(`Confirmation email sent to ${customer_email}`);

            // } catch (error) {
            //     console.log('Error sending confirmation email:', error);
            // }

            // Process cache clearing and cart deletion
            try {
                customerEmails[session_id] = customer_email;

                if (user_id) {
                    // Call the delete_cart endpoint to clear the user's cart
                    const response = await axios.post('/server/delete_cart', { user_id });

                    if (response.status === 200) {
                        console.log('Cart cleared successfully after payment');
                    } else {
                        console.log('Cart deletion failed with status:', response.status);
                    }
                }

                res.sendStatus(200);
            } catch (error) {
                console.log('Error clearing cart:', error);
                res.sendStatus(500); // Optional: Send an error status if you want to notify the client
            }

            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
            res.sendStatus(400); // Optional: Send a bad request status for unhandled event types
    }
});


router.post('/verify_order', async (req, res) => {
    const { token, user_id } = req.body;

    try {
        // Check if the token is valid for the given user_id
        const isValid = validateOrderToken(token, user_id);
        if (isValid) {
            // Clear the token from the store after successful validation
            delete tokenStore[user_id];
            res.status(200).json({ isValid: true });
        } else {
            res.status(400).json({ isValid: false });
        }
    } catch (error) {
        console.error('Error verifying order token:', error);
        res.status(500).json({ error: 'Server error' });
    }

});

router.get('/get_customer_email', async (req, res) => {
    const { session_id } = req.query;

    if (customerEmails[session_id]) {
        res.status(200).json({ email: customerEmails[session_id] });
    } else {
        res.status(404).json({ error: 'Email not found' });
    }

});


module.exports = router;