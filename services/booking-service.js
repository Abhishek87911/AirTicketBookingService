const axios = require('axios');

const { BookingRepository } = require('../repository/index');
const { FLIGHT_SERVICE_PATH } = require('../config/serverConfig');
const { ServiceError } = require('../utils/errors/index');
const { createChannel, publishMessage } = require('../utils/messageQueue');
const { REMINDER_BINDER_KEY } = require('../config/serverConfig');

class BookingService {
   constructor() {
     this.BookingRepository = new BookingRepository();
   }

   async createBooking(data) {
      try {
        
      
        const flightId = data.flightId;
        const getFlightRequestUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
        console.log(getFlightRequestUrl);
        const response = await axios.get(getFlightRequestUrl);
        
        const flightData = response.data.data;
        let priceOfTheFlight = flightData.price;
        if(data.noOfSeats > flightData.totalSeats){
          throw  new ServiceError('Something went wrong in the booking process', 'Insufficients seats in flight');

        }
        const totalCost = priceOfTheFlight * data.noOfSeats;

        const bookingPayload = { ...data, totalCost };
        const booking = await this.BookingRepository.create(bookingPayload);
        const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;

        await axios.patch(updateFlightRequestURL, {totalSeats: flightData.totalSeats - booking.noOfSeats});
        const finalBooking = await this.BookingRepository.update(booking.id, {status: 'Booked'});
        const channel = await createChannel();
        const payload = {
            data: {
                subject: 'This is notification regarding flight booking',
                content:  'You have successfully booked flight',
                recepientEmail: 'bsaagupta77@gmail.com',
                notificationTime: '2024-03-18T14:07:00.000'

            },
            service: 'CREATE_TICKET'
        };
        publishMessage(channel, REMINDER_BINDER_KEY, JSON.stringify(payload) );
        return finalBooking;


        
      } catch (error) {
        console.log(error);
        if(error.name == 'RepositoryError' || error.name == 'ValidationError' ){
          throw error;
        }
        throw new ServiceError();
      }


   }
}

module.exports = BookingService;