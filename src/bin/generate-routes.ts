#!/usr/bin/env node
import path from 'path';
import { Command } from 'commander';
import { generate } from '../index';
import meta from '../../package.json';

const program = new Command();

program
  .version(meta.version)
  .usage('</path/to/src/pages>')
  .option('-b, --baseDir <dir>', 'default: targetDir')
  .option('-i, --ignore <globs...>', 'ex. **/*.stories.*')
  .option('-p, --importPrefix <prefix>', 'default: @/pages')
  .parse(process.argv);

if (program.args.length === 0) {
  program.help();
} else {
  const options = program.opts();

  const targetDir = path.resolve(process.cwd(), program.args[0]);
  const baseDir = path.resolve(process.cwd(), options.baseDir || targetDir);

  const sourceCode = generate({
    targetDir,
    baseDir,
    importPrefix: options.importPrefix ?? '@/pages',
    ignorePatterns: options.ignore,
  });
  console.log(sourceCode);
}
