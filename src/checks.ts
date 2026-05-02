import * as dns from 'node:dns/promises';
import * as net from 'node:net';
import * as tls from 'node:tls';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface CheckResult {
  name: string;
  status: 'passed' | 'failed';
  details: string;
}

export async function checkDNS(host: string): Promise<CheckResult> {
  try {
    const result = await dns.lookup(host);
    return {
      name: 'DNS Lookup',
      status: 'passed',
      details: result.address,
    };
  } catch (error: any) {
    return {
      name: 'DNS Lookup',
      status: 'failed',
      details: error.message,
    };
  }
}

export async function checkTCP(host: string, port: number): Promise<CheckResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const start = Date.now();

    socket.setTimeout(5000);

    socket.on('connect', () => {
      const duration = Date.now() - start;
      socket.destroy();
      resolve({
        name: `TCP Port ${port}`,
        status: 'passed',
        details: `Connected in ${duration}ms`,
      });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({
        name: `TCP Port ${port}`,
        status: 'failed',
        details: err.message,
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        name: `TCP Port ${port}`,
        status: 'failed',
        details: 'Connection timed out',
      });
    });

    socket.connect(port, host);
  });
}

export async function checkSSL(host: string, port: number): Promise<CheckResult> {
  if (port !== 443 && port !== 8443) {
      // Basic heuristic: only check SSL for common ports unless we want to be more exhaustive.
      // But let's try anyway if it's explicitly requested.
  }

  return new Promise((resolve) => {
    const socket = tls.connect(port, host, { servername: host, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate();
      const isValid = socket.authorized;
      const details = isValid 
        ? `Valid until ${cert.valid_to}` 
        : `Invalid: ${socket.authorizationError}`;
      
      socket.end();
      resolve({
        name: 'SSL/TLS Cert',
        status: isValid ? 'passed' : 'failed',
        details: details,
      });
    });

    socket.on('error', (err) => {
      socket.end();
      resolve({
        name: 'SSL/TLS Cert',
        status: 'failed',
        details: err.message,
      });
    });

    socket.setTimeout(5000, () => {
      socket.end();
      resolve({
        name: 'SSL/TLS Cert',
        status: 'failed',
        details: 'Handshake timed out',
      });
    });
  });
}

export async function checkPing(host: string): Promise<CheckResult> {
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? `ping -n 1 ${host}` : `ping -c 1 ${host}`;

  try {
    const { stdout } = await execAsync(cmd);
    let details = 'Reachable';
    
    if (isWindows) {
        const match = stdout.match(/Average = (\d+ms)/);
        if (match) details = match[1];
    } else {
        const match = stdout.match(/time=(\d+\.?\d* ms)/);
        if (match) details = match[1];
    }

    return {
      name: 'ICMP Ping',
      status: 'passed',
      details: details,
    };
  } catch (error: any) {
    return {
      name: 'ICMP Ping',
      status: 'failed',
      details: 'Unreachable or request timed out',
    };
  }
}
