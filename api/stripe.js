export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripe = await import('stripe').then(m => m.default(process.env.STRIPE_SECRET_KEY));
    const { action } = req.body;

    if (action === 'create_checkout') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CareerAI — ATS Analysis',
              description: 'ATS Score, Keyword Gap, Bullet Rewrites, Cover Letter, AI Coach, Resume Export',
            },
            unit_amount: 1500,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.origin}?payment=success`,
        cancel_url: `${req.headers.origin}?payment=cancelled`,
      });
      return res.status(200).json({ url: session.url });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
