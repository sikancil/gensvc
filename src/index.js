#!/usr/bin/env node

const { Command } = require('commander');
const { generateCommand } = require('./commands/generate');
const { addAppCommand } = require('./commands/add-app');
const { reviewCommand } = require('./commands/review');
// The createDirectoryContents function is no longer needed here, but it's used in tests.
// Let's move the export to the file-utils to keep index.js clean.
const { createDirectoryContents } = require('./lib/file-utils');

const program = new Command();

program
  .name('gensvc')
  .description('A CLI tool to generate backend services and microservices.')
  .version('0.0.1');

program
  .command('generate')
  .alias('g')
  .description('Generate a new project.')
  .action(generateCommand);

program
  .command('add-app')
  .description('Add a new NestJS app to an existing monorepo.')
  .action(addAppCommand);

program
    .command('review')
    .description('Provide an AI-powered review and suggest next steps.')
    .action(reviewCommand);

program.parse(process.argv);

module.exports = { createDirectoryContents }; // Keep exporting for the test file
