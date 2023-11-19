const express = require('express');
const Redis = require('ioredis');

const app = express();
const PORT = 3300;

// Connect to the redis server
let client;
(() => {
  client = new Redis({
    port: 6379,
    host: '127.0.0.1',
  });

  client.on('connect', () => {
    console.log('Connected to Redis yo!!');
  });

  client.on('error', (error) => {
    console.error(error);
  });
})();

app.get('/country/:countryName', async (req, res) => {
  const { countryName } = req.params;

  try {
    //cache hit
    let cachedData = await client.get(countryName);

    if (cachedData) {
      return res.status(200).send(JSON.parse(cachedData));
    }

    const data = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}`
    );

    let result = await data.json();

    //cache miss
    client.set(countryName, JSON.stringify(result));

    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
