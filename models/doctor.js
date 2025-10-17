const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../koneksi");
const Category = require("./category");
const User = require("./user");

const Doctor = sequelize.define("Doctor",{
    id_doctor:{
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    id_user:{
        type: DataTypes.STRING,
        allowNull: false
    },
    id_category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            isIn: [["Male", "Female"]]
        }
    },
   degree: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    experience: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    last_updated_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true
    }

},
{
        tableName: "doctors",
        timestamps: false,
    }  
    
);

Doctor.belongsTo(Category, {
  foreignKey: "id_category",
  targetKey: "id_category",
  onDelete: 'RESTRICT'
});
Doctor.belongsTo(User, {
  foreignKey: "id_user",
  targetKey: "id_user",
  onDelete: 'CASCADE'
});

module.exports = Doctor;