#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');

const program = new Command();

program
  .name('gensvc')
  .description('A CLI for generating a Hello World app.')
  .version('1.0.0');

program
  .command('generate <projectName>')
  .description('Generate a new Hello World project.')
  .action((projectName) => {
    try {
      console.log(`Generating project: ${projectName}...`);
      const templatePath = path.join(__dirname, '..', 'templates', 'hello-world');
      const targetPath = path.join(process.cwd(), projectName);

      if (fs.existsSync(targetPath)) {
        console.error(`Error: Directory '${projectName}' already exists.`);
        process.exit(1);
      }

      fs.copySync(templatePath, targetPath);

      const pkgPath = path.join(targetPath, 'package.json');
      const pkg = fs.readJsonSync(pkgPath);
      pkg.name = projectName;
      fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

      console.log('Installing dependencies...');
      const install = spawnSync('npm', ['install'], {
        cwd: targetPath,
        stdio: 'inherit'
      });

      if (install.status !== 0) {
          console.error(`'npm install' failed.`);
          process.exit(1);
      }

      console.log(`\n✅ Project ${projectName} generated successfully!`);
    } catch (error) {
        console.error('\n❌ An error occurred during generation:');
        console.error(error.message);
        process.exit(1);
    }
  });

program.parse(process.argv);
