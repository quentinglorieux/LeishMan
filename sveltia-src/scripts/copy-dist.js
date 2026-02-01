import { cp, mkdir } from 'fs/promises';
import path from 'path';

const sourceDir = path.resolve('package/dist');
const targetDir = path.resolve('../nuxt-app/public/admin/dist-0.129');

await mkdir(targetDir, { recursive: true });
await cp(sourceDir, targetDir, { recursive: true });
