const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let eventStripe;

  try {
    eventStripe = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (eventStripe.type === 'checkout.session.completed') {
    const session = eventStripe.data.object;
    const customerEmail = session.customer_email;
    const sessionId = session.id;

    // Generate a unique token
    const token = `token_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    // Redirect URL with token (replace with your GitHub Pages URL)
    const redirectUrl = `https://crestsupport.github.io/continental-market-group/?token=${token}&session_id=${sessionId}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ redirectUrl }),
    };
  }

  return { statusCode: 200, body: 'Webhook received' };
};
