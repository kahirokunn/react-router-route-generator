#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import program from 'commander';
import { generate } from '../index';
import meta from '../../package.json';

program
  .version(meta.version)
  .option('-o, --output <dir>', 'output file dir')
  .option('-s, --sourceHead <string>', 'sourceHead')
  .option('--wrap <string>', 'default: loadable($1)')
  .option('--targetDir <dir>', 'target page dir. default: src/pages')
  .option('-i, --ignore <globs...>', 'ex. **/*.stories.*')
  .option('--typescript', 'generate typescript type file')
  .parse(process.argv);

if (!program.output) {
  program.help();
} else {
  const outputDir = path.resolve(process.cwd(), program.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const code = generate({
    sourceHead: program.sourceHead,
    wrap: program.wrap,
    targetDir: program.targetDir,
    ignorePatterns: program.ignore,
  });
  fs.writeFileSync(path.resolve(outputDir, 'routes.tsx'), code.routesCode);
  if (program.typescript) {
    fs.writeFileSync(path.resolve(outputDir, 'type.ts'), code.typeCode);
  }
}
