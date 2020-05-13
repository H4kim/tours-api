import axios from 'axios';
import { showAlert } from './alert'
/* eslint-disable */
const stripe = Stripe('pk_test_itHipab76wgXwCkmKyL7emQZ00SJjSqqa2');


export const bookTour = async tourId => {
    try {
        //1 get the session from the server
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
        console.log(session)
        //2 create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId : session.data.session.id
        })
    }catch(err) {
        console.log(err)
        showAlert('error' , err)
    }
}