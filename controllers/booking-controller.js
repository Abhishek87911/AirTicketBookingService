const { StatusCodes } = require('http-status-codes');

const { BookingService } = require('../services/index');

const { createChannel, publishMessage } = require('../utils/messageQueue');
const { REMINDER_BINDER_KEY } = require('../config/serverConfig');
const bookingService = new BookingService();
class BookingController {

    constructor(){
        
    } 
    async sendMessageToQueue(req,res) {
        const channel = await createChannel();
        const payload = {
            data: {
                subject: 'This is notification from queue',
                content:  'Some queue will subscribed this',
                recepientEmail: 'bsaagupta77@gmail.com',
                notificationTime: '2024-03-18T14:07:00.000'

            },
            service: 'CREATE_TICKET'
        };
        publishMessage(channel, REMINDER_BINDER_KEY, JSON.stringify(payload) );
        return res.status(200).json({
            message: 'Successfully published the event'
        })
    }
    async create(req,res) {
        try {
   
            const response = await bookingService.createBooking(req.body);
            
            return res.status(StatusCodes.OK).json({
                message: 'Successfully completed booking',
                success: true,
                err : {},
                data: response
            })
        } catch (error) {
           
            return res.status(error.statusCode).json({
                message: error.message,
                success: false,
                err : error.explaination,
                data: {}
            })
        }
    }
}


module.exports = BookingController;