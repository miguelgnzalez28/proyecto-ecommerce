export function createPageUrl(pageName) {
  const routes = {
    Home: '/',
    Shop: '/shop',
    Admin: '/admin',
    Checkout: '/checkout',
  };
  return routes[pageName] || '/';
}
