/*const express = require('express');
const axios = require('axios');
const app = express();

app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://hq1.appsflyer.com/api/agg-data/export/app/id6478184997/daily_report/v5?from=2022-12-01&to=2024-12-31', {
      headers: {
        Authorization: 'Bearer ',
        Accept: 'text/csv',
      },
    });
    res.setHeader('Content-Type', 'text/csv');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:3000');
});*/

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const Papa = require('papaparse');
const cors = require('cors');

const API_URL_ANDROID = 'https://hq1.appsflyer.com/api/agg-data/export/app/com.perfectday.earth8/daily_report/v5?from=2024-12-01&to=2026-12-31';
const API_URL_IPHONE = 'https://hq1.appsflyer.com/api/agg-data/export/app/com.perfectday.earth8/daily_report/v5?from=2024-12-01&to=2026-12-31';

const apitoken = process.env.API_TOKEN;

app.use(cors()); // Allow all origins by default

app.get('/', async (req, res) => {
  try {
    // Function to fetch and calculate installs
    const fetchInstalls = async (url) => {
      const response = await axios.get(url, {
        headers: {
          "ngrok-skip-browser-warning": "69420",
          'Authorization': `Bearer ${apitoken}`,
          'Accept': 'text/csv',
        },
      });

      // Parse CSV to JSON
      const parsedData = Papa.parse(response.data, {
        header: true,
        skipEmptyLines: true,
      });

      // Get today's date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];

      // Calculate total installs for today's date with "twitch" in the campaign field
      return parsedData.data
        .filter(item =>
          item.Date === currentDate &&
          item["Campaign (c)"] &&
          /twitch/i.test(item["Campaign (c)"]) // Matches "twitch" case-insensitively
        )
        .reduce((sum, item) => sum + parseInt(item.Installs || 0, 10), 0);
    };

    // Fetch installs for Android and iPhone in parallel
    const [androidInstalls, iphoneInstalls] = await Promise.all([
      fetchInstalls(API_URL_ANDROID),
      fetchInstalls(API_URL_IPHONE)
    ]);

    // Calculate total installs
    const totalInstalls = androidInstalls + iphoneInstalls;

    console.log(`Total installs for today via twitch links: ${totalInstalls}`);

    // Send JSON response
    res.setHeader('Content-Type', 'application/json');
    res.json({
      totalInstalls
    });
  } catch (error) {
    console.error('Error fetching data:', error.response?.data || error.message);
    res.status(500).send('Error fetching data');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
