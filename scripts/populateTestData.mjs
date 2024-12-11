import * as dotenv from 'dotenv';
dotenv.config();

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('ts-node').register();
import('../src/scripts/addTestDrivers.ts');
