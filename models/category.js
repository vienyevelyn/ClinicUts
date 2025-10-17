const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../koneksi");

const Category = sequelize.define("Category",{
    id_category:{
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
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
        tableName: "categories",
        timestamps: false,
    }    
);

module.exports = Category;