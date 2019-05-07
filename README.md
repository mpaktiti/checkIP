# Anomaly detection exercise

## Query for an IP
1. Start Postgres: `brew services start postgresql`
2. Start Node: `node index.js`
3. Send a GET request to the endpoint `http://localhost:3000/IP`, specifying the IP. For example: `curl http://localhost:3000/IP/23.239.26.255`

## Sync IPs
1. To download the latest file run: `npm run clone`
2. To process the new files run: `npm run sync`
