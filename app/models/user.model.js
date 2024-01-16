module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("users", {
        userName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dealerType: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return User;
};