/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: '.active',
      imageVisible: '.active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

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
      thisProduct.prepareCartProduct();
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
        const activeProduct = document.querySelector(classNames.menuProduct.wrapperActive);
        console.log('activeProduct', activeProduct);
        /* if there is active product and it's not thisProduct */
        if (activeProduct != null && activeProduct != thisProduct.element) {
          activeProduct.classList.remove('active');
          console.log('if block thisProduct', thisProduct);
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

      thisProduct.amountWidgetElem.addEventListener('update', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        console.log('initAmountWidegt', thisProduct.amountWidget);
      });
    }

    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
      app.cart.update();
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

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options = {
              [optionId]: option.label,
            };
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

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initAction();
      // console.log('AmountWidget: ', thisWidget);
      // console.log('constructor agruments: ', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      /*TODO: Add validation */
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin - 1 && newValue <= settings.amountWidget.defaultMax + 1) {
        thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }
    initAction() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;
      //const event = new Event('update');
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = document.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
      thisCart.dom.subTotalPrice = document.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = document.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    }

    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function (event) {
        event.preventDefault();
        thisCart.remove(event.detail.cartProduct);
      });
    }

    add(menuProduct) {
      const thisCart = this;
      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);
      console.log('generated html cart:', generatedHTML);
      /* create element using utils.create elementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      console.log('generatedDOM :', generatedDOM);
      /* add element to menu */
      thisCart.dom.productList.appendChild(generatedDOM);
      //console.log('adding prodcut to cart', cartProduct);

      //thisCart.products.push(menuProduct);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      console.log('thisCart.products', thisCart.products);

    }

    update() {
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subTotalPrice = 0;

      for (const product of thisCart.products) {
        totalNumber += product.amount;
        subTotalPrice += product.price;
        console.log('totalNumber,subTotalPrice :', totalNumber, subTotalPrice);
      }
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subTotalPrice.innerHTML = subTotalPrice;
      if (thisCart.products !== null) {
        thisCart.totalPrice = deliveryFee + subTotalPrice;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
        console.log('thisCart.totalPrice', thisCart.totalPrice);
      }
    }

    remove(thisCartProduct) {
      const thisCart = this;
      thisCart.dom.productList.remove(thisCartProduct);
      console.log(' thisCart.dom.productList', thisCart.dom.productList);
      const indexOfProduct = thisCart.products.indexOf('thisCartProduct');
      thisCart.products.splice(indexOfProduct, 1);
      thisCart.update();
      console.log('thisCart.update();', thisCart.update());
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      console.log('thisCartProduct', thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        const price = thisCartProduct.price;
        // update calculated price in the HTML
        thisCartProduct.dom.price.innerHTML = price;

      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function () {
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
        console.log('remove', thisCartProduct.remove());
      });
    }
  }



  const app = {

    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
      //const testProduct = new Product();
      //console.
      //log('testProduct:', testProduct);

    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();

    },
  };

  app.init();
}
