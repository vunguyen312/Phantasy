const profileModel = require('../models/profileSchema');

const modifyValue = async (query, operation) => {
    try{

        await profileModel.findOneAndUpdate(query, operation);
        
    } catch (error) {
        console.error(error);
    }
}

module.exports = {modifyValue}