import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    console.log('thisBooking', thisBooking);
    thisBooking.table = {};
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.dataPicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.dataPicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking
        + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsRepeat.join('&'),
    };
    console.log('urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function (
        [bookings, eventsCurrent, eventsRepeat]) {
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    console.log('eventsRepeat', eventsRepeat);

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.dataPicker.minDate;
    const maxDate = thisBooking.dataPicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daliy') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log('loop',hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.dataPicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
      ) {
        table.class.add(classNames.booking.tabelBooked);
      }
      else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.table = document.querySelector(select.booking.table);
    console.log('table', thisBooking.dom.table);
    thisBooking.dom.floor = document.querySelector(select.booking.floor);
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

    thisBooking.dom.wrapper.addEventListener('updated', function (event) {
      if (!event.target.classList.contains('table')) {
        for (let tableId of thisBooking.dom.tables) {
          if (tableId.getAttribute(settings.booking.tableIdAttribute) == thisBooking.table) {
            tableId.classList.remove(classNames.booking.tableSelected);
          }
        }
      }
      thisBooking.updateDOM();
    });

    thisBooking.dom.floor.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.initTables(event);
    });
  }
  initTables(event) {
    const thisBooking = this;
    if (event.target.classList.contains('table')) {
      if (!event.target.classList.contains(classNames.booking.tableBooked) &&
        !event.target.classList.contains(classNames.booking.tableSelected)) {
        event.target.classList.add(classNames.booking.tableSelected);
        thisBooking.table = event.target.getAttribute(settings.booking.tableIdAttribute);
        for (let tableId of thisBooking.dom.tables) {
          if (tableId.getAttribute(settings.booking.tableIdAttribute) != thisBooking.table) {
            tableId.classList.remove(classNames.booking.tableSelected);
          }
        }
      }
      else {
        event.target.classList.remove(classNames.booking.tableSelected);
      }
    }
    else if(event.target.classList.contains(classNames.booking.tableBooked)){
      //alter('This table is already booked');
    }
  }

}

export default Booking;