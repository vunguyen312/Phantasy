const fs = require('fs');
const path = require('path');

const jsonFiles = fs.readdirSync("utilities/JSON").filter(file => file.endsWith('.JSON'));
const foldersPath = path.join(__dirname, `./JSON`);

let jsonMap = {};

const parseFile = (file, error, data) => {
    if(error) throw error;
    
    return jsonMap[file.split('.')[0]] = JSON.parse(data);
}

jsonFiles.forEach(file => fs.readFile(path.join(foldersPath, file), 'utf8', (error, data) => parseFile(file, error, data)));

module.exports = {jsonMap}