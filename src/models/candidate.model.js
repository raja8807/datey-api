// models/User.ts
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
// Associations are now handled in associations.js

class Candidate extends Model {}

Candidate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    dob: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    education: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    experience: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    whatsapp_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    resume_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    free_requested: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Candidate',
    tableName: 'Candidates',
    timestamps: true,
  },
);

module.exports = Candidate;
