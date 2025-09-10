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

function updateApiGateways(newService) {
    const appsDir = path.join(process.cwd(), 'apps');
    const appFolders = fs.readdirSync(appsDir);

    for (const appFolder of appFolders) {
        const appPath = path.join(appsDir, appFolder);
        const pkgPath = path.join(appPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg.dependencies && pkg.dependencies['@nestjs/platform-express']) {
                console.log(`Updating API Gateway: ${appFolder}`);
                const modulePath = path.join(appPath, 'src', 'app.module.ts');
                try {
                    let content = fs.readFileSync(modulePath, 'utf8');
                    const clientModuleRegex = /ClientsModule\.register\(\[([\s\S]*?)\]\)/;
                    const match = content.match(clientModuleRegex);

                    const newClientConfig = `{
        name: '${newService.appName.toUpperCase()}_SERVICE',
        transport: Transport.${newService.transport.toUpperCase()},
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        },
      },`;

                    if (match) {
                        const newContent = content.replace(clientModuleRegex, `ClientsModule.register([${match[1]}${newClientConfig}])`);
                        fs.writeFileSync(modulePath, newContent, 'utf8');
                    } else {
                        content = `import { ClientsModule, Transport } from '@nestjs/microservices';\n${content}`;
                        const importRegex = /imports: \[/;
                        const newContent = content.replace(importRegex, `imports: [\n    ClientsModule.register([${newClientConfig}]),`);
                        fs.writeFileSync(modulePath, newContent, 'utf8');
                    }
                    console.log(`Successfully updated ${appFolder}/src/app.module.ts`);
                } catch (e) {
                    console.error(`Failed to update ${appFolder}: ${e.message}`);
                }
            }
        }
    }
}

module.exports = { createDirectoryContents, updateApiGateways };
