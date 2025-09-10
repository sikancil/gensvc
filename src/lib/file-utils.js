const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');

function createDirectoryContents(templatePath, targetPath, data) {
    console.log(`Creating contents from ${templatePath} in ${targetPath}`);
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
            const writePath = path.join(targetPath, file);
            console.log(`CREATE ${writePath}`);
            fs.writeFileSync(writePath, contents, 'utf8');
        } else if (stats.isDirectory()) {
            const newDirPath = path.join(targetPath, file);
            if (!fs.existsSync(newDirPath)) {
                console.log(`CREATE DIR ${newDirPath}`);
                fs.mkdirSync(newDirPath);
            }
            createDirectoryContents(path.join(templatePath, file), newDirPath, data);
        }
    });
}

function updateApiGateways(newService) {
    const appsDir = path.join(process.cwd(), 'apps');
    if (!fs.existsSync(appsDir)) return;

    const appFolders = fs.readdirSync(appsDir);

    for (const appFolder of appFolders) {
        const appPath = path.join(appsDir, appFolder);
        const pkgPath = path.join(appPath, 'package.json');
        if (!fs.existsSync(pkgPath)) continue;

        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.dependencies && pkg.dependencies['@nestjs/platform-express']) {
            console.log(`\nUpdating API Gateway: ${appFolder}`);
            const modulePath = path.join(appPath, 'src', 'app.module.ts');

            try {
                const content = fs.readFileSync(modulePath, 'utf8');
                const ast = parser.parse(content, {
                    sourceType: 'module',
                    plugins: ['typescript', 'decorators-legacy'],
                });

                const newClientObject = t.objectExpression([
                    t.objectProperty(t.identifier('name'), t.stringLiteral(`${newService.appName.toUpperCase()}_SERVICE`)),
                    t.objectProperty(t.identifier('transport'), t.memberExpression(t.identifier('Transport'), t.identifier(newService.transport.toUpperCase()))),
                    t.objectProperty(t.identifier('options'), t.objectExpression([
                        t.objectProperty(t.identifier('host'), t.stringLiteral(process.env.REDIS_HOST || 'localhost')),
                        t.objectProperty(t.identifier('port'), t.numericLiteral(parseInt(process.env.REDIS_PORT, 10) || 6379)),
                    ])),
                ]);

                let clientsModuleFound = false;
                traverse(ast, {
                    CallExpression(path) {
                        if (path.node.callee.type === 'MemberExpression' &&
                            path.node.callee.object.name === 'ClientsModule' &&
                            path.node.callee.property.name === 'register') {

                            clientsModuleFound = true;
                            const arrayExpression = path.node.arguments[0];
                            if (t.isArrayExpression(arrayExpression)) {
                                arrayExpression.elements.push(newClientObject);
                            }
                            path.stop();
                        }
                    },
                });

                if (!clientsModuleFound) {
                    console.warn(`Could not automatically find ClientsModule.register in ${appFolder}. Please add the new client manually.`);
                }

                const { code } = generator(ast);
                fs.writeFileSync(modulePath, code, 'utf8');
                console.log(`Successfully updated ${appFolder}/src/app.module.ts`);

            } catch (e) {
                console.error(`Failed to update ${appFolder} with AST: ${e.message}`);
            }
        }
    }
}

module.exports = { createDirectoryContents, updateApiGateways };
