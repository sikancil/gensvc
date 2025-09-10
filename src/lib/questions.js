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

module.exports = { getAppGeneratorQuestions };
