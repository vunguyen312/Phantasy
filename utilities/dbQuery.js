const profileModel = require('../models/profileSchema');
const objectModel = require('../models/objectSchema');

const modifyValue = async (query, operation) => {
    try{

        await profileModel.findOneAndUpdate(query, operation);
        
    } catch (error) {
        console.error(error);
    }
}

const getObjectData = async (table) => {
    try{

        const dataTable = await objectModel.findOne({ identifier: table });
        
        return dataTable.data;

    } catch (error) {
        console.error(error);
    }
}

module.exports = {modifyValue, getObjectData}