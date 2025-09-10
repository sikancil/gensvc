const inquirer = require('inquirer');
const path = require('path');
const { getAppGeneratorQuestions } = require('../lib/questions');
const { createDirectoryContents } = require('../lib/file-utils');

const generateCommand = async () => {
    const projectDetails = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'What is the name of your project?',
            default: 'my-awesome-app'
        },
        {
            type: 'list',
            name: 'projectType',
            message: 'Select project structure:',
            choices: ['Monorepo', 'Standalone'],
            default: 'Monorepo',
        },
        {
            type: 'list',
            name: 'orm',
            message: 'Select a database ORM:',
            choices: ['Prisma', 'Sequelize', new inquirer.Separator(), 'None'],
            default: 'prisma'
        },
        {
            type: 'checkbox',
            name: 'authMethods',
            message: 'Select authentication methods to include:',
            choices: [
                { name: 'Email + Password', value: 'local', checked: true },
                { name: 'Google OAuth2', value: 'google' },
            ],
            when: (answers) => answers.orm !== 'none'
        },
    ]);

    const apps = [];
    if (projectDetails.projectType === 'Monorepo') {
        const { numApps } = await inquirer.prompt({
            type: 'number',
            name: 'numApps',
            message: 'How many applications would you like to create in the monorepo?',
            default: 2,
        });
        for (let i = 0; i < numApps; i++) {
            console.log(`\nConfiguring Application #${i + 1}...`);
            const appAnswers = await inquirer.prompt(getAppGeneratorQuestions({
                appName: i === 0 ? 'api-gateway' : `service-${i}`,
                appType: i === 0 ? 'API Gateway (HTTP)' : 'Microservice',
            }));
            apps.push(appAnswers);
        }
    } else {
        const appAnswers = await inquirer.prompt(getAppGeneratorQuestions());
        apps.push(appAnswers);
    }

    const { projectName, projectType, orm, authMethods } = projectDetails;
    const templatePath = path.join(__dirname, '..', '..', 'templates');
    const projectPath = path.join(process.cwd(), projectName);

    const rootTemplateData = {
        projectName,
        orm,
        authMethods: authMethods || [],
        usePrisma: orm === 'prisma',
        useSequelize: orm === 'sequelize',
        includeAuth: (authMethods && authMethods.length > 0),
        includeLocalAuth: (authMethods && authMethods.includes('local')),
        includeGoogleAuth: (authMethods && authMethods.includes('google')),
    };

    console.log(`\nGenerating project in ${projectPath}...`);

    if (projectType === 'Monorepo') {
        const monorepoRootPath = projectPath;
        createDirectoryContents(path.join(templatePath, 'monorepo-root'), monorepoRootPath, rootTemplateData);
        if (rootTemplateData.usePrisma) {
            createDirectoryContents(path.join(templatePath, 'prisma'), path.join(monorepoRootPath, 'prisma'), rootTemplateData);
        }
        if (rootTemplateData.useSequelize) {
            createDirectoryContents(path.join(templatePath, 'sequelize'), monorepoRootPath, rootTemplateData);
        }
        createDirectoryContents(path.join(templatePath, 'shared-package'), path.join(monorepoRootPath, 'packages', 'shared'), rootTemplateData);

        const microservices = apps.filter(app => app.appType === 'Microservice');

        for (const app of apps) {
            const appPath = path.join(monorepoRootPath, 'apps', app.appName);
            const appTemplateData = {
                ...rootTemplateData,
                projectName: app.appName,
                ...app,
                microservices: microservices,
                projectType: 'Monorepo',
                includeLogging: app.modules.includes('logging'),
                includeErrorHandling: app.modules.includes('errors'),
                includeValidation: app.modules.includes('validation'),
                includeConfig: app.modules.includes('config'),
                includeCaching: app.advancedFeatures.includes('caching'),
                includeQueues: app.advancedFeatures.includes('queues'),
                includeWebsockets: app.advancedFeatures.includes('websockets'),
                includeFcm: app.includeFcm,
            };
            createDirectoryContents(path.join(templatePath, 'nestjs-basic'), appPath, appTemplateData);
        }
    } else {
        const app = apps[0];
        const appTemplateData = {
            ...rootTemplateData,
            projectName: projectName,
            ...app,
            microservices: [],
            projectType: 'Standalone',
            includeLogging: app.modules.includes('logging'),
            includeErrorHandling: app.modules.includes('errors'),
            includeValidation: app.modules.includes('validation'),
            includeConfig: app.modules.includes('config'),
            includeCaching: app.advancedFeatures.includes('caching'),
            includeQueues: app.advancedFeatures.includes('queues'),
            includeWebsockets: app.advancedFeatures.includes('websockets'),
            includeFcm: app.includeFcm,
        };
        createDirectoryContents(path.join(templatePath, 'nestjs-basic'), projectPath, appTemplateData);
        if (rootTemplateData.usePrisma) {
            createDirectoryContents(path.join(templatePath, 'prisma'), path.join(projectPath, 'prisma'), rootTemplateData);
        }
        if (rootTemplateData.useSequelize) {
            createDirectoryContents(path.join(templatePath, 'sequelize'), projectPath, rootTemplateData);
        }
    }

    console.log(`Project ${projectName} generated successfully!`);
};

module.exports = { generateCommand };
