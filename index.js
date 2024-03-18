const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const { PORT } = require('./config/serverConfig');
const apiRoutes = require('./routes/index');
const db = require('./models/index');

const setupAndStartServer = async () => {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use('/bookingservice/api',apiRoutes);
    app.get('/bookingservice/api/v1/home', (req,res) => {
        return res.json({
            message: 'Ok from booking service'
        })
    })
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT} `);
        if(process.env.DB_SYNC){
            db.sequelize.sync({alter:true});
        }
        
    })
}

setupAndStartServer();