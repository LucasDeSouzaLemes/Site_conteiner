# 🏡 EcoContainer Piracaia - Plataforma de Locação Direta Autônoma

Plataforma completa de locação direta desenvolvida para eliminar as comissões do Airbnb (14% a 20%) e proporcionar uma operação **100% autônoma (zero contato manual do proprietário)** para a Casa Contêiner em Piracaia/SP.

---

## ✨ Principais Funcionalidades da Plataforma

1. **Visualizador 3D Interativo (Three.js) & Galeria de Fotos:**
   * Modelo 3D arquitetônico com paredes frisadas de contêiner naval, quarto panorâmico com cama queen, interior acolhedor e deck com ofurô aquecido iluminado.
   * Alternador com 1 clique entre **Modo Diurno (Ensolarado)** e **Modo Noturno (Aconchego)**.
   * Botão para alternar entre **Modelo 3D** e **Galeria de Fotos Reais da Propriedade**.
   * Hotspots interativos explicando o isolamento acústico e comodidades.

2. **Operação 100% Autônoma com Mercado Pago:**
   * O hóspede escolhe as datas, preenche os dados e paga diretamente via **PIX Instantâneo** ou **Cartão de Crédito**.
   * O dinheiro entra na conta do proprietário imediatamente.
   * **Simulador de Teste:** Botão para demonstrar aprovação de pagamento sem transações reais.

3. **Notificação Instantânea no Celular do Patrão (11) 99896-7740:**
   * **SMS Direto (Twilio):** Envia uma mensagem SMS na tela do celular dele assim que o PIX é aprovado.
   * **WhatsApp:** Mensagem pré-formatada pronta para tira-dúvidas ou suporte.
   * **App Mercado Pago:** Alerta push sonoro no celular.

4. **Sincronização Oficial com o Airbnb (iCal / Anti-Overbooking):**
   * O servidor gera o feed `/calendar.ics`.
   * Quando uma data for reservada no site direto, o Airbnb bloqueia a data automaticamente, impedindo reservas duplicadas.

5. **Calendário Mensal Visual Interativo:**
   * Mostra os dias livres e dias já ocupados (sincronizados do Airbnb).
   * O hóspede clica nos dias para selecionar check-in e check-out visualmente.

6. **Guia & Eventos Turísticos de Piracaia:**
   * Represa do Jaguari, Santo Cruzeiro, Rota dos Queijos da Mantiqueira, Cachoeira do Pião e Festas Tradicionais, com botão *"Reservar para esta data"*.

7. **Manual Digital do Hóspede (`guia-hospede.html`):**
   * Página mobile-first entregue automaticamente ao hóspede após a reserva:
     * Senha da fechadura digital da porta (`#4829*`).
     * Senha do Wi-Fi com botão de copiar em 1 clique.
     * Rotas no Waze e Google Maps.
     * Instruções do ofurô, fogueira e deliveries em Piracaia.

8. **Apresentação Comercial / Pitch para o Patrão (`proposta-patrao.html`):**
   * Dashboard executivo com simulador financeiro interativo para mostrar ao seu patrão quanto ele economiza por ano em taxas (R$ 8.000 a R$ 16.000+).

---

## 🚀 Como Rodar no Computador

### Opção 1: Atalhos Rápidos (Windows)
* **Para abrir o site no navegador:** Dê duplo clique em [`abrir_site.bat`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/abrir_site.bat).
* **Para iniciar o servidor completo:** Dê duplo clique em [`iniciar_servidor.bat`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/iniciar_servidor.bat).

### Opção 2: Terminal Node.js
```bash
npm start
```
Acesse no navegador: **`http://localhost:3000`**

---

## 🧪 Teste de SMS (Twilio)
Para disparar um SMS de teste para o celular `(11) 99896-7740`:
```bash
node test_sms.js
```
*(Ou passe as chaves direto: `node test_sms.js SEU_SID SEU_TOKEN SEU_NUMERO_TWILIO`)*

---

## 📂 Estrutura de Arquivos

* [`index.html`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/index.html) - Plataforma principal do hóspede com 3D, fotos, checkout e calendário.
* [`proposta-patrao.html`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/proposta-patrao.html) - Pitch deck comercial com calculadora de lucros para o seu patrão.
* [`guia-hospede.html`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/guia-hospede.html) - Manual digital de boas-vindas pós-reserva.
* [`server.js`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/server.js) - Servidor backend com API Mercado Pago, Twilio SMS e feed iCal.
* [`test_sms.js`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/test_sms.js) - Script de teste direto de SMS.
* [`guia_mercado_pago.md`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/guia_mercado_pago.md) - Passo a passo para gerar as credenciais do Mercado Pago.
* [`guia_ranqueamento_google.md`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/guia_ranqueamento_google.md) - Manual de SEO e Google Maps para Piracaia.
* [`deploy.md`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/deploy.md) - Instruções para publicar na nuvem (Vercel / Render / Domínio próprio).
