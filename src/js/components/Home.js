import { templates, select, classNames } from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(wrapper) {
    const thisHome = this;
    thisHome.render(wrapper);
    thisHome.initWidgets();
    thisHome.initCarousel();
  }

  render(wrapper) {
    const thisHome = this;
    thisHome.dom = {};
    const generatedHTML = templates.homePage();
    thisHome.wrapper = utils.createDOMFromHTML(generatedHTML);
    thisHome.dom.wrapper = wrapper;
    thisHome.dom.wrapper.appendChild(thisHome.wrapper);
    thisHome.dom.order = thisHome.dom.wrapper.querySelector(select.home.order);
    thisHome.dom.book = thisHome.dom.wrapper.querySelector(select.home.book);
    thisHome.dom.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.dom.pageHome = document.querySelector(select.containerOf.pageHome);
    thisHome.dom.navLinks = document.querySelectorAll(select.nav.links);
  }

  initCarousel() {
    let elemCarousel = document.querySelector('.carousel');
    const flkty = new Flickity(elemCarousel, {
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
      resize: true,
      prevNextButtons: false,
    });
    window.onload = () => {
      flkty.resize();
    };
  }

  initWidgets() {
    const thisHome = this;
    thisHome.dom.order.addEventListener('click', function () {
      //event.preventDefault();
      //window.location.hash = 'http://localhost:3000/#/order';


      /*add class "active" to matching pages, remove from non-matching*/
      for (let page of thisHome.dom.pages) {
        page.classList.toggle(classNames.pages.active, page.id == 'order');
      }
      /*add class "active" to matching links, remove from non-matching*/
      for (let link of thisHome.dom.navLinks) {
        link.classList.toggle(
          classNames.nav.active,
          link.getAttribute('href') == '#' + 'order'
        );
      }
      window.location.hash = '#/order';


    });
    thisHome.dom.book.addEventListener('click', function (event) {
      event.preventDefault();
      for (let page of thisHome.dom.pages) {
        page.classList.toggle(classNames.pages.active, page.id == 'booking');
      }
      /*add class "active" to matching links, remove from non-matching*/
      for (let link of thisHome.dom.navLinks) {
        link.classList.toggle(
          classNames.nav.active,
          link.getAttribute('href') == '#' + 'booking'
        );
      }
      window.location.hash = '#/booking';
    });
  }

}
export default Home;