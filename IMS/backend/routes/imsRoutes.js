const express = require("express");
const imsService = require("../services/imsService");
const { ok } = require("../utils/apiResponse");
const { requireAuth, requirePermission } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../config/permissions");

const router = express.Router();

router.use(requireAuth);

router.get("/auth/me", (req, res) => ok(res, { user: req.user }));

router.get("/inventory", requirePermission(PERMISSIONS.VIEW_INVENTORY), async (req, res, next) => {
  try { ok(res, { inventory: await imsService.listInventory() }); } catch (error) { next(error); }
});

router.post("/stock/in/manual", requirePermission(PERMISSIONS.MANAGE_INVENTORY), async (req, res, next) => {
  try { ok(res, await imsService.postStockMovement(req.body, req.user.id, "MANUAL_IN"), 201); } catch (error) { next(error); }
});

router.post("/stock/out", requirePermission(PERMISSIONS.ISSUE_STOCK), async (req, res, next) => {
  try { ok(res, await imsService.postStockMovement(req.body, req.user.id, "MANUAL_OUT"), 201); } catch (error) { next(error); }
});

router.get("/items", requirePermission(PERMISSIONS.VIEW_INVENTORY), async (req, res, next) => {
  try { ok(res, { items: await imsService.listItems() }); } catch (error) { next(error); }
});

router.post("/items", requirePermission(PERMISSIONS.MANAGE_INVENTORY), async (req, res, next) => {
  try { ok(res, { items: await imsService.createItems(req.body, req.user.id) }, 201); } catch (error) { next(error); }
});

router.get("/vendors", requirePermission(PERMISSIONS.MANAGE_PURCHASE_ORDERS), async (req, res, next) => {
  try { ok(res, { vendors: await imsService.listVendors() }); } catch (error) { next(error); }
});

router.post("/vendors", requirePermission(PERMISSIONS.MANAGE_PURCHASE_ORDERS), async (req, res, next) => {
  try { ok(res, { vendor: await imsService.createVendor(req.body, req.user.id) }, 201); } catch (error) { next(error); }
});

router.get("/requests", requirePermission(PERMISSIONS.CREATE_REQUESTS), async (req, res, next) => {
  try { ok(res, { requests: await imsService.listRequests() }); } catch (error) { next(error); }
});

router.post("/requests", requirePermission(PERMISSIONS.CREATE_REQUESTS), async (req, res, next) => {
  try { ok(res, await imsService.createRequest(req.body, req.user.id), 201); } catch (error) { next(error); }
});

router.get("/purchase-orders", requirePermission(PERMISSIONS.MANAGE_PURCHASE_ORDERS), async (req, res, next) => {
  try { ok(res, { purchaseOrders: await imsService.listPurchaseOrders() }); } catch (error) { next(error); }
});

router.post("/purchase-orders", requirePermission(PERMISSIONS.MANAGE_PURCHASE_ORDERS), async (req, res, next) => {
  try { ok(res, await imsService.createPurchaseOrder(req.body, req.user.id), 201); } catch (error) { next(error); }
});

router.get("/grn", requirePermission(PERMISSIONS.MANAGE_GRNS), async (req, res, next) => {
  try { ok(res, { grns: await imsService.listGrns() }); } catch (error) { next(error); }
});

router.post("/grn", requirePermission(PERMISSIONS.MANAGE_GRNS), async (req, res, next) => {
  try { ok(res, await imsService.createGrn(req.body, req.user.id), 201); } catch (error) { next(error); }
});

router.get("/audit", requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS), async (req, res, next) => {
  try { ok(res, { auditLogs: await imsService.listAudit() }); } catch (error) { next(error); }
});

module.exports = router;
