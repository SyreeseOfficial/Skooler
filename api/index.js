// api/index.js (Your complete secure waiter code)

// This URL is the actual destination that only the waiter should know.
// We are hard-coding this because it's not a secret, just an address.
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GUMROAD_API_URL = 'https://api.gumroad.com/v2/licenses/verify';
const PRODUCT_ID = 'iAae-VksZe5ls2taXmf-9A==';

export default async (req, res) => {
  // Handle license validation requests
  if (req.method === 'POST' && req.body && req.body.license_key) {
    // 1. Securely access the Gumroad Access Token from environment variable
    const GUMROAD_ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN;

    if (!GUMROAD_ACCESS_TOKEN) {
      res.status(500).json({ valid: false, message: 'Server configuration error.' });
      return;
    }

    // 2. Read the license_key from the request body
    const licenseKey = req.body.license_key;

    if (!licenseKey) {
      res.status(400).json({ valid: false, message: 'License key is required.' });
      return;
    }

    // 3. Make secure request to Gumroad API
    try {
      const gumroadResponse = await fetch(GUMROAD_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: GUMROAD_ACCESS_TOKEN,
          license_key: licenseKey,
          product_id: PRODUCT_ID
        })
      });

      const gumroadData = await gumroadResponse.json();

      // 4. Check Gumroad's response and return appropriate result
      if (gumroadData.success === true) {
        res.status(200).json({ valid: true });
      } else {
        res.status(200).json({ valid: false, message: 'Invalid license key.' });
      }
    } catch (error) {
      console.error('Gumroad API Error:', error);
      res.status(500).json({ valid: false, message: 'Error validating license key. Please try again.' });
    }
    return;
  }

  // Handle Gemini API proxy requests (existing functionality)
  // 1. Securely access the API key from the 'Secret Drawer' (Environment Variable)
  const API_KEY = process.env.MY_SECRET_API_KEY; 

  if (!API_KEY) {
    res.status(500).json({ error: { message: 'The API key is missing from the server setup!' } });
    return;
  }
  
  // 2. Grab the entire Menu Order (the Request Body) from the extension
  const requestBody = req.body;
  
  // 3. The waiter makes the call to the real API using the secure key
  try {
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        // We forward the content type header
        'Content-Type': 'application/json',
      },
      // We forward the entire Menu Order (Request Body)
      body: JSON.stringify(requestBody) 
    });

    // 4. Read the response from the real API
    const data = await geminiResponse.json();

    // 5. Send the result back to the extension (the Diner)
    res.status(geminiResponse.status).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: { message: 'An error occurred while fetching data from the external API.' } });
  }
};