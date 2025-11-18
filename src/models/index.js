const sequelize = require('../config/sequelize');
const { setupAssociations } = require('./associations');

// Import all models
const Candidate = require('./candidate.model');

// Setup all associations
setupAssociations();

const db = {
  sequelize,
  // Export all models
  Candidate,
  // Export the association function for backward compatibility
  associateModels: setupAssociations,
};

module.exports = db;
