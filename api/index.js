// api/index.js (Your complete secure waiter code)

// This URL is the actual destination that only the waiter should know.
// We are hard-coding this because it's not a secret, just an address.
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export default async (req, res) => {
  
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