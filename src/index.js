const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

function createDirectoryContents(templatePath, targetPath, data) {
    const filesToCreate = fs.readdirSync(templatePath);
    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file);
        const stats = fs.statSync(origFilePath);
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }
        if (stats.isFile()) {
            let contents = fs.readFileSync(origFilePath, 'utf8');
            contents = ejs.render(contents, data);
            if (contents.trim().length === 0) return;
            fs.writeFileSync(path.join(targetPath, file), contents, 'utf8');
        } else if (stats.isDirectory()) {
            createDirectoryContents(path.join(templatePath, file), path.join(targetPath, file), data);
        }
    });
}

module.exports = { createDirectoryContents };
