export const buildSellerViewModel = ({ sellerId }) => {
  return {
    pageTitle: `Seller Dashboard | ${sellerId}`,
    pageHeading: 'Seller dashboard',
    pageDescription:
      'Manage listings, review offers, and confirm completed transactions.',
    pageName: 'seller-dashboard',
    sellerId
  };
};