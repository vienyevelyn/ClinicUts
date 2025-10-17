const { Sequelize, DataTypes, BOOLEAN } = require('sequelize');
const sequelize = require("../koneksi");
const Doctor = require("./doctor");
const Patient = require("./patient");

const Appointment = sequelize.define("Appointment",{
    id_appointment:{
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    id_doctor:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_patient:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    queue:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    appointment_date:{
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    appointment_time:{
        type: DataTypes.TIME,
        allowNull: false,
    },
    patient_note:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "SCHEDULE",
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
        tableName: "appointment",
        timestamps: false
    }    
);

Appointment.belongsTo(Doctor, {
  foreignKey: "id_doctor",
  targetKey: "id_doctor",
  onDelete: "CASCADE"
});
Appointment.belongsTo(Patient, {
  foreignKey: "id_patient",
  targetKey: "id_patient",
  onDelete: "CASCADE"
});

module.exports = Appointment;