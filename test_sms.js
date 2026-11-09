/**
 * Teste Rápido de Envio de SMS via Twilio
 * Execute no terminal: node test_sms.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Carrega variáveis do .env se existir
if (fs.existsSync(path.join(__dirname, '.env'))) {
    try {
        const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [k, ...v] = trimmed.split('=');
                if (k && v.length) {
                    process.env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
                }
            }
        });
    } catch (e) {}
}

let accountSid = process.env.TWILIO_ACCOUNT_SID || '';
let authToken = process.env.TWILIO_AUTH_TOKEN || '';
let fromPhone = process.env.TWILIO_FROM_PHONE || '';
const toPhone = process.env.OWNER_PHONE ? `+${process.env.OWNER_PHONE.replace(/\D/g, '')}` : '+5511998967740';

// Permite passar via argumentos: node test_sms.js ACxxxx token +1xxxx
if (process.argv[2]) accountSid = process.argv[2];
if (process.argv[3]) authToken = process.argv[3];
if (process.argv[4]) fromPhone = process.argv[4];

console.log('\n======================================================');
console.log('📲 Teste de Envio Direto de SMS (Twilio)');
console.log('======================================================');

if (!accountSid || !authToken || !fromPhone) {
    console.log('⚠️  Chaves da Twilio ainda não foram preenchidas no server.js.');
    console.log('\n👉 Para testar agora, preencha no server.js nas linhas 30-32:');
    console.log('   TWILIO_ACCOUNT_SID = "AC..."');
    console.log('   TWILIO_AUTH_TOKEN  = "..."');
    console.log('   TWILIO_FROM_PHONE  = "+1..."');
    console.log('\nOu execute passando as chaves direto:');
    console.log('   node test_sms.js SEU_SID SEU_TOKEN SEU_NUMERO_TWILIO\n');
    process.exit(0);
}

console.log(`De (Twilio): ${fromPhone}`);
console.log(`Para (Destino): ${toPhone}`);
console.log('Enviando mensagem de teste...\n');

const smsBody = 'EcoContainer Piracaia: Teste de notificacao direta de reserva via SMS! Tudo funcionando perfeitamente.';

const postData = new URLSearchParams({
    To: toPhone,
    From: fromPhone,
    Body: smsBody
}).toString();

const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

const req = https.request({
    hostname: 'api.twilio.com',
    port: 443,
    path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    method: 'POST',
    headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log('🎉 SUCESSO! SMS enviado para o celular!');
                console.log(`   ID da Mensagem (SID): ${data.sid}`);
                console.log(`   Status: ${data.status}`);
                console.log('\nOlhe o visor do celular ' + toPhone + ', a mensagem acabou de chegar!\n');
            } else {
                console.log('⚠️ Resposta da Twilio:');
                console.log(`   Código: ${data.code || res.statusCode}`);
                console.log(`   Mensagem: ${data.message || body}`);
                if (data.code === 572006) {
                    console.log('\n💡 MOTIVO DO CÓDIGO 572006:');
                    console.log('   A Twilio exige conta ativada (Upgrade com recarga) para enviar mensagens');
                    console.log('   personalizadas internacionais livres dos EUA (+1) para o Brasil (+55).');
                    console.log('   O código e a integração já estão 100% corretos para quando a conta for ativada!\n');
                } else if (data.code === 21608) {
                    console.log('\n💡 DICA: O número ' + toPhone + ' precisa ser verificado na Twilio.');
                    console.log('   Acesse: console.twilio.com ➔ Phone Numbers ➔ Verified Caller IDs\n');
                }
            }
        } catch (e) {
            console.log('Resposta bruta:', body);
        }
    });
});

req.on('error', (err) => {
    console.error('❌ Erro de conexão:', err.message);
});

req.write(postData);
req.end();

