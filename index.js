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

const API_URL = 'https://hq1.appsflyer.com/api/agg-data/export/app/com.perfectday.earth8/daily_report/v5?from=2022-12-01&to=2024-12-31'; // Replace with your actual API URL
const apitoken = process.env.API_TOKEN;
const cors = require('cors');
app.use(cors()); // Allow all origins by default

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
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

    // Log the parsed data for debugging
    //console.log('Parsed Data:', parsedData.data);

    // Get today's date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Calculate the total installs for today's date with "twitch" in the campaign field
    const totalInstalls = parsedData.data
      .filter(item =>
        item.Date === currentDate &&
        item["Campaign (c)"] &&
        /twitch/i.test(item["Campaign (c)"]) // Matches "twitch" case-insensitively
      )
      .reduce((sum, item) => sum + parseInt(item.Installs || 0, 10), 0);

    console.log(`Total installs for ${currentDate} via twitch links: ${totalInstalls}`);

    // Send JSON as the response with the total installs included
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
