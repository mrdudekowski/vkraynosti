import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const src = readFileSync(resolve('src/data/toursData.ts'), 'utf8');
const blocks = [...src.matchAll(/\{\s*\n\s*id:\s*'([^']+)',[\s\S]*?season:\s*'(winter|spring|summer)'/g)];
console.log('core blocks', blocks.length);
