import { DataTypes } from "sequelize";
import { mysqlDb } from "../config/database.js";

const User = mysqlDb.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("user", "petugas", "admin"),
        allowNull: false,
        defaultValue: "user",
    },
    refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, { freezeTableName: true, timestamps: false });

mysqlDb.sync({ alter: true }).then(() => console.log("Database User table synchronized"));

export default User;