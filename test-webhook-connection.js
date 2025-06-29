const https = require('https');
const http = require('http');

// URL do webhook
const webhookUrl = 'https://www.catalogopublico.com/api/webhook';

console.log('🔍 Testando conectividade do webhook...');
console.log('📍 URL:', webhookUrl);

// Função para testar HTTP
function testHttp(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      console.log('📡 Status HTTP:', res.statusCode);
      console.log('📋 Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Resposta:', data);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro HTTP:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Função para testar HTTPS
function testHttps(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      console.log('📡 Status HTTPS:', res.statusCode);
      console.log('📋 Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Resposta:', data);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro HTTPS:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Testar conectividade
async function testWebhook() {
  try {
    console.log('\n🔍 Testando HTTPS...');
    await testHttps(webhookUrl);
  } catch (error) {
    console.log('❌ HTTPS falhou, testando HTTP...');
    try {
      await testHttp(webhookUrl.replace('https://', 'http://'));
    } catch (httpError) {
      console.error('❌ Ambos HTTPS e HTTP falharam');
    }
  }
}

testWebhook(); 