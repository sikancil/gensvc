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
    console.log(`Generating project: ${projectName}...`);
    const templatePath = path.join(__dirname, '..', 'templates', 'hello-world');
    const targetPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(targetPath)) {
      console.error(`Error: Directory '${projectName}' already exists.`);
      process.exit(1);
    }

    // 1. Copy the template
    fs.copySync(templatePath, targetPath);

    // 2. Update the project name in the generated package.json
    const pkgPath = path.join(targetPath, 'package.json');
    const pkg = fs.readJsonSync(pkgPath);
    pkg.name = projectName;
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

    // 3. Run npm install (no dependencies, but good practice)
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
  });

program.parse(process.argv);
