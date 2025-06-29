const https = require('https');

// URLs para testar
const urls = [
  'https://www.catalogopublico.com/api/webhook',
  'https://catalogopublico.com/api/webhook',
  'https://www.catalogopublico.com',
  'https://catalogopublico.com'
];

function testRedirect(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      console.log(`\n🔍 Testando: ${url}`);
      console.log(`📡 Status: ${res.statusCode}`);
      console.log(`📍 Location: ${res.headers.location || 'Nenhum'}`);
      console.log(`📋 Headers:`, {
        'content-type': res.headers['content-type'],
        'server': res.headers.server,
        'x-vercel-cache': res.headers['x-vercel-cache']
      });
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (data.length > 0) {
          console.log(`📄 Resposta: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        }
        resolve({ status: res.statusCode, location: res.headers.location, data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Erro ao testar ${url}:`, error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testAllUrls() {
  console.log('🔍 Testando redirecionamentos...\n');
  
  for (const url of urls) {
    try {
      await testRedirect(url);
    } catch (error) {
      console.log(`❌ Falha ao testar ${url}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Teste concluído!');
}

testAllUrls(); 