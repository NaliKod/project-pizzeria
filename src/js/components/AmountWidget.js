import { settings, select } from '../settings.js';
import BaseWidget from '../components/BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    //thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.getElements();
    //thisWidget.setValue(thisWidget.input.value);
    thisWidget.initAction();
    //console.log('AmountWidget: ', thisWidget);
    // console.log('constructor agruments: ', element);
  }

  getElements() {
    const thisWidget = this;

    //thisWidget.dom.wrapper = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value) {
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin - 1
      && value <= settings.amountWidget.defaultMax + 1;
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initAction() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function (event) {
      event.preventDefault();
      //thisWidget.setValue(thisWidget.input.value);
      thisWidget.value=thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}
export default AmountWidget;