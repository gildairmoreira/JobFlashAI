import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// FORCE ABSOLUTE PATHS FOR WINDOWS ENVIRONMENT
const PROJECT_ROOT = 'c:/dev/JobFlashAI';
const envPath = path.join(PROJECT_ROOT, '.env');
const schemaPath = path.join(PROJECT_ROOT, 'prisma/schema.prisma');

console.log('Reading .env from:', envPath);
if (!fs.existsSync(envPath)) {
    console.error('CRITICAL: .env not found at', envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        envVars[match[1]] = value;
    }
});

console.log('Syncing database using schema:', schemaPath);
try {
    execSync(`npx prisma db push --schema="${schemaPath}"`, {
        cwd: PROJECT_ROOT,
        env: { ...process.env, ...envVars },
        stdio: 'inherit'
    });
    console.log('Database synced successfully!');
} catch (error) {
    console.error('Failed to sync database:', error.message);
    process.exit(1);
}
