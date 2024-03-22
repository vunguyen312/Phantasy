const profileModel = require('../models/profileSchema');

const modifyValue = async (query, operation) => {
    try{
        await profileModel.findOneAndUpdate(query, operation);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {modifyValue}