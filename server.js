const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

async function getAccessToken() {
  const response = await axios.post(`${process.env.STARLINK_API_URL}/oauth/token`, {
    client_id: process.env.STAR_LINK_CLIENT_ID,
    client_secret: process.env.STAR_LINK_CLIENT_SECRET,
    grant_type: 'client_credentials'
  });
  return response.data.access_token;
}

app.post('/api/query', async (req, res) => {
  const { message } = req.body;

  try {
    const lineIdMatch = message.match(/\b(\d{4,})\b/);
    if (!lineIdMatch) {
      return res.json({ reply: "Please provide a valid service line ID." });
    }
    const lineId = lineIdMatch[1];

    const token = await getAccessToken();

    const response = await axios.get(
      `${process.env.STARLINK_API_URL}/service-lines/${lineId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = response.data;
    const reply = `Line ${lineId}: Status = ${data.status}, Opt-in = ${data.opt_in}, Usage = ${data.usage_gb}GB.`;

    return res.json({ reply });
  } catch (error) {
    console.error(error);
    return res.json({ reply: "Sorry, I couldn't fetch the data. Please check the line ID or try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
