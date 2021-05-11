import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    console.log('thisBooking', thisBooking);
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;
    thisBooking.dom = {};
    const generatedHTML = templates.bookingWidget();
    console.log('generated html:', generatedHTML);
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.appendChild(thisBooking.element);

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    console.log('thisBooking.dom.peopleAmount', thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    console.log(' thisBooking.dom.hoursAmount', thisBooking.dom.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    console.log('peopleAmount', thisBooking.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    console.log('hoursAmount', thisBooking.hoursAmountWidget);
    thisBooking.dom.peopleAmountWidget.addEventListener('updated', function () {
      thisBooking.peopleAmount = thisBooking.peopleAmountWidget.value;
    });
    thisBooking.dom.hoursAmountWidget.addEventListener('updated', function () {
      thisBooking.hoursAmount = thisBooking.hoursAmountWidget.value;
    });
  }
}

export default Booking;