const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Dogfood 2026 is running!');
});
server.listen(3000, () => {
  console.log('Server ready on port 3000');
  console.log('organizer cookie: session=org_7f2a');
  console.log('judge_a cookie: session=jdg_a');
  console.log('judge_b cookie: session=jdg_b');
  console.log('participant cookie: session=part_1');
});