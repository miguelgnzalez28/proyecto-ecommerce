import Home from './pages/Home';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';

export const pagesConfig = {
  Pages: {
    Home,
    Shop,
    Admin,
    Checkout,
  },
  Layout: null, // No custom layout wrapper for now
  mainPage: 'Home',
};
