const express = require("express");
const {
  getCounterState,
  getRealEstateSupply,
  getRealEstateToken,
  getEscrowBalance,
  getEscrowProperty,
} = require("../controllers/contractController");

const router = express.Router();

router.route("/counter").get(getCounterState);
router.route("/real-estate/supply").get(getRealEstateSupply);
router.route("/real-estate/token/:id").get(getRealEstateToken);
router.route("/escrow/balance").get(getEscrowBalance);
router.route("/escrow/property/:id").get(getEscrowProperty);

module.exports = router;
