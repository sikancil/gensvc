const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { createDirectoryContents } = require('../src/index');

describe('File Utilities', () => {
  describe('createDirectoryContents', () => {
    const tempDir = path.join(__dirname, 'temp-test');
    const templateDir = path.join(__dirname, '..', 'templates', 'dummy-template');

    beforeEach(async () => {
      await fsp.mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
      await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('should create a file from an ejs template and render the data', async () => {
      const targetPath = path.join(tempDir, 'output');
      const testData = { name: 'Jules' };

      createDirectoryContents(templateDir, targetPath, testData);

      const expectedFilePath = path.join(targetPath, 'test.txt.ejs');
      expect(fs.existsSync(expectedFilePath)).toBe(true);

      const fileContent = await fsp.readFile(expectedFilePath, 'utf8');
      expect(fileContent).toBe('Hello, Jules!');
    });
  });
});
