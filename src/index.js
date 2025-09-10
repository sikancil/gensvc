#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');

const program = new Command();

program
  .name('gensvc')
  .description('A CLI for generating a baseline NestJS service.')
  .version('1.0.0');

program
  .command('generate <projectName>')
  .description('Generate a new NestJS project.')
  .action((projectName) => {
    console.log(`Generating project: ${projectName}...`);
    const templatePath = path.join(__dirname, '..', 'templates', 'nestjs-basic');
    const targetPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(targetPath)) {
      console.error(`Error: Directory '${projectName}' already exists.`);
      process.exit(1);
    }

    // Copy the template
    fs.copySync(templatePath, targetPath);

    // Update the project name in the generated package.json
    const pkgPath = path.join(targetPath, 'package.json');
    const pkg = fs.readJsonSync(pkgPath);
    pkg.name = projectName;
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

    console.log('Template copied. Installing dependencies...');

    // Run npm install in the new project directory
    const install = spawnSync('npm', ['install'], {
      cwd: targetPath,
      stdio: 'inherit' // Show output to the user
    });

    if (install.status !== 0) {
        console.error(`Error: 'npm install' failed. Please run it manually in the '${projectName}' directory.`);
        process.exit(1);
    }

    console.log(`\n✅ Project ${projectName} generated and dependencies installed successfully!`);
    console.log('\nTo get started:');
    console.log(`  cd ${projectName}`);
    console.log('  npm run start:dev');
  });

program.parse(process.argv);

// Export for testing if needed, though E2E is better
module.exports = { program };
