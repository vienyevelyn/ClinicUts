const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../koneksi");
const phoneValidationRegex = /\d{3}-\d{3}-\d{4}/ 

const User = sequelize.define("User",{
    id_user:{
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("admin", "doctor", "patient", "pharmacist"),
        allowNull: false,
       
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        
        validate:{
                validator: function(v) {
                return phoneValidationRegex.test(v);      
            },
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
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
    tableName: "users",
    timestamps: false,
});

module.exports = User;
