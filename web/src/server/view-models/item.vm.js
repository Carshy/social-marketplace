export const buildItemViewModel = ({ itemId }) => {
  return {
    pageTitle: `Item ${itemId} | Collectible Trading Post`,
    pageHeading: 'Item detail',
    pageDescription:
      'View listing details, negotiate price, and manage the conversation for this item.',
    pageName: 'item-detail',
    itemId
  };
};