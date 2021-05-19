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
    thisBooking.starter = [];
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.getStarters();
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
    const date = thisBooking.dataPicker.value;
    const hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (typeof thisBooking.booked[date] == 'undefined' ||
      typeof thisBooking.booked[date][hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable
        &&
        thisBooking.booked[date][hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
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
    //console.log('thisBooking.dom.peopleAmount', thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    //console.log(' thisBooking.dom.hoursAmount', thisBooking.dom.hoursAmount);
    const thisWidget = this;
    thisWidget.dom.dataPicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisWidget.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.table = document.querySelector(select.booking.table);
    thisBooking.dom.floor = document.querySelector(select.booking.floor);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelector(select.booking.starter);
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


    thisBooking.dataPicker = new DatePicker(thisBooking.dom.dataPicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function (event) {
      if (!event.target.classList.contains('table') &&
        (event.target.classList.contains('date-picker')) || event.target.classList.contains('hour-picker') ||
        event.target.classList.contains('people-amount') || event.target.classList.contains('hours-amount')) {
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

    thisBooking.dom.wrapper.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });

  }

  getStarters() {
    const thisBooking = this;
    thisBooking.dom.starters.addEventListener('change', function (event) {
      event.preventDefault();
      if (event.target.tagName.toUpperCase() == 'INPUT' && event.target.type == 'checkbox' && event.target.name == 'starter') {
        console.log('inputValue', event.target.value);
        if (event.target.checked) {
          thisBooking.starter.push(event.target.value);
        }
        else {
          const indexOfUnchecked = thisBooking.starter.indexOf(event.target.value);
          thisBooking.starter.splice(indexOfUnchecked, 1);
        }
      }
    });
  }
  removeSelected() {
    const thisBooking = this;
    for (let tableId of thisBooking.dom.tables) {
      tableId.classList.remove(classNames.booking.tableSelected);
    }
    thisBooking.table = null;
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
    else if (event.target.classList.contains(classNames.booking.tableBooked)) {
      window.alter('This table is already booked');
    }
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    let payload = {
      date: thisBooking.dataPicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.table),
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: thisBooking.starter,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    console.log('playload', payload, url);

    const bookings = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, bookings)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        console.log('response', response);
        thisBooking.removeSelected();
        thisBooking.makeBooked(response.date, response.hour, response.duration, response.table);
        thisBooking.updateDOM();
      });
  }

}

export default Booking;