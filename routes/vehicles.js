const express = require("express");
const { body, param } = require("express-validator");
const {
  addVehicle,
  getMyVehicles,
  getAllVehicles,
  updateVehicleStatus,
} = require("../controllers/vehicleController");
const verifyToken = require("../middleware/auth");
const {
  requireOwner,
  requireAdmin,
  requireAdminOrOwner,
} = require("../middleware/rbac");

const router = express.Router();

// Validation for adding a vehicle
const addVehicleValidation = [
  body("make")
    .trim()
    .notEmpty()
    .withMessage("Vehicle make is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Make must be between 2 and 50 characters"),
  body("model")
    .trim()
    .notEmpty()
    .withMessage("Vehicle model is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Model must be between 2 and 50 characters"),
  body("year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(
      `Year must be between 1900 and ${new Date().getFullYear() + 1}`
    ),
  body("licensePlate")
    .trim()
    .notEmpty()
    .withMessage("License plate is required")
    .isLength({ min: 3, max: 10 })
    .withMessage("License plate must be between 3 and 10 characters"),
  body("capacity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Capacity must be between 1 and 100"),
  body("status")
    .optional()
    .isIn(["available", "in-use", "maintenance", "inactive"])
    .withMessage(
      "Status must be one of: available, in-use, maintenance, inactive"
    ),
];

// Validation for updating vehicle status
const updateStatusValidation = [
  param("id").isMongoId().withMessage("Invalid vehicle ID format"),
  body("status")
    .isIn(["available", "in-use", "maintenance", "inactive"])
    .withMessage(
      "Status must be one of: available, in-use, maintenance, inactive"
    ),
];

/**
 * @route   POST /vehicles/add
 * @desc    Add a new vehicle (Owner only)
 * @access  Private/Owner
 */
router.post(
  "/add",
  verifyToken, // Verify JWT token
  requireOwner, // Require owner role
  addVehicleValidation, // Validate vehicle data
  addVehicle
);

/**
 * @route   GET /vehicles/my
 * @desc    Get vehicles owned by current user (Owner only)
 * @access  Private/Owner
 */
router.get("/my", verifyToken, requireOwner, getMyVehicles);

/**
 * @route   GET /vehicles
 * @desc    Get all vehicles (Admin only)
 * @access  Private/Admin
 */
router.get("/", verifyToken, requireAdmin, getAllVehicles);

/**
 * @route   PATCH /vehicles/:id/status
 * @desc    Update vehicle status (Owner or Admin)
 * @access  Private
 */
router.patch(
  "/:id/status",
  verifyToken,
  requireAdminOrOwner, // Either admin or owner can update
  updateStatusValidation,
  updateVehicleStatus
);

module.exports = router;
