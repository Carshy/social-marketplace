import express from 'express';
import {
  getHomeComponentPlan,
  getItemDetailComponentPlan,
  getSellerDashboardComponentPlan
} from '../component-plan.js';
import { buildHomeViewModel } from '../view-models/home.vm.js';
import { buildItemViewModel } from '../view-models/item.vm.js';
import { buildSellerViewModel } from '../view-models/seller.vm.js';

const router = express.Router();

router.get('/', (_req, res) => {
  const viewModel = buildHomeViewModel();
  const componentPlan = getHomeComponentPlan();

  res.render('pages/home', {
    ...viewModel,
    componentPlan
  });
});

router.get('/items/:id', (req, res) => {
  const itemId = req.params.id;
  const viewerId = String(req.query.viewerId || 'user2').trim();
  const viewerName = String(req.query.viewerName || 'ToyTrader').trim();

  const viewModel = buildItemViewModel({
    itemId,
    viewerId,
    viewerName
  });

  const componentPlan = getItemDetailComponentPlan({
    itemId,
    viewerId,
    viewerName
  });

  res.render('pages/item-detail', {
    ...viewModel,
    componentPlan
  });
});

router.get('/seller/:sellerId/dashboard', (req, res) => {
  const sellerId = req.params.sellerId;
  const viewModel = buildSellerViewModel({ sellerId });
  const componentPlan = getSellerDashboardComponentPlan({ sellerId });

  res.render('pages/seller-dashboard', {
    ...viewModel,
    componentPlan
  });
});

export default router;