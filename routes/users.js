const express = require("express");
const { param } = require("express-validator");
const {
  deleteUser,
  getAllUsers,
  getUserById,
} = require("../controllers/userController");
const verifyToken = require("../middleware/auth");
const { requireAdmin, requireSelfOrAdmin } = require("../middleware/rbac");

const router = express.Router();

// Validation for user ID parameter
const userIdValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];

/**
 * @route   DELETE /users/delete/:id
 * @desc    Delete a user by ID (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/delete/:id",
  verifyToken, // Verify JWT token
  requireAdmin, // Require admin role
  userIdValidation, // Validate user ID
  deleteUser
);

/**
 * @route   GET /users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get("/", verifyToken, requireAdmin, getAllUsers);

/**
 * @route   GET /users/:id
 * @desc    Get user by ID (Self or Admin)
 * @access  Private
 */
router.get(
  "/:id",
  verifyToken,
  requireSelfOrAdmin("id"), // User can access their own data or admin can access any
  userIdValidation,
  getUserById
);

module.exports = router;
