const fs = require('fs');
const path = require('path');
const objectModel = require('../models/objectSchema');

const jsonFiles = fs.readdirSync("utilities/JSON").filter(file => file.endsWith('.JSON'));
const foldersPath = path.join(__dirname, './JSON');

let jsonMap = {};

const updateDB = async (fileName, dataToStore) => {
    try {

        const storedData = await objectModel.findOne({ identifier: fileName }) 
        ? await objectModel.findOneAndReplace({ identifier: fileName }, dataToStore) 
        : (await objectModel.create(dataToStore)).save();

        jsonMap[fileName] = storedData;

    } catch(error) {
        console.error(error);
    }
}

jsonFiles.forEach(async file => {
    const fileData = fs.readFileSync(path.join(foldersPath, file), 'utf8');
    const fileName = file.split('.')[0];
    const dataToStore = { identifier: fileName, data: JSON.parse(fileData) };

    await updateDB(fileName, dataToStore);
});


module.exports = {jsonMap}