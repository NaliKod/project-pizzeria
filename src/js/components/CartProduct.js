import {select} from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log('thisCartProduct', thisCartProduct);
  }

  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    thisCartProduct.dom.totalPriceSum = document.querySelector(select.cart.totalPriceSum);
    thisCartProduct.dom.totalPrice = document.querySelector(select.cart.totalPrice);
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
    thisCartProduct.dom.wrapper.remove();
  }

  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function () {
    });
    thisCartProduct.dom.remove.addEventListener('click', function () {
      thisCartProduct.remove();
      //console.log('remove', thisCartProduct.remove());
      thisCartProduct.dom.totalPrice.innerHTML = '$'+0;
      thisCartProduct.dom.totalPriceSum.innerHTML = 0;
    });
  }

  getData() {
    const thisCartProduct = this;
    const cartProducts = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
    };
    return cartProducts;
  }
}
export default CartProduct;