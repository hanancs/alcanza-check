# alcanza-check 🔍

A fast, beautiful, and comprehensive network connectivity checker CLI.

`alcanza-check` helps you verify if an application is reachable by running multiple checks in parallel:
- **ICMP Ping**: Checks if the host responds to pings.
- **DNS Lookup**: Verifies if the hostname resolves to an IP.
- **TCP Connection**: Checks if a specific port is open.
- **SSL/TLS Validation**: Verifies the validity of the SSL certificate.

## Installation

You can run it directly without installing using `npx`:

```bash
npx alcanza-check example.com 443
```

Or install it globally:

```bash
npm install -g alcanza-check
```

## Usage

```bash
alcanza-check <host> [port]
```

Default port is `443` if not specified.

### Example

```bash
alcanza-check google.com 443
```

Output:
![Example Output](https://raw.githubusercontent.com/username/repo/main/screenshot.png) *(Placeholder)*

## Development

1. Clone the repo
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Run locally: `node dist/index.js <host> <port>`

## License

MIT
