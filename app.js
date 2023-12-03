const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');


const userRoutes = require('./api/routes/user');

mongoose.connect(`mongodb+srv://vysakhajithkumar23:${process.env.MONGO_ATLAS_PWD}@cluster0.a6c2nr3.mongodb.net/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
app.use(cors({
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200,
    credentials: true
}));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use((req, res, next) => {
//     // res.setHeader('Custom-Header', 'Hello, this is a custom header');
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods, Origin, X-Requested-With, content-type, Accept, Authorization');
//     if (req.method === 'OPTIONS') {
//         req.header('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET, PATCH');
//         return res.status(200).json({});
//     }
//     next();
// });

app.use('/user', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status(404);
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;