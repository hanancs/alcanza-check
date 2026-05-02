#!/usr/bin/env node
import pc from 'picocolors';
import Table from 'cli-table3';
import { checkDNS, checkTCP, checkSSL, checkPing, CheckResult } from './checks.js';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(pc.yellow('Usage: alcanza-check <host> [port]'));
    console.log(pc.dim('Example: alcanza-check example.com 443'));
    process.exit(1);
  }

  const host = args[0];
  const port = parseInt(args[1] || '443', 10);

  console.log(`\n${pc.cyan('🔍 Checking connectivity for:')} ${pc.bold(host)}${pc.dim(':')}${pc.bold(port)}\n`);

  const startTime = Date.now();

  // Run checks in parallel
  const results = await Promise.all([
    checkPing(host),
    checkDNS(host),
    checkTCP(host, port),
    checkSSL(host, port),
  ]);

  const duration = Date.now() - startTime;

  const table = new Table({
    head: [pc.bold('Check'), pc.bold('Status'), pc.bold('Details')],
    colWidths: [20, 15, 40],
    wordWrap: true,
  });

  for (const res of results) {
    const statusText = res.status === 'passed' 
      ? pc.green('✔ PASSED') 
      : pc.red('✘ FAILED');
    
    table.push([res.name, statusText, res.details]);
  }

  console.log(table.toString());
  console.log(`\n${pc.dim(`Completed in ${duration}ms`)}\n`);
}

main().catch((err) => {
  console.error(pc.red('An unexpected error occurred:'), err);
  process.exit(1);
});
