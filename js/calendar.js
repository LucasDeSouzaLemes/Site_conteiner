/**
 * EcoContainer Piracaia - Guia e Calendário de Eventos de Piracaia
 * Alimentação dinâmica de atrações e conexão direta com o motor de reserva.
 */

const piracaiaEvents = [
    {
        id: 'represa-nautica',
        title: 'Temporada Náutica & Pôr do Sol na Represa',
        category: 'represa',
        categoryLabel: '⛵ Represa & Náutica',
        dates: 'De Novembro a Abril (Alta Temporada)',
        suggestedCheckin: '2026-11-20',
        suggestedCheckout: '2026-11-22',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        description: 'Aproveite as águas cristalinas da Represa do Jaguari para passeios de lancha, caiaque, pesca e um pôr do sol inesquecível na serra.',
        distance: 'Apenas 12 min da casa contêiner'
    },
    {
        id: 'festa-santo-antonio',
        title: 'Festa do Padroeiro Santo Antônio',
        category: 'cultural',
        categoryLabel: '🎉 Tradição & Festa',
        dates: 'Mês de Junho (Tradição Centenária)',
        suggestedCheckin: '2027-06-12',
        suggestedCheckout: '2027-06-14',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80',
        description: 'Uma das maiores e mais tradicionais festas juninas do interior paulista, com quadrilhas, gastronomia caipira autêntica e shows na praça central.',
        distance: 'Centro de Piracaia (15 min)'
    },
    {
        id: 'rota-queijos-vinhos',
        title: 'Circuito dos Queijos Artesanais & Vinhedos',
        category: 'gastronomia',
        categoryLabel: '🧀 Gastronomia & Vinhos',
        dates: 'Todos os Finais de Semana do Ano',
        suggestedCheckin: '2026-12-04',
        suggestedCheckout: '2026-12-06',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        description: 'Visite as queijarias premiadas da Serra da Mantiqueira em Piracaia e Joanópolis. Degustação de queijos de mofo branco, trutas frescas e cachaças locais.',
        distance: 'Roteiro rural a 10-20 min'
    },
    {
        id: 'santo-cruzeiro',
        title: 'Mirante 360° do Santo Cruzeiro',
        category: 'cultural',
        categoryLabel: '✝️ Ponto Turístico',
        dates: 'Aberto Diariamente (Melhor ao Entardecer)',
        suggestedCheckin: '2026-11-27',
        suggestedCheckout: '2026-11-29',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        description: 'Conheça o maior crucifixo da América Latina, com vista panorâmica para toda a cadeia de montanhas entre Piracaia, Atibaia e Joanópolis.',
        distance: 'A 18 min do contêiner'
    },
    {
        id: 'cachoeira-piao',
        title: 'Trilha & Banho na Cachoeira do Pião',
        category: 'represa',
        categoryLabel: '🌲 Ecoturismo & Natureza',
        dates: 'Perfeito para Dias Ensolarados',
        suggestedCheckin: '2026-12-11',
        suggestedCheckout: '2026-12-13',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
        description: 'Piscinas naturais preservadas e pequenas quedas d’água rodeadas pela exuberante Mata Atlântica nativa da região.',
        distance: 'A 25 min em estrada de terra cênica'
    },
    {
        id: 'festival-inverno',
        title: 'Festival Gastronômico de Inverno da Mantiqueira',
        category: 'gastronomia',
        categoryLabel: '🍷 Temporada de Inverno',
        dates: 'Julho & Agosto (Noites Frias & Lareira)',
        suggestedCheckin: '2027-07-09',
        suggestedCheckout: '2027-07-11',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
        description: 'Clima de montanha perfeito para curtir o ofurô aquecido, lareira externa e pratos especiais com truta e fondue nos restaurantes de Piracaia.',
        distance: 'Vários restaurantes parceiros'
    }
];

function renderEvents(category = 'all') {
    const grid = document.getElementById('events-grid');
    if (!grid) return;

    const filtered = category === 'all' 
        ? piracaiaEvents 
        : piracaiaEvents.filter(e => e.category === category);

    grid.innerHTML = filtered.map(item => `
        <div class="bg-stone-800/80 rounded-2xl overflow-hidden border border-stone-700/70 hover:border-emerald-500/50 transition-all flex flex-col group shadow-lg">
            <div class="h-44 overflow-hidden relative">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                    ${item.categoryLabel}
                </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <span class="text-[11px] text-amberWood font-bold block mb-1">📅 ${item.dates}</span>
                    <h4 class="font-serif font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                        ${item.title}
                    </h4>
                    <p class="text-stone-300 text-xs mt-2 leading-relaxed">
                        ${item.description}
                    </p>
                </div>
                <div class="mt-5 pt-3 border-t border-stone-700/60 flex items-center justify-between">
                    <span class="text-[11px] text-stone-400">📍 ${item.distance}</span>
                    <button class="btn-book-event text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow"
                            data-checkin="${item.suggestedCheckin}"
                            data-checkout="${item.suggestedCheckout}"
                            data-event="${item.title}">
                        <span>Reservar para esta data</span> &rarr;
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Adiciona evento de clique aos botões de reservar para a data
    document.querySelectorAll('.btn-book-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const checkin = btn.getAttribute('data-checkin');
            const checkout = btn.getAttribute('data-checkout');
            const eventName = btn.getAttribute('data-event');

            const checkinInput = document.getElementById('checkin-date');
            const checkoutInput = document.getElementById('checkout-date');
            const tripReason = document.getElementById('trip-reason');

            if (checkinInput && checkoutInput) {
                checkinInput.value = checkin;
                checkoutInput.value = checkout;
            }
            if (tripReason) {
                tripReason.value = 'evento';
            }

            // Dispara recálculo no booking.js
            if (typeof window.recalculateBooking === 'function') {
                window.recalculateBooking();
            }

            // Rola até a área de reserva
            const reserveSection = document.getElementById('reservar');
            if (reserveSection) {
                reserveSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Configuração dos botões de filtro
document.addEventListener('DOMContentLoaded', () => {
    renderEvents('all');

    const filterButtons = document.querySelectorAll('.event-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active', 'bg-emerald-600', 'text-white'));
            filterButtons.forEach(b => b.classList.add('bg-stone-800', 'text-stone-300'));

            btn.classList.add('active', 'bg-emerald-600', 'text-white');
            btn.classList.remove('bg-stone-800', 'text-stone-300');

            const cat = btn.getAttribute('data-category');
            renderEvents(cat);
        });
    });
});

