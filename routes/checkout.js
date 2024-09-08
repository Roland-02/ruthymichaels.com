const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { getConnection } = require('../database');
const mysql = require('mysql');
const crypto = require('crypto');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PlctuBPrf3ZwXpUYLS372UPf6irWUnckOGGldQOxforsh8uZvoxkONgGtKtd288wFWfItlWUYp6TyGcCiHgl8Gk00JytJof5o') // secret key
const nodemailer = require('nodemailer');
const tokenStore = {};

// const stripe = Stripe('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') 


const transporter = nodemailer.createTransport({
    service: 'Gmail', // or another email service
    auth: {
        user: `${process.env.myEmail}`,
        pass: `${process.env.myEmailPassword}`,
    },
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const generateToken = () => {
    return crypto.randomBytes(16).toString('hex');
};

// process checkout
router.post('/create_checkout_session', async (req, res) => {
    const { cartItems, user_id, user_email, shipping_cost } = req.body;
    const generatedToken = generateToken();
    tokenStore[user_id] = generatedToken;

    // Transform cartItems into the format required by Stripe
    const line_items = await Promise.all(cartItems.map(async (item) => {
        // Create or retrieve a Stripe product and attach metadata
        const product = await stripe.products.create({
            name: item.name,
            metadata: {
                product_id: item.id, // Attach your internal product ID here
            },
        });

        // Create a Stripe price object
        const price = await stripe.prices.create({
            unit_amount: item.price * 100, // Stripe expects the amount in cents
            currency: 'gbp',
            product: product.id,
        });

        return {
            price: price.id,
            quantity: item.qty,
        };
    }));
    

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['GB', 'US', 'CA'], // Specify the countries you want to accept shipping addresses from
            },

            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: shipping_cost * 100, // Shipping cost in cents (5.00 GBP here)
                            currency: 'gbp',
                        },
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 7 },
                        },
                    },
                },
            ],

            success_url: `${process.env.DOMAIN}/cart?order_success=true&token=${generatedToken}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/cart`,
            metadata: {
                user_id: user_id,
            },
            ...(user_email && { customer_email: user_email }),
        });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create Stripe session' });
    }

});

// post-checkout processes - save order, send confirmation email, clear carts
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const event = req.body;

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const session_id = session.id;
            const user_id = session.metadata.user_id;
            const customer_email = session.customer_details.email;
            const customer_name = session.customer_details.name;
            const shipping_address = session.customer_details.address;

            // get card details
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
            const brand = capitalizeFirstLetter(paymentMethod.card.brand);
            const funding = capitalizeFirstLetter(paymentMethod.card.funding);
            const last4 = paymentMethod.card.last4

            // fetch line items
            const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
            const orderDetails = lineItems.data.map(item => {
                return `${item.quantity} x ${item.description} (£${item.amount_total / 100} GBP)`;
            }).join('\n');

            // Retrieve product metadata for each line item
            const lineItemDetails = await Promise.all(lineItems.data.map(async (item) => {
                const price = await stripe.prices.retrieve(item.price.id);
                const product = await stripe.products.retrieve(price.product);

                // Return the necessary details including metadata
                return {
                    quantity: item.quantity,
                    description: item.description,
                    amount_total: item.amount_total,
                    metadata: product.metadata.product_id,
                };
            }));

            // Connect to database
            getConnection((err, connection) => {
                if (err) {
                    console.error('Database connection failed:', err);
                    return res.status(500).send('Database connection failed');
                }

                // Create a new order in the `orders` table
                const insert_order = `INSERT INTO orders (order_id, user_id, date, total_cost) VALUES (?, ?, NOW(), ?)`;
                const insert_order_query = mysql.format(insert_order, [session_id, user_id, session.amount_total / 100]);

                connection.query(insert_order_query, async (err, result) => {
                    if (err) {
                        console.error('Error inserting order:', err);
                        return res.status(500).json({ message: 'Database insertion error' });
                    }

                    // Insert each item into the `order_items` table
                    try {
                        const orderItemPromises = lineItemDetails.map((item) => {
                            const insert_order_item = `INSERT INTO order_items (order_item_id, order_id, product_id, qty) VALUES (0, ?, ?, ?)`;
                            const insert_order_item_query = mysql.format(insert_order_item, [session_id, item.metadata, item.quantity]);

                            return new Promise((resolve, reject) => {
                                connection.query(insert_order_item_query, async (err, result) => {
                                    if (err) throw err;

                                    resolve(result);
                                });
                            });
                        });

                        // Wait for all items to be inserted
                        await Promise.all(orderItemPromises);

                        console.log('stored order')

                    } catch (error) {
                        console.error('Error inserting order items:', error);
                        return res.status(500).json({ message: 'Error inserting order items' });

                    } finally {
                        connection.release();

                    }

                });

            });

            // send the confirmation email
            try {

                // Create the email content
                const emailContent = `
Dear ${customer_name},

Thank you for your order!

Order ID: ${session.id}

Items Ordered:
${orderDetails}

Shipping Address:
${shipping_address.line1} 
${shipping_address.line2 ? `${shipping_address.line2}` : ''}
${shipping_address.city} 
${shipping_address.postal_code} 
${shipping_address.country}

Payment Details:
${brand} ${funding}
**** **** **** ${last4}

I hope you enjoy your purchase!

Regards,

Ruthy Michaels`;

                await transporter.sendMail({
                    from: `${process.env.myEmail}`, // Sender address
                    to: customer_email, // Receiver address
                    subject: 'Order Confirmation - Thank you for your purchase!',
                    text: emailContent,
                });

                console.log('sent confirmation email')

            } catch (error) {
                console.log('Error sending confirmation email:', error);
                return res.sendStatus(500);
            }

            // Process cart deletion
            try {
                if (user_id) {
                    // Call the logic directly without making an HTTP request
                    getConnection((err, connection) => {
                        if (err) throw err;

                        const query = 'DELETE FROM user_cart WHERE user_id = ?';
                        connection.query(query, [user_id], (error, results) => {
                            connection.release();

                            if (error) {
                                console.error('Error deleting cart', error);
                                throw new Error('Database deletion failed');
                            }

                            console.log('Cart cleared successfully after payment');
                        });
                    });

                    console.log('cleared cache')
                    return res.sendStatus(200);

                } else {
                    return res.status(400).send('User ID is required');
                }

            } catch (error) {
                console.log('Error clearing cart:', error);
                return res.sendStatus(500);
            }



        default:
            console.log(`Unhandled event type ${event.type}`);
            res.sendStatus(400);
    }

});


module.exports = router;