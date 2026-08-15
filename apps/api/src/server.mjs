import { createServer } from 'node:http';

const port = Number(process.env.PORT || 4000);
const json = (res, code, value) => { res.writeHead(code, {'content-type':'application/json','access-control-allow-origin':'*'}); res.end(JSON.stringify(value)); };

createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') return json(res, 200, {status:'ok', service:'ai-os-api', version:'0.1.0'});
  if (req.method === 'GET' && req.url === '/api') return json(res, 200, {name:'AI Operating System API', endpoints:['/health','/api']});
  return json(res, 404, {error:'not_found'});
}).listen(port, () => console.log(`AI OS API listening on ${port}`));
