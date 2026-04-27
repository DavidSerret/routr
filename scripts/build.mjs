import { execSync } from 'child_process';

const env = { ...process.env };
delete env.__NEXT_PRIVATE_STANDALONE_CONFIG;

execSync('next build', { stdio: 'inherit', env });
