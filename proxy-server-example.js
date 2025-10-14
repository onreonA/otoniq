// Express.js proxy server örneği
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Trendyol API proxy endpoint
app.post('/api/trendyol-proxy', async (req, res) => {
  try {
    const { credentials, endpoint, method, data } = req.body;

    const response = await axios({
      method,
      url: `https://api.trendyol.com/sapigw/suppliers${endpoint}`,
      auth: {
        username: credentials.apiKey,
        password: credentials.apiSecret,
      },
      data,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
    });
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on port 3001');
});
