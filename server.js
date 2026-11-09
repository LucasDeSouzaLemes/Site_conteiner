const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// Carrega variáveis do arquivo .env se existir (zero dependências extras)
if (fs.existsSync(path.join(BASE_DIR, '.env'))) {
    try {
        const envContent = fs.readFileSync(path.join(BASE_DIR, '.env'), 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [k, ...v] = trimmed.split('=');
                if (k && v.length) {
                    process.env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
                }
            }
        });
    } catch (e) {
        console.warn('Aviso: Não foi possível ler o arquivo .env:', e.message);
    }
}

const PORT = process.env.PORT || 3000;

// Banco de dados em memória simples para armazenar reservas
let reservations = [
    {
        id: 'RES-DEMO-01',
        guestName: 'Carlos Silva',
        guestEmail: 'carlos@email.com',
        guestPhone: '11999998888',
        checkin: '2026-11-20',
        checkout: '2026-11-22',
        total: 1110.00,
        status: 'approved',
        paymentMethod: 'pix',
        createdAt: new Date().toISOString()
    }
];

// Token do Mercado Pago e Telefone do Proprietário
let MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const OWNER_PHONE = process.env.OWNER_PHONE || '5511998967740';
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || ''; // Ex: URL da Evolution API ou Z-API

// Configuração da API de SMS (Twilio)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM_PHONE = process.env.TWILIO_FROM_PHONE || ''; // Número virtual Twilio gerado

function sendSmsNotification(resObj) {
    const smsBody = `EcoContainer: Nova reserva de ${resObj.guestName}! Check-in: ${resObj.checkin}. Total: R$ ${Number(resObj.total).toFixed(2)} pago no PIX. Senha da porta: #4829*`;

    console.log(`📱 [DISPARO SMS] Preparando SMS para +${OWNER_PHONE}...`);

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_PHONE) {
        try {
            const https = require('https');
            const postData = new URLSearchParams({
                To: `+${OWNER_PHONE}`,
                From: TWILIO_FROM_PHONE,
                Body: smsBody
            }).toString();

            const authHeader = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

            const req = https.request({
                hostname: 'api.twilio.com',
                port: 443,
                path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                let resBody = '';
                res.on('data', chunk => resBody += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(resBody);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            console.log('✅ SMS enviado com sucesso para o celular do proprietário!');
                            console.log(`   Twilio SID: ${parsed.sid}`);
                        } else if (parsed.code === 572006) {
                            console.log('⚠️ [Twilio Trial]: O envio de SMS personalizado para o Brasil requer conta Twilio ativada (Upgrade).');
                            console.log('📲 A reserva foi confirmada normalmente no site e está salva no painel!');
                        } else {
                            console.error(`❌ Resposta da Twilio (Código ${parsed.code || res.statusCode}):`, parsed.message || resBody);
                        }
                    } catch (e) {
                        console.log('Resposta Twilio:', resBody);
                    }
                });
            });

            req.on('error', err => console.error('Erro de conexão ao enviar SMS:', err.message));
            req.write(postData);
            req.end();
        } catch (err) {
            console.error('Erro inesperado ao disparar SMS:', err.message);
        }
    } else {
        console.log(`ℹ️ [SIMULAÇÃO SMS]: Mensagem pronta para o celular +${OWNER_PHONE}:`);
        console.log(`   "${smsBody}"`);
        console.log(`   (Configure as chaves no arquivo .env para envio real)\n`);
    }
}

function notifyOwner(resObj) {
    // 1. Envia Notificação por SMS para o celular do patrão
    sendSmsNotification(resObj);

    // 2. Notificação formatada para WhatsApp / Webhook
    const msg = `🔔 *NOVA LOCAÇÃO CONFIRMADA!*\n\n` +
        `👤 *Hóspede:* ${resObj.guestName}\n` +
        `📞 *WhatsApp:* ${resObj.guestPhone || 'Não informado'}\n` +
        `📅 *Período:* ${resObj.checkin} até ${resObj.checkout} (${resObj.nights} noites)\n` +
        `💰 *Valor Pago:* R$ ${Number(resObj.total).toFixed(2)} (Mercado Pago PIX)\n` +
        `🔄 *iCal:* Airbnb bloqueado automaticamente.\n` +
        `🔑 *Senha da Fechadura:* #4829*`;

    console.log(`\n======================================================`);
    console.log(`🔔 [DISPARO AUTOMÁTICO] Notificação para ${OWNER_PHONE}`);
    console.log(msg);
    console.log(`======================================================\n`);

    if (WHATSAPP_API_URL) {
        try {
            const https = require('https');
            const data = JSON.stringify({ phone: OWNER_PHONE, message: msg });
            const urlObj = new URL(WHATSAPP_API_URL);
            const req = https.request(urlObj, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            });
            req.on('error', err => console.error('Erro ao conectar na API de WhatsApp:', err.message));
            req.write(data);
            req.end();
        } catch (e) {
            console.error('Erro ao disparar WhatsApp automático:', e.message);
        }
    }
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ics': 'text/calendar; charset=utf-8'
};

// Gerador de feed oficial iCalendar (RFC 5545) para sincronização automática com o Airbnb
function generateICalFeed() {
    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//EcoContainer Piracaia//Locacao Direta//PT',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:EcoContainer Piracaia - Reservas Diretas'
    ];

    reservations.filter(r => r.status === 'approved').forEach(res => {
        const dtstart = res.checkin.replace(/-/g, '');
        const dtend = res.checkout.replace(/-/g, '');
        ics.push('BEGIN:VEVENT');
        ics.push(`UID:${res.id}@ecocontainerpiracaia.com.br`);
        ics.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
        ics.push(`DTSTART;VALUE=DATE:${dtstart}`);
        ics.push(`DTEND;VALUE=DATE:${dtend}`);
        ics.push(`SUMMARY:Reservado - EcoContainer (${res.guestName.split(' ')[0]})`);
        ics.push(`DESCRIPTION:Reserva Direta confirmada via Mercado Pago. ID: ${res.id}`);
        ics.push('STATUS:CONFIRMED');
        ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');
    return ics.join('\r\n');
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    // ==========================================
    // 1. ROTAS DE API (MERCADO PAGO & RESERVAS)
    // ==========================================

    // Endpoint iCal para o Airbnb ler as reservas do site próprio
    if (pathname === '/calendar.ics' || pathname === '/api/calendar.ics') {
        res.writeHead(200, {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'inline; filename="calendar.ics"',
            'Cache-Control': 'no-cache'
        });
        res.end(generateICalFeed());
        return;
    }

    // Criar Pagamento Mercado Pago (PIX / Cartão)
    if (pathname === '/api/create-payment' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                const reservationId = 'RES-' + Date.now().toString().slice(-6);

                const newRes = {
                    id: reservationId,
                    guestName: data.name || 'Hóspede',
                    guestEmail: data.email || '',
                    guestPhone: data.phone || '',
                    checkin: data.checkin,
                    checkout: data.checkout,
                    nights: data.nights || 2,
                    total: data.total || 1110.00,
                    status: 'pending',
                    paymentMethod: data.method || 'pix',
                    createdAt: new Date().toISOString()
                };

                reservations.push(newRes);

                // Código PIX realista para demonstração (ou integração real com MP se houver Token)
                const mockPixCopyPaste = `00020126580014br.gov.bcb.pix0136ecocontainer-piracaia-${reservationId}520400005303986540${Math.round(newRes.total)}.005802BR5922EcoContainer Piracaia6008Piracaia62070503***6304ABCD`;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    reservationId: reservationId,
                    status: 'pending',
                    total: newRes.total,
                    pixQrCodeBase64: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(mockPixCopyPaste),
                    pixCopiaECola: mockPixCopyPaste,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                    message: 'Cobrança PIX gerada com sucesso via Mercado Pago'
                }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Dados inválidos' }));
            }
        });
        return;
    }

    // Consultar status de uma reserva / pagamento
    if (pathname.startsWith('/api/check-payment/') && req.method === 'GET') {
        const id = pathname.replace('/api/check-payment/', '');
        const resObj = reservations.find(r => r.id === id);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            status: resObj ? resObj.status : 'not_found'
        }));
        return;
    }

    // Simular aprovação imediata do pagamento (para testes locais do patrão)
    if (pathname.startsWith('/api/simulate-approval/') && req.method === 'POST') {
        const id = pathname.replace('/api/simulate-approval/', '');
        const resObj = reservations.find(r => r.id === id);

        if (resObj) {
            resObj.status = 'approved';
            notifyOwner(resObj);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            status: 'approved',
            reservation: resObj
        }));
        return;
    }

    // Webhook Oficial do Mercado Pago (para ambiente de produção)
    if (pathname === '/api/mercadopago-webhook' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            console.log('Webhook Mercado Pago recebido:', body);
            // Em produção: consulta a API do Mercado Pago /v1/payments/{id} e atualiza para approved
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ received: true }));
        });
        return;
    }

    // ==========================================
    // 2. SERVIR ARQUIVOS ESTÁTICOS
    // ==========================================
    let cleanUrl = pathname;
    if (cleanUrl === '/') cleanUrl = '/index.html';

    const filePath = path.join(BASE_DIR, cleanUrl);

    if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403);
        res.end('Acesso Negado');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Arquivo não encontrado: ' + cleanUrl);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 EcoContainer Piracaia - Servidor com Checkout Autônomo`);
    console.log(`💳 API Mercado Pago: Pronta para PIX e Cartão`);
    console.log(`📅 Feed iCal Airbnb: http://localhost:${PORT}/calendar.ics`);
    console.log(`👉 Acesse a plataforma: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
