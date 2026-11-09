/**
 * EcoContainer Piracaia - Calculadora de Reserva Direta & Comparador Airbnb
 * Demonstra a economia sem a comissão de intermediação e gera pedido via WhatsApp.
 */

(function () {
    const DAILY_RATE = 480;      // Diária base (R$)
    const CLEANING_FEE = 150;    // Taxa única de higienização (R$)
    const AIRBNB_FEE_RATE = 0.16; // Taxa média cobrada ao hóspede no Airbnb (~16%)
    
    // Telefone de WhatsApp do proprietário (Piracaia/SP)
    const OWNER_PHONE = '5511998967740';

    // Elementos do DOM
    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');
    const guestSelect = document.getElementById('guest-count');
    const tripReasonSelect = document.getElementById('trip-reason');
    const extraCheckboxes = document.querySelectorAll('.extra-service');

    const nightBadge = document.getElementById('night-count-badge');
    const calcNightsEl = document.getElementById('calc-nights');
    const calcBasePriceEl = document.getElementById('calc-base-price');
    const extrasLineEl = document.getElementById('extras-line');
    const calcExtrasPriceEl = document.getElementById('calc-extras-price');
    const airbnbEstimateEl = document.getElementById('airbnb-estimate-price');
    const savingsEl = document.getElementById('savings-price');
    const directTotalEl = document.getElementById('direct-total-price');
    const btnBookWhatsapp = document.getElementById('btn-book-whatsapp');

    // Inicializa com as datas do próximo fim de semana
    function initDefaultDates() {
        const today = new Date();
        const nextFriday = new Date(today);
        nextFriday.setDate(today.getDate() + ((7 - today.getDay() + 5) % 7 || 7));
        
        const nextSunday = new Date(nextFriday);
        nextSunday.setDate(nextFriday.getDate() + 2);

        if (checkinInput && checkoutInput) {
            checkinInput.value = formatDateForInput(nextFriday);
            checkoutInput.value = formatDateForInput(nextSunday);
        }
    }

    function formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    function formatBRL(val) {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function calculateBooking() {
        if (!checkinInput || !checkoutInput) return;

        const checkinDate = new Date(checkinInput.value + 'T00:00:00');
        const checkoutDate = new Date(checkoutInput.value + 'T00:00:00');

        let nights = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
        if (isNaN(nights) || nights < 1) {
            nights = 1;
        }

        // Soma dos extras
        let extrasTotal = 0;
        let selectedExtrasNames = [];
        extraCheckboxes.forEach(cb => {
            if (cb.checked) {
                const price = parseFloat(cb.getAttribute('data-price') || 0);
                extrasTotal += price;
                const label = cb.closest('label').querySelector('span.font-bold').textContent;
                selectedExtrasNames.push(label);
            }
        });

        // Totais
        const baseLodging = nights * DAILY_RATE;
        const subtotalDirect = baseLodging + CLEANING_FEE;
        const totalDirect = subtotalDirect + extrasTotal;

        // Estimativa Airbnb (aplica a taxa sobre hospedagem + limpeza)
        const airbnbTotal = Math.round(subtotalDirect * (1 + AIRBNB_FEE_RATE));
        const savings = airbnbTotal - subtotalDirect;

        // Atualiza a interface
        if (nightBadge) nightBadge.textContent = `${nights} Diária${nights > 1 ? 's' : ''}`;
        if (calcNightsEl) calcNightsEl.textContent = nights;
        if (calcBasePriceEl) calcBasePriceEl.textContent = formatBRL(baseLodging);

        if (extrasLineEl && calcExtrasPriceEl) {
            if (extrasTotal > 0) {
                extrasLineEl.style.display = 'flex';
                calcExtrasPriceEl.textContent = formatBRL(extrasTotal);
            } else {
                extrasLineEl.style.display = 'none';
            }
        }

        if (airbnbEstimateEl) airbnbEstimateEl.textContent = formatBRL(airbnbTotal);
        if (savingsEl) savingsEl.textContent = `Economia de ${formatBRL(savings)}`;
        if (directTotalEl) directTotalEl.textContent = formatBRL(totalDirect);

        return {
            nights,
            checkin: checkinInput.value,
            checkout: checkoutInput.value,
            guests: guestSelect ? guestSelect.value : '2',
            reason: tripReasonSelect ? tripReasonSelect.options[tripReasonSelect.selectedIndex].text : '',
            extras: selectedExtrasNames,
            totalDirect: formatBRL(totalDirect),
            savings: formatBRL(savings)
        };
    }

    // Gerador de mensagem formatada para WhatsApp
    function sendWhatsAppBooking() {
        const data = calculateBooking();
        if (!data) return;

        // Formata datas para o padrão BR
        const fDate = (iso) => {
            if (!iso) return '';
            const parts = iso.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        };

        let msg = `🌿 *Solicitação de Reserva Direta - EcoContainer Piracaia*\n\n`;
        msg += `Olá! Gostaria de consultar a reserva direta (sem taxa de aplicativo):\n\n`;
        msg += `📅 *Check-in:* ${fDate(data.checkin)}\n`;
        msg += `📅 *Check-out:* ${fDate(data.checkout)} (${data.nights} diária${data.nights > 1 ? 's' : ''})\n`;
        msg += `👥 *Hóspedes:* ${data.guests} pessoa(s)\n`;
        if (data.reason) msg += `🎯 *Motivo:* ${data.reason}\n`;
        
        if (data.extras.length > 0) {
            msg += `✨ *Adicionais Escolhidos:*\n`;
            data.extras.forEach(item => msg += `  • ${item}\n`);
        }

        msg += `\n💰 *Total Direto Estimado:* ${data.totalDirect}\n`;
        msg += `🎉 *Economia vs Airbnb:* ${data.savings}\n\n`;
        msg += `Poderia me confirmar a disponibilidade destas datas? Obrigado!`;

        const encodedMsg = encodeURIComponent(msg);
        const whatsappUrl = `https://wa.me/${OWNER_PHONE}?text=${encodedMsg}`;
        window.open(whatsappUrl, '_blank');
    }

    // Eventos
    document.addEventListener('DOMContentLoaded', () => {
        initDefaultDates();
        calculateBooking();

        if (checkinInput) checkinInput.addEventListener('change', calculateBooking);
        if (checkoutInput) checkoutInput.addEventListener('change', calculateBooking);
        if (guestSelect) guestSelect.addEventListener('change', calculateBooking);
        if (tripReasonSelect) tripReasonSelect.addEventListener('change', calculateBooking);
        extraCheckboxes.forEach(cb => cb.addEventListener('change', calculateBooking));

        if (btnBookWhatsapp) {
            btnBookWhatsapp.addEventListener('click', sendWhatsAppBooking);
        }

        // Expõe globalmente para o calendar.js chamar quando clicar em "Reservar para esta data"
        window.recalculateBooking = calculateBooking;
    });
})();

