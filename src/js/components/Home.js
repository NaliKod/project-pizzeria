import { templates} from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(wrapper) {
    const thisHome = this;
    thisHome.render(wrapper);
    thisHome.initWidgets();
  }

  render(wrapper) {
    const thisHome = this;
    thisHome.dom = {};
    const generatedHTML = templates.homePage();
    thisHome.wrapper = utils.createDOMFromHTML(generatedHTML);
    thisHome.dom.wrapper = wrapper;
    thisHome.dom.wrapper.appendChild(thisHome.wrapper);
  }

  initWidgets() { }

}
export default Home;