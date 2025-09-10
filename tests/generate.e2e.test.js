const { spawn, spawnSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

describe('CLI End-to-End Test', () => {
  const tempDir = path.join(__dirname, 'temp-project');
  const cliEntryPoint = path.join(__dirname, '..', 'src', 'index.js');
  const projectName = 'my-e2e-test-app';
  const projectPath = path.join(tempDir, projectName);

  beforeAll(async () => {
    await fs.emptyDir(tempDir);
  }, 30000);

  afterAll(async () => {
    await fs.remove(tempDir);
  }, 30000);

  test('should generate a new project that passes its own tests', () => {
    // 1. Run the generator
    const generate = spawnSync('node', [cliEntryPoint, 'generate', projectName], {
      cwd: tempDir,
      stdio: 'inherit',
    });
    expect(generate.status).toBe(0);
    expect(fs.existsSync(projectPath)).toBe(true);

    // 2. Run 'npm test' inside the generated project
    const test = spawnSync('npm', ['test'], {
      cwd: projectPath,
      stdio: 'inherit',
    });
    expect(test.status).toBe(0);
  }, 180000); // Increase timeout significantly for npm install and test
});
