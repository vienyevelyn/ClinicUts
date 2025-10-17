const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../koneksi");
const User = require("./user");

const Patient = sequelize.define("Patient",{
    id_patient:{
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    id_user:{
        type: DataTypes.STRING,
        allowNull: false
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
    city_of_birth: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date_of_birth:{
        type: DataTypes.DATE,
        allowNull: false
    },
    blood_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
     address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
     condition: {
        type: DataTypes.STRING,
        allowNull: true,
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
        tableName: "patients",
        timestamps: false,
    }  
    
);
Patient.belongsTo(User, {
    foreignKey: "id_user",
    targetKey: "id_user",
    onDelete: "CASCADE"
});

module.exports = Patient;