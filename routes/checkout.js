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
const path = require('path');

// const stripe = Stripe(`${process.env.STIPE_SECRET_KEY}`) 


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
    const { cartItems, user_id, user_email, shipping_cost, currency } = req.body;
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
            currency: currency,
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
                allowed_countries: ['AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CV', 'CW', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MK', 'ML', 'MM', 'MN', 'MO', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SZ', 'TA', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW', 'ZZ'],
            },

            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: shipping_cost * 100, // Shipping cost in cents (5.00 GBP here)
                            currency: currency,
                        },
                        display_name: 'Standard Shipping',
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
            const shipping_cost = session.total_details.amount_shipping / 100;
            const currency = session.currency.toUpperCase(); // Get the currency used in the transaction

            // .... pass order to bookvault

            // .....

            // Define currency symbols
            const currencySymbols = {
                GBP: '£',
                USD: '$',
                EUR: '€',
            };

            const symbol = currencySymbols[currency] || ''; // Fallback to empty string if currency not defined

            // get card details
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
            const brand = capitalizeFirstLetter(paymentMethod.card.brand);
            const funding = capitalizeFirstLetter(paymentMethod.card.funding);
            const last4 = paymentMethod.card.last4;

            // fetch line items
            const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
            const orderDetails = lineItems.data.map(item => {
                return `${item.quantity} x ${item.description} (${symbol}${(item.amount_total / 100).toFixed(2)} ${currency})`;
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

            // Connect to the database
            getConnection(async (err, connection) => {
                if (err) {
                    console.error('Database connection failed:', err);
                    return res.status(500).send('Database connection failed');
                }

                try {
                    // Start the transaction
                    connection.beginTransaction(async (err) => {
                        if (err) {
                            throw new Error('Transaction initialization failed');
                        }

                        // Create a new order in the `orders` table
                        const insert_order = `INSERT INTO orders (order_id, user_id, date, total_cost, currency, status) VALUES (?, ?, NOW(), ?, ?, ?)`;
                        const insert_order_query = mysql.format(insert_order, [session_id, user_id, session.amount_total / 100, session.currency, 'Processing']);

                        // Insert order into the `orders` table
                        connection.query(insert_order_query, async (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error('Error inserting order:', err);
                                    return res.status(500).json({ message: 'Database insertion error' });
                                });
                            }

                            // Insert each item into `order_items`
                            const orderItemPromises = lineItemDetails.map((item) => {
                                const insert_order_item = `INSERT INTO order_items (order_item_id, order_id, product_id, qty) VALUES (0, ?, ?, ?)`;
                                const insert_order_item_query = mysql.format(insert_order_item, [session_id, item.metadata, item.quantity]);

                                return new Promise((resolve, reject) => {
                                    connection.query(insert_order_item_query, (err, result) => {
                                        if (err) reject(err); // Reject the promise on error
                                        resolve(result);
                                    });
                                });
                            });

                            try {
                                // Wait for all items to be inserted
                                await Promise.all(orderItemPromises);
                                console.log('Stored order and items successfully');
                            } catch (error) {
                                return connection.rollback(() => {
                                    console.error('Error inserting order items:', error);
                                    return res.status(500).json({ message: 'Error inserting order items' });
                                });
                            }

                            // Send confirmation email
                            try {
                                const emailContent = `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            background-color: #f4f4f4;
                                            font-family: Arial, sans-serif;
                                            color: #333;
                                        }
                                        .container {
                                            background-color: #fff;
                                            width: 90%;
                                            max-width: 600px;
                                            margin: 0 auto;
                                            padding: 20px;
                                            border-radius: 8px;
                                            border: 1px solid #ccc;
                                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                                        }
                                        .header {
                                            text-align: center;
                                            font-size: 24px;
                                            color: #ff68b4;
                                            border-bottom: 1px solid #ccc;
                                            margin-bottom: 20px;
                                        }
                                        .header img {
                                            width: 150px;
                                            margin-bottom: 10px;
                                        }
                                        .content {
                                            font-size: 16px;
                                            line-height: 1.6;
                                        }
                                        .content p {
                                            margin-bottom: 10px;
                                        }
                                        .footer {
                                            margin-top: 30px;
                                            padding: 5px;
                                            text-align: center;
                                            font-size: 14px;
                                            color: #777;
                                            border-top: 1px solid #ccc;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <a href="${process.env.DOMAIN}" target="_blank">
                                                <img src="cid:businessLogo" alt="ruthymichaels.com">
                                            </a>                                            
                                        </div>
                                        <div class="content">
                                        <p>Dear ${customer_name},</p>
                                        <p>Thank you for your order!</p>
                                
                                        <p><strong>Order ID:</strong> ${session.id}</p>
                                
                                        <p><strong>Items Ordered:</strong><br/> ${orderDetails.replace(/\n/g, '<br/>')}</p>
                                
                                        <p><strong>Shipping Cost:</strong> ${symbol}${shipping_cost}</p>
                                
                                        <p><strong>Shipping Address:</strong><br/>
                                        ${shipping_address.line1}<br/>
                                        ${shipping_address.line2 ? `${shipping_address.line2}<br/>` : ''}
                                        ${shipping_address.city}<br/>
                                        ${shipping_address.postal_code}<br/>
                                        ${shipping_address.country}</p>
                                
                                        <p><strong>Payment Details:</strong><br/>
                                        ${brand} ${funding}<br/>
                                        **** **** **** ${last4}</p>
                                
                                        <p>Please note orders are printed on demand through <a href="https://www.bookvault.app" target="_blank">BookVault</a>, which can take 3-5 business days after your order has been processed</p>

                                        <p>You will receive notifications once your items are in print and again when they have been dispatched.</p>                                
                                        
                                        <p>I hope you enjoy your purchase!</p>
                                
                                        <p>Kind regards,</p>
                                        <p>Ruthy Michaels</p>
                                    </div>
                                
                                    <div class="footer">
                                        &copy; 2024 ruthyichaels.com. All rights reserved.
                                    </div>
                                    </div>
                                </body>
                                </html>
                                `;
                                await transporter.sendMail({
                                    from: `${process.env.myEmail}`,
                                    to: customer_email,
                                    subject: 'Order Confirmation - Thank you for your purchase!',
                                    html: emailContent,
                                    attachments: [
                                        {
                                            filename: 'Ruthy_Michaels_logo.png',
                                            path: path.join(__dirname, '../client/src/images/Ruthy_Michaels_logo.png'),
                                            cid: 'businessLogo'
                                        }
                                    ]
                                });

                                console.log('Confirmation email sent');

                                const fulfillOrderEmail = `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            background-color: #f4f4f4;
                                            font-family: Arial, sans-serif;
                                            color: #333;
                                        }
                                        .container {
                                            background-color: #fff;
                                            width: 90%;
                                            max-width: 600px;
                                            margin: 0 auto;
                                            padding: 20px;
                                            border-radius: 8px;
                                            border: 1px solid #ccc;
                                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                                        }
                                        .header {
                                            text-align: center;
                                            font-size: 24px;
                                            color: #ff68b4;
                                            border-bottom: 1px solid #ccc;
                                            margin-bottom: 20px;
                                        }
                                        .header img {
                                            width: 150px;
                                            margin-bottom: 10px;
                                        }
                                        .content {
                                            font-size: 16px;
                                            line-height: 1.6;
                                        }
                                        .content p {
                                            margin-bottom: 10px;
                                        }
                                        .footer {
                                            margin-top: 30px;
                                            padding: 5px;
                                            text-align: center;
                                            font-size: 14px;
                                            color: #777;
                                            border-top: 1px solid #ccc;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <div class="header">
                                            <a href="${process.env.DOMAIN}" target="_blank">
                                                <img src="cid:businessLogo" alt="ruthymichaels.com">
                                            </a>                                            
                                        </div>
                                        <div class="content">
                                        <p>Order from:  ${customer_name},</p>
                                        <p> Email address: ${customer_email}</p>
                                
                                        <p><strong>Customer reference:</strong> ${session.id}</p>
                                
                                        <p><strong>Items Ordered:</strong><br/> ${orderDetails.replace(/\n/g, '<br/>')}</p>
                                                                
                                        <p><strong>Shipping Address:</strong><br/>
                                        ${shipping_address.line1}<br/>
                                        ${shipping_address.line2 ? `${shipping_address.line2}<br/>` : ''}
                                        ${shipping_address.city}<br/>
                                        ${shipping_address.postal_code}<br/>
                                        ${shipping_address.country}</p>
                                
                                        <p><strong>Payment Details:</strong><br/>
                                        ${brand} ${funding}<br/>
                                        **** **** **** ${last4}</p>
                                
                                      
                                    </div>
                                
                                    <div class="footer">
                                        &copy; 2024 ruthyichaels.com. All rights reserved.
                                    </div>
                                    </div>
                                </body>
                                </html>
                                `;

                                await transporter.sendMail({
                                    from: `${process.env.myEmail}`,
                                    to: `${process.env.myEmail}`,
                                    subject: 'Please fulfill order',
                                    html: fulfillOrderEmail,
                                    attachments: [
                                        {
                                            filename: 'Ruthy_Michaels_logo.png',
                                            path: path.join(__dirname, '../client/src/images/Ruthy_Michaels_logo.png'),
                                            cid: 'businessLogo'
                                        }
                                    ]
                                })

                            } catch (emailError) {
                                return connection.rollback(() => {
                                    console.error('Error sending confirmation email:', emailError);
                                    return res.status(500).json({ message: 'Email sending failed' });
                                });
                            }

                            // Clear cart after checkout
                            if (user_id) {
                                connection.query('DELETE FROM user_cart WHERE user_id = ?', [user_id], (error, results) => {
                                    if (error) {
                                        return connection.rollback(() => {
                                            console.error('Error clearing cart:', error);
                                            return res.status(500).json({ message: 'Cart deletion failed' });
                                        });
                                    }
                                    console.log('Cart cleared successfully');

                                    // Commit the transaction after everything is successful
                                    connection.commit((commitErr) => {
                                        if (commitErr) {
                                            return connection.rollback(() => {
                                                console.error('Transaction commit failed:', commitErr);
                                                return res.status(500).json({ message: 'Transaction commit failed' });
                                            });
                                        }

                                        // All steps completed successfully, send final response
                                        res.status(200).json({ message: 'Order processed successfully' });
                                    });
                                });
                            } else {
                                return connection.rollback(() => {
                                    console.error('User ID missing, cannot clear cart');
                                    return res.status(400).json({ message: 'User ID missing, cannot clear cart' });
                                });
                            }
                        });
                    });

                } catch (error) {
                    console.error('Error processing checkout:', error);
                    return res.status(500).json({ message: 'Checkout processing error' });

                } finally {
                    connection.release();
                }
            });
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
            res.status(400).send(`Unhandled event type: ${event.type}`);
    }
});


module.exports = router;