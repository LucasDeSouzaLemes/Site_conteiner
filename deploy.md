# 🚀 Como Publicar a Plataforma na Internet em Produção

Este guia explica como colocar o site no ar com endereço próprio (ex: `ecocontainerpiracaia.com.br`), certificado de segurança SSL (cadeado verde) e servidor ativo para o Mercado Pago e o iCal do Airbnb.

---

## Opção 1: Vercel / Netlify (Mais Rápido & Gratuito)

Se você quiser colocar o site no ar imediatamente para qualquer pessoa acessar pelo celular:

1. Acesse [vercel.com](https://vercel.com) e crie uma conta gratuita.
2. Baixe o instalador ou simplesmente arraste a pasta `trabalho` no painel da Vercel.
3. Em 60 segundos você recebe um link público (ex: `ecocontainer-piracaia.vercel.app`).
4. **Domínio Próprio:** Vá em *Settings* ➔ *Domains* e adicione o domínio do seu patrão (ex: `casaconteinerpiracaia.com.br` comprado no Registro.br por R$ 40/ano).

---

## Opção 2: Render.com / Railway (Servidor Node.js Completo)

Para ter o servidor `server.js` rodando 24 horas por dia gerando o feed iCal para o Airbnb e recebendo os webhooks do Mercado Pago:

1. Crie uma conta gratuita em [render.com](https://render.com).
2. Clique em **"New Web Service"** e conecte o repositório ou suba os arquivos.
3. Configure:
   * **Build Command:** `npm install` (ou deixe em branco, pois não há dependências pesadas).
   * **Start Command:** `node server.js`
4. Na aba **Environment Variables**, adicione:
   * `MP_ACCESS_TOKEN` = O token de produção do Mercado Pago do seu patrão.
   * `OWNER_PHONE` = `5511998967740`.
5. O Render fornecerá uma URL pública como `https://ecocontainer.onrender.com`.

---

## 📅 Conectando o link no Airbnb

Depois que o site estiver no ar:
1. Copie o link do iCal: `https://seu-site.com/calendar.ics`.
2. Cole no Airbnb em: **Preços e disponibilidade ➔ Sincronização de calendário ➔ Importar calendário**.
3. O Airbnb começará a sincronizar as datas a cada poucas horas automaticamente.

