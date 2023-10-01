const express = require('express');
const morgan = require('morgan');
const {createProxyMiddleware} = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();

const PORT = 3005;

// Rate limiting, limit the number of requests from a single IP address. This is a simple, but effective way to prevent DDoS attacks.

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 10 // limit each IP to 5 requests per windowMs
});

app.use(morgan('combined'));

app.use(limiter);

// API gateway, proxy to services. The API Gateway serves as a reverse proxy to accept API calls from the client application, forwarding this traffic to the appropriate service. 

app.use('/bookingservice', async (req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
        headers: {
            'x-access-token': req.headers['x-access-token']
        }
        });
        console.log(response.data);
        if(response.data.success)next();
        else return res.status(401).json({
            message: 'You are not authenticated'
        });
        
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong'
        });
    }
});

app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3002/', changeOrigin: true }));

app.get('/home', (req, res) => {
    res.send('Welcome to the home page!');
}); 

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
    }
);