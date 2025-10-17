const { Sequelize, DataTypes, BOOLEAN } = require('sequelize');
const sequelize = require("../koneksi");
const Patient = require("./patient");
const Appointment = require("./appointment");

const MedicalRecord = sequelize.define("MedicalRecord",{
    id_record:{
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    id_appointment:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_patient:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    diagnosis:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    prescription:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    doctor_note:{
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
        tableName: "medical_record",
        timestamps: false,
    }    
);

MedicalRecord.belongsTo(Appointment, {
    foreignKey: "id_appointment",
    targetKey: "id_appointment",
    onDelete: "CASCADE"
});

MedicalRecord.belongsTo(Patient, {
    foreignKey: "id_patient",
    targetKey: "id_patient",
    onDelete: "CASCADE"
});

module.exports = MedicalRecord;