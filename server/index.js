import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Whitelist of allowed hostnames to avoid creating an open proxy
const ALLOWED_HOSTS = [
  'pib.gov.in',
  'timesofindia.indiatimes.com',
  'agricoop.nic.in',
  'icar.org.in',
  'kisanportal.org',
  'doordarshan.gov.in',
  'doordarshan.gov.in',
  'agmarknet.gov.in',
  'krishakjagat.org',
  'tractorguru.in',
  'pmkisan.gov.in'
];

app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url parameter');

  try {
    const parsed = new URL(target);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return res.status(403).send('Host not allowed');
    }

    const response = await axios.get(target, {
      responseType: 'text',
      headers: {
        'User-Agent': 'Kisan-Setu-Proxy/1.0 (+https://example.com)'
      },
      timeout: 10000
    });

    res.set('content-type', 'text/html; charset=utf-8');
    res.send(response.data);
  } catch (err) {
    console.error('proxy error', err?.message || err);
    res.status(500).send('Failed to fetch');
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`News proxy running on http://localhost:${port}`));
