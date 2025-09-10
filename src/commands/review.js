const fs = require('fs');
const path = require('path');

const reviewCommand = () => {
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
};

module.exports = { reviewCommand };
