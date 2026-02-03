import Home from './pages/Home';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';

export const pagesConfig = {
  Pages: {
    Home,
    Shop,
    Admin,
    Checkout,
    Login,
    Register,
  },
  Layout: null, // No custom layout wrapper for now
  mainPage: 'Home',
};
