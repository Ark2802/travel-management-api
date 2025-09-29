const { validationResult } = require("express-validator");
const Vehicle = require("../models/Vehicle");

/**
 * Add a new vehicle (Owner only)
 */
const addVehicle = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { make, model, year, licensePlate, capacity, status } = req.body;

    // Check if vehicle with this license plate already exists
    const existingVehicle = await Vehicle.findOne({
      licensePlate: licensePlate.toUpperCase(),
    });
    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: "Vehicle with this license plate already exists",
      });
    }

    // Create new vehicle
    const vehicle = new Vehicle({
      make,
      model,
      year,
      licensePlate: licensePlate.toUpperCase(),
      capacity,
      status: status || "available",
      ownerId: req.user._id,
    });

    await vehicle.save();

    // Populate owner information
    await vehicle.populate("ownerId", "email role");

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: { vehicle },
    });
  } catch (error) {
    console.error("Add vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while adding vehicle",
    });
  }
};

/**
 * Get all vehicles owned by the current user (Owner only)
 */
const getMyVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find({ ownerId: req.user._id })
      .populate("ownerId", "email role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments({ ownerId: req.user._id });

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: {
        vehicles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get my vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving vehicles",
    });
  }
};

/**
 * Get all vehicles (Admin only)
 */
const getAllVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find({})
      .populate("ownerId", "email role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments();

    res.status(200).json({
      success: true,
      message: "All vehicles retrieved successfully",
      data: {
        vehicles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving vehicles",
    });
  }
};

/**
 * Update vehicle status (Owner or Admin)
 */
const updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Check if user is owner or admin
    if (
      req.user.role !== "admin" &&
      vehicle.ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own vehicles",
      });
    }

    vehicle.status = status;
    await vehicle.save();
    await vehicle.populate("ownerId", "email role");

    res.status(200).json({
      success: true,
      message: "Vehicle status updated successfully",
      data: { vehicle },
    });
  } catch (error) {
    console.error("Update vehicle status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating vehicle status",
    });
  }
};

module.exports = {
  addVehicle,
  getMyVehicles,
  getAllVehicles,
  updateVehicleStatus,
};
