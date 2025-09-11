const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

describe('CLI End-to-End Test', () => {
  const tempDir = path.join(__dirname, 'temp-project');
  const cliEntryPoint = path.join(__dirname, '..', 'src', 'index.js');
  const projectName = 'my-hello-world-app';
  const projectPath = path.join(tempDir, projectName);

  beforeAll(async () => {
    await fs.emptyDir(tempDir);
  }, 10000);

  afterAll(async () => {
    await fs.remove(tempDir);
  }, 10000);

  test('should generate a new project that runs successfully', () => {
    const generate = spawnSync('node', [cliEntryPoint, 'generate', projectName], {
      cwd: tempDir,
      encoding: 'utf-8'
    });
    expect(generate.stdout).toContain(`Project ${projectName} generated successfully!`);
    expect(generate.status).toBe(0);

    const app = spawnSync('npm', ['start'], {
      cwd: projectPath,
      encoding: 'utf-8'
    });
    expect(app.stdout).toContain('Hello, World!');
    expect(app.status).toBe(0);
  });
});
