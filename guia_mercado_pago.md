# 💳 Guia Prático: Como Conectar a Conta do Mercado Pago para Receber os Pagamentos

Este guia explica como o seu patrão vincula a conta dele do Mercado Pago para que todo o dinheiro das diárias caia **diretamente na conta bancária dele, sem intermediários**.

---

## 1. Por que o Mercado Pago é a melhor escolha para o seu patrão?
* **Recebimento Instantâneo no PIX:** O cliente paga no site e o dinheiro entra na conta do Mercado Pago em 5 segundos.
* **Taxa Mínima:** A taxa do PIX no Mercado Pago para empresas/vendedores é de apenas **0,99%** (muito inferior aos 14% a 20% do Airbnb!).
* **Transferência Gratuita:** Ele pode transferir o dinheiro do Mercado Pago para o banco dele (Itaú, Bradesco, Nubank, Banco do Brasil, etc.) via PIX a qualquer momento, de graça.
* **Notificação no Celular:** O aplicativo do Mercado Pago no celular do seu patrão avisa na mesma hora com som de notificação: *"Você recebeu um PIX de R$ 1.110,00"*.

---

## 2. Passo a Passo para Obter as Credenciais (API)

1. Seu patrão acessa o portal de desenvolvedores do Mercado Pago:  
   👉 **[mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)**
2. Faz login com a mesma conta que ele usa no app do Mercado Pago / Mercado Livre.
3. No menu superior, clica em **"Suas integrações"** ➔ **"Criar aplicação"**.
4. Preenche os dados básicos:
   * **Nome da aplicação:** `EcoContainer Piracaia`
   * **Qual produto você vai integrar:** `Checkout Transparente` ou `Pagamentos por API`
5. Na aba **"Credenciais de Produção"**, ele terá acesso a duas chaves:
   * `Public Key` (Chave Pública): Começa com `APP_USR-...`
   * `Access Token` (Chave Secreta): Começa com `APP_USR-...`

---

## 3. Onde Inserir no Código do Projeto

No arquivo [`server.js`](file:///c:/Users/lemes/OneDrive/Desktop/trabalho/server.js), na linha 25:

```javascript
// Substitua pelas credenciais de produção do seu patrão
let MP_ACCESS_TOKEN = 'APP_USR-seu-token-aqui-123456789';
```

Ou, se preferir, use o **Painel de Configurações Rápidas** no rodapé do site para salvar direto pelo navegador.

---

## 4. Como Configurar a Sincronização iCal com o Airbnb (Evitar Overbooking)

Para garantir que o Airbnb nunca venda uma data já paga no site direto:

1. No painel do anfitrião do Airbnb, vá no anúncio da casa contêiner.
2. Clique em **Preços e disponibilidade** ➔ **Sincronização de calendário**.
3. Clique em **Importar calendário**:
   * **Nome do calendário:** `Reservas Diretas do Site`
   * **URL do calendário:** `https://seudominio.com.br/calendar.ics` (o endereço onde o seu site estiver hospedado).
4. Clique em **Salvar**.

Pronto! A partir desse momento, assim que um hóspede pagar a reserva no site pelo Mercado Pago, o Airbnb bloqueará essas datas automaticamente.

