const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

app.get('/', async (req, res) => {
    const laptops = 'https://api.hubspot.com/crm/v3/objects/laptops?properties=Name&properties=Price&properties=Status';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json',
    };

    try {
        const resp = await axios.get(laptops, { headers });
        const data = resp.data.results;
        res.render('homepage', { title: 'Custom Object Table | Integrating With HubSpot I Practicum', data });
    } catch (error) {
        console.error('Error fetching laptops data:', error.response?.data || error.message);
    }
});

app.get('/update-cobj/:id?', async (req, res) => {
    const id = req.params.id;
    const laptopUrl = `https://api.hubspot.com/crm/v3/objects/laptops${id ? `/${id}` : ''}?properties=Name&properties=Price&properties=Status`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json',
    };

    try {
        let data = {};
        if (id) {
            const resp = await axios.get(laptopUrl, { headers });
            data = resp.data;
        }

        res.render('updates', {
            title: id ? `Update Custom Object Form | Integrating With HubSpot I Practicum` : `Create Custom Object Form | Integrating With HubSpot I Practicum`,
            data: id ? data : {},
        });
    } catch (error) {
        res.status(500).send('Error fetching laptop details');
    }
});

app.post('/update-cobj', async (req, res) => {
    const { id, name, status, price } = req.body;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json',
    };

    if (id) {
        const updateURL = `https://api.hubspot.com/crm/v3/objects/laptops/${id}`;
        const updateData = {
            properties: {
                name: name,
                status: status,
                price: price,
            },
        };

        try {
            const response = await axios.patch(updateURL, updateData, { headers });
            res.redirect('/');
        } catch (error) {
            res.status(500).send('Error updating laptop');
        }
    } else {
        const createURL = `https://api.hubspot.com/crm/v3/objects/laptops`;
        const createData = {
            properties: {
                name: name,
                status: status,
                price: price,
            },
        };

        try {
            const response = await axios.post(createURL, createData, { headers });
            res.redirect('/');
        } catch (error) {
            res.status(500).send('Error creating laptop');
        }
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
