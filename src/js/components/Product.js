import { select,templates,classNames } from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    console.log('new Product:', thisProduct);
  }
  renderInMenu() {
    const thisProduct = this;
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    console.log('generated html:', generatedHTML);
    /* create element using utils.create elementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);

  }

  getElements() {
    const thisProduct = this;

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    console.log('imageWrapper', thisProduct.imageWrapper);
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log('thisProduct.accordionTrigger', thisProduct.accordionTrigger);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    //console.log(' thisProduct.form', thisProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    //console.log('thisProduct.formInputs', thisProduct.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    //console.log('thisProduct.cartButton', thisProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    //console.log('thisProduct.priceElem', thisProduct.priceElem);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    //console.log('thisProduct.amountWidgetElem', thisProduct.amountWidgetElem);

  }

  initAccordion() {
    const thisProduct = this;
    /*find the clickable trigger (the element that should react to clicking)*/
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    console.log('product for clicking:', clickableTrigger);
    /* START: ad event listener to clickable trigger on event click*/
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /*prevent default action for event*/
      event.preventDefault();
      /* find active product(product that has active class) */
      const activeProducts = document.querySelectorAll(classNames.menuProduct.wrapperActive);
      console.log('activeProducts', activeProducts);
      /* if there is active product and it's not thisProduct */
      for (const activeProduct of activeProducts) {
        if (activeProduct != null && activeProduct != thisProduct.element) {
          activeProduct.classList.remove('active');
          console.log('if block thisProduct', thisProduct);
        }
      }
      /* toggle active class on thisProduct,element */
      thisProduct.element.classList.toggle('active');
      console.log('thisProduct', thisProduct);
    });
  }
  initOrderForm() {
    const thisProduct = this;
    console.log('initOderForm', thisProduct);
    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder() {
    const thisProduct = this;
    //console.log('processOrder',thisProduct);

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log(optionId, option);

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if (optionSelected) {
          if (!option.default) {
            price = price + option.price;
          }
        }
        else {
          if (option.default) {
            price = price - option.price;
          }
        }
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        if (optionImage) {
          if (optionSelected) {
            optionImage.classList.add('active');
          }
          else {
            optionImage.classList.remove('active');
          }
        }
      }
    }

    thisProduct.priceSingle = price;
    /* multiply price by amount*/
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      console.log('initAmountWidegt', thisProduct.amountWidget);
    });
  }

  addToCart() {
    const thisProduct = this;
    //app.cart.add(thisProduct.prepareCartProduct());
    //app.cart.update();

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispachEvent(event);
  }


  prepareCartProductParams() {
    const params = {};
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {}
      };

      if (paramId) {

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
            //console.log('options', options);
          }
        }
      }
    }
    return params;
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      name: thisProduct.data.name,
      id: thisProduct.id,
      amount: thisProduct.amountWidget.value,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      params: thisProduct.prepareCartProductParams(),
    };
    console.log('productSummary', productSummary);
    return productSummary;
  }
}
export default Product;