export function createPageUrl(pageName) {
  const routes = {
    Home: '/',
    Shop: '/shop',
    Admin: '/admin',
    Checkout: '/checkout',
    Login: '/login',
    Register: '/register',
  };
  return routes[pageName] || '/';
}
