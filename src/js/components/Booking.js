import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

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
    //console.log('generated html:', generatedHTML);
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.appendChild(thisBooking.element);

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    console.log('thisBooking.dom.peopleAmount', thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    console.log(' thisBooking.dom.hoursAmount', thisBooking.dom.hoursAmount);
    const thisWidget = this;
    thisWidget.dom.dataPicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisWidget.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    // thisBooking.dom.peopleAmountWidget.addEventListener('updated', function () {
    // thisBooking.peopleAmount = thisBooking.peopleAmountWidget.value;
    //});
    //thisBooking.dom.hoursAmountWidget.addEventListener('updated', function () {
    //thisBooking.hoursAmount = thisBooking.hoursAmountWidget.value;
    //});

    const thisWidget = this;
    thisWidget.dataPicker = new DatePicker(thisWidget.dom.dataPicker);
    thisWidget.hourPicker = new HourPicker(thisWidget.dom.hourPicker);
  }

}

export default Booking;