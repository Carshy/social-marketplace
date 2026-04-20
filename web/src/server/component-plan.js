export const getHomeComponentPlan = () => [
  {
    tag: 'marketplace-hero',
    props: {
      title: 'Collectible Trading Post',
      subtitle: 'Discover rare collectibles, negotiate fairly, and close deals with confidence.'
    }
  },
  {
    tag: 'marketplace-search-bar',
    props: {
      placeholder: 'Search comics, cards, figures, and more...'
    }
  },
  {
    tag: 'marketplace-item-grid',
    props: {
      source: '/api/items',
      emptyMessage: 'No items found yet.'
    }
  }
];

export const getItemDetailComponentPlan = ({
  itemId,
  viewerId,
  viewerName
}) => [
  {
    tag: 'marketplace-item-detail',
    props: {
      itemId,
      viewerId,
      viewerName
    }
  },
  {
    tag: 'marketplace-offer-panel',
    props: {
      itemId,
      viewerId,
      viewerName
    }
  },
  {
    tag: 'marketplace-chat-thread',
    props: {
      itemId,
      viewerId,
      viewerName
    }
  },
  {
    tag: 'marketplace-checkout-panel',
    props: {
      itemId,
      viewerId,
      viewerName
    }
  }
];

export const getSellerDashboardComponentPlan = ({ sellerId }) => [
  {
    tag: 'marketplace-seller-summary',
    props: {
      sellerId
    }
  },
  {
    tag: 'marketplace-seller-items',
    props: {
      sellerId
    }
  }
];