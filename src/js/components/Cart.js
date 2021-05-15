import {settings,select,classNames,templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from '../components/CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('new Cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = document.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
    thisCart.dom.subTotalPrice = document.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPriceSum = document.querySelector(select.cart.totalPriceSum);
    thisCart.dom.totalPrice = document.querySelector(select.cart.totalPrice);
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
    thisCart.dom.address = document.querySelector(select.cart.address);
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
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log('generated html cart:', generatedHTML);
    /* create element using utils.create elementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    console.log('generatedDOM :', generatedDOM);
    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);
    //console.log('adding prodcut to cart', cartProduct);

    //thisCart.products.push(menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    //console.log('thisCart.products', thisCart.products);

  }

  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subTotalPrice = 0;

    for (const product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subTotalPrice += product.price;
      //console.log('totalNumber,subTotalPrice :', thisCart.totalNumber, thisCart.subTotalPrice);
    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
    if (thisCart.products !== null) {
      thisCart.totalPrice = deliveryFee + thisCart.subTotalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalPrice.innerHTML = '$' + thisCart.totalPrice;
      thisCart.dom.totalPriceSum.innerHTML = thisCart.totalPrice;
      //console.log('thisCart.totalPrice', thisCart.totalPrice);
    }
  }

  remove() {
    const thisCart = this;
    console.log(' thisCart.dom.productList', thisCart.dom.productList);
    const indexOfProduct = thisCart.products.indexOf('thisCartProduct');
    thisCart.products.splice(indexOfProduct, 1);
    thisCart.update();
    console.log('thisCart.update();', thisCart.update());
  }
  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    let payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee, 
      products: [],
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    //console.log('OrderedProducts', payload.products);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }

}
export default Cart;