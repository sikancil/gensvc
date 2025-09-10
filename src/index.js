#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const program = new Command();

// ... (getAppGeneratorQuestions function remains the same)
const getAppGeneratorQuestions = (defaults = {}) => [
    {
        type: 'input',
        name: 'appName',
        message: 'What is the name of the application?',
        default: defaults.appName || 'api',
    },
    {
        type: 'list',
        name: 'appType',
        message: 'What type of application is this?',
        choices: ['API Gateway (HTTP)', 'Microservice'],
        default: defaults.appType || 'API Gateway (HTTP)',
    },
    {
        type: 'list',
        name: 'transport',
        message: 'Select a transport layer for communication:',
        choices: ['Redis', 'Kafka', 'NATS'],
        default: 'Redis',
        when: (answers) => answers.appType === 'Microservice',
    },
    {
        type: 'checkbox',
        name: 'modules',
        message: 'Select essential modules to include:',
        choices: [
            { name: 'Logging (Pino)', value: 'logging', checked: true },
            { name: 'Global Error Handling', value: 'errors', checked: true },
            { name: 'Input Validation (Zod)', value: 'validation', checked: true },
            { name: 'Centralized Configuration (@nestjs/config)', value: 'config', checked: true }
        ]
    },
    {
        type: 'checkbox',
        name: 'advancedFeatures',
        message: 'Select advanced features to include:',
        choices: [
            { name: 'Redis Caching', value: 'caching' },
            { name: 'Task Queues (BullMQ)', value: 'queues' },
            { name: 'WebSockets (Socket.io)', value: 'websockets' }
        ]
    },
    {
        type: 'confirm',
        name: 'includeFcm',
        message: 'Include Firebase Cloud Messaging (FCM) for notifications?',
        default: false,
    }
];


program
  .name('gensvc')
  .description('A CLI tool to generate backend services and microservices.')
  .version('0.0.1');

// ... (generate and add-app commands remain the same)
program
  .command('generate')
  .alias('g')
  .description('Generate a new project.')
  .action(() => {
    inquirer.prompt([
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
        ...getAppGeneratorQuestions({ appName: 'api', appType: 'API Gateway (HTTP)' }),
    ]).then(answers => {
        const { projectName, projectType, orm, authMethods, ...appAnswers } = answers;
        const templatePath = path.join(__dirname, '..', 'templates');
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

        const appTemplateData = {
            ...rootTemplateData,
            projectName: appAnswers.appName,
            ...appAnswers,
            includeLogging: appAnswers.modules.includes('logging'),
            includeErrorHandling: appAnswers.modules.includes('errors'),
            includeValidation: appAnswers.modules.includes('validation'),
            includeConfig: appAnswers.modules.includes('config'),
            includeCaching: appAnswers.advancedFeatures.includes('caching'),
            includeQueues: appAnswers.advancedFeatures.includes('queues'),
            includeWebsockets: appAnswers.advancedFeatures.includes('websockets'),
            includeFcm: appAnswers.includeFcm,
        };

        console.log(`Generating project in ${projectPath}...`);

        if (projectType === 'Monorepo') {
            const monorepoRootPath = projectPath;
            const appPath = path.join(monorepoRootPath, 'apps', appAnswers.appName);
            const sharedPath = path.join(monorepoRootPath, 'packages', 'shared');

            // 1. Create monorepo root structure
            createDirectoryContents(path.join(templatePath, 'monorepo-root'), monorepoRootPath, rootTemplateData);

            // 2. Create the shared package
            createDirectoryContents(path.join(templatePath, 'shared-package'), sharedPath, rootTemplateData);

            // 3. Create the first application
            appTemplateData.projectName = appAnswers.appName; // Override for the app's package.json
            createDirectoryContents(path.join(templatePath, 'nestjs-basic'), appPath, appTemplateData);

            // 4. Generate Prisma files at the root
            if (rootTemplateData.usePrisma) {
                createDirectoryContents(path.join(templatePath, 'prisma'), path.join(monorepoRootPath, 'prisma'), rootTemplateData);
            }
        } else {
            appTemplateData.projectName = projectName;
            createDirectoryContents(path.join(templatePath, 'nestjs-basic'), projectPath, appTemplateData);
            if (rootTemplateData.usePrisma) {
                createDirectoryContents(path.join(templatePath, 'prisma'), path.join(projectPath, 'prisma'), rootTemplateData);
            }
        }

        console.log(`Project ${projectName} generated successfully!`);
    });
  });

program
  .command('add-app')
  .description('Add a new NestJS app to an existing monorepo.')
  .action(() => {
    if (!fs.existsSync(path.join(process.cwd(), 'pnpm-workspace.yaml'))) {
        console.error('Error: This command must be run from the root of a gensvc monorepo.');
        return;
    }
    inquirer.prompt(getAppGeneratorQuestions()).then(appAnswers => {
        const appName = appAnswers.appName;
        const appPath = path.join(process.cwd(), 'apps', appName);
        if (fs.existsSync(appPath)) {
            console.error(`Error: App '${appName}' already exists.`);
            return;
        }
        const templatePath = path.join(__dirname, '..', 'templates');
        const templateData = {
            projectName: appName,
            ...appAnswers,
            includeLogging: appAnswers.modules.includes('logging'),
            includeErrorHandling: appAnswers.modules.includes('errors'),
            includeValidation: appAnswers.modules.includes('validation'),
            includeConfig: appAnswers.modules.includes('config'),
            includeCaching: appAnswers.advancedFeatures.includes('caching'),
            includeQueues: appAnswers.advancedFeatures.includes('queues'),
            includeWebsockets: appAnswers.advancedFeatures.includes('websockets'),
            includeFcm: appAnswers.includeFcm,
            usePrisma: false,
            includeAuth: false
        };
        console.log(`Adding new app '${appName}' in ${appPath}...`);
        createDirectoryContents(path.join(templatePath, 'nestjs-basic'), appPath, templateData);
        console.log(`App '${appName}' added successfully!`);
    });
  });

program
    .command('review')
    .description('Provide an AI-powered review and suggest next steps.')
    .action(() => {
        console.log('🤖 Analyzing your project...');
        let recommendations = [];

        try {
            const pkgPath = path.join(process.cwd(), 'package.json');
            if (!fs.existsSync(pkgPath)) {
                console.error('Error: No package.json found. Please run this command from your project root.');
                return;
            }
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            recommendations.push('General: Review all `.env` files and replace placeholder values with your actual credentials and configuration.');

            if (deps['@prisma/client']) {
                recommendations.push('Database: Your `prisma/schema.prisma` file is a great starting point. Modify the User model and add your own data models to fit your application\'s needs.');
            }
            if (deps['passport-google-oauth20']) {
                recommendations.push('Authentication: You\'ve included Google OAuth2. Make sure to create a project in the Google Cloud Console and add your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to the `.env` file.');
            }
            if (deps['nestjs-zod']) {
                recommendations.push('Validation: You have Zod validation installed. Expand on the sample DTOs in `src/modules` to include more specific validation rules for all your application\'s inputs.');
            }
            if (deps['bullmq']) {
                recommendations.push('Task Queues: You\'ve set up BullMQ. Check out the `MessageConsumer` to see how jobs are processed and add your own business logic there.');
            }
            if (fs.existsSync(path.join(process.cwd(), 'pnpm-workspace.yaml'))) {
                recommendations.push('Monorepo: You\'re using a monorepo structure. Consider what logic can be extracted from your applications and moved into the `packages/shared` library to promote code reuse.');
            }

            console.log('\n✅ Analysis complete! Here are a few suggestions for your next steps:\n');
            recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
            console.log('\nHappy coding!');

        } catch (error) {
            console.error('An error occurred during analysis:', error);
        }
    });

function createDirectoryContents(templatePath, targetPath, data) {
    // ... (same as before)
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

program.parse(process.argv);
