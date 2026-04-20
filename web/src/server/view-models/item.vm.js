export const buildItemViewModel = ({ itemId, viewerId, viewerName }) => {
  return {
    pageTitle: `Item ${itemId} | Collectible Trading Post`,
    pageHeading: 'Item detail',
    pageDescription:
      `Viewing item ${itemId} as ${viewerName} (${viewerId}). You can inspect the listing, negotiate, and proceed through the transaction flow.`,
    pageName: 'item-detail',
    itemId,
    viewerId,
    viewerName
  };
};