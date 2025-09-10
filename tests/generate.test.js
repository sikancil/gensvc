const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const { createDirectoryContents } = require('../src/index');

describe('CLI Generator', () => {
  const tempDir = path.join(__dirname, 'temp');

  beforeEach(async () => {
    await fs.emptyDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
    jest.restoreAllMocks(); // Restore mocks after each test
  });

  test('should generate a standalone project with default options', async () => {
    // Mock the prompt method directly
    const mockAnswers = {
      projectName: 'test-project',
      projectType: 'Standalone',
      orm: 'prisma',
      authMethods: ['local'],
      appName: 'api',
      appType: 'API Gateway (HTTP)',
      transport: 'Redis',
      modules: ['logging', 'errors', 'config'],
      advancedFeatures: ['caching'],
      includeFcm: false
    };
    jest.spyOn(inquirer, 'prompt').mockResolvedValue(mockAnswers);

    // Simulate the main logic flow
    const answers = await inquirer.prompt();
    const { projectName, projectType, orm, authMethods, ...appAnswers } = answers;
    const templatePath = path.join(__dirname, '..', 'templates');
    const projectPath = path.join(tempDir, projectName);

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
        projectName: projectName,
        ...appAnswers,
        microservices: [],
        projectType: 'Standalone',
        includeLogging: appAnswers.modules.includes('logging'),
        includeErrorHandling: appAnswers.modules.includes('errors'),
        includeValidation: appAnswers.modules.includes('validation'),
        includeConfig: appAnswers.modules.includes('config'),
        includeCaching: appAnswers.advancedFeatures.includes('caching'),
        includeQueues: appAnswers.advancedFeatures.includes('queues'),
        includeWebsockets: appAnswers.advancedFeatures.includes('websockets'),
        includeFcm: appAnswers.includeFcm,
    };

    createDirectoryContents(path.join(templatePath, 'nestjs-basic'), projectPath, appTemplateData);
    if (rootTemplateData.usePrisma) {
        createDirectoryContents(path.join(templatePath, 'prisma'), path.join(projectPath, 'prisma'), rootTemplateData);
    }

    // Assertions
    expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'src', 'main.ts'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'prisma', 'schema.prisma'))).toBe(true);

    const pkg = await fs.readJson(path.join(projectPath, 'package.json'));
    expect(pkg.name).toBe('test-project');
    expect(pkg.dependencies['@nestjs/passport']).toBeDefined();
    expect(pkg.dependencies['@nestjs/cache-manager']).toBeDefined();
  });
});
