const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { getAppGeneratorQuestions } = require('../lib/questions');
const { createDirectoryContents, updateApiGateways } = require('../lib/file-utils');

const addAppCommand = async () => {
    if (!fs.existsSync(path.join(process.cwd(), 'pnpm-workspace.yaml'))) {
        console.error('Error: This command must be run from the root of a gensvc monorepo.');
        return;
    }

    const rootPackageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const rootProjectName = rootPackageJson.name;

    const appAnswers = await inquirer.prompt(getAppGeneratorQuestions());

    const appName = appAnswers.appName;
    const appPath = path.join(process.cwd(), 'apps', appName);

    if (fs.existsSync(appPath)) {
        console.error(`Error: App '${appName}' already exists.`);
        return;
    }

    const templatePath = path.join(__dirname, '..', '..', 'templates');
    const templateData = {
        projectName: appName,
        rootTemplateData: { projectName: rootProjectName },
        ...appAnswers,
        projectType: 'Monorepo',
        microservices: [],
        includeLogging: appAnswers.modules.includes('logging'),
        includeErrorHandling: appAnswers.modules.includes('errors'),
        includeValidation: appAnswers.modules.includes('validation'),
        includeConfig: appAnswers.modules.includes('config'),
        includeCaching: appAnswers.advancedFeatures.includes('caching'),
        includeQueues: appAnswers.advancedFeatures.includes('queues'),
        includeWebsockets: appAnswers.advancedFeatures.includes('websockets'),
        includeFcm: appAnswers.includeFcm,
        usePrisma: fs.existsSync(path.join(process.cwd(), 'prisma')),
        useSequelize: false,
        includeAuth: false,
    };

    console.log(`Adding new app '${appName}' in ${appPath}...`);
    createDirectoryContents(path.join(templatePath, 'nestjs-basic'), appPath, templateData);
    console.log(`App '${appName}' added successfully!`);

    if (appAnswers.appType === 'Microservice') {
        console.log('New microservice detected. Attempting to update API gateways...');
        updateApiGateways(appAnswers);
    }
};

module.exports = { addAppCommand };
