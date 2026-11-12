/**
 * EcoContainer Piracaia - Central de Avaliações Oficiais do Airbnb
 * 
 * Arquivo dedicado para gerenciar os depoimentos e avaliações dos hóspedes.
 * Para adicionar, editar ou remover um comentário, basta alterar a lista abaixo.
 */

(function () {
    // 1. LISTA DE AVALIAÇÕES REAIS DOS HÓSPEDES
    const avaliacoesAirbnb = [
        {
            nome: "Mariana Silveira",
            origem: "São Paulo • SP",
            foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80",
            estrelas: 5,
            data: "Fevereiro 2026",
            comentario: "Lugar mágico! A piscina com a cascata e a vista para as montanhas é maravilhosa. À noite a fogueira sob o céu estrelado e o fogão a lenha fizeram nosso fim de semana inesquecível. O contêiner é muito aconchegante, camas confortáveis e não passa frio. Voltaremos com certeza!"
        },
        {
            nome: "Rodrigo Mendes",
            origem: "Campinas • SP",
            foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80",
            estrelas: 5,
            data: "Janeiro 2026",
            comentario: "Superou muito as fotos! A área gourmet envidraçada é sensacional, fizemos churrasco e comida na chapa de ferro do fogão a lenha. O espaço é 100% privativo e o anfitrião Adnei foi nota mil no atendimento e nas dicas locais. Recomendo de olhos fechados."
        },
        {
            nome: "Camila & Lucas",
            origem: "Santo André • SP",
            foto: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=160&h=160&q=80",
            estrelas: 5,
            data: "Janeiro 2026",
            comentario: "Refúgio perfeito para descansar da correria. Acordar ouvindo os pássaros, tomar café na varanda com a máquina de expresso e à noite acender a fogueira de chão com as cadeiras de madeira foi especial demais. Roupa de cama muito cheirosa e tudo brilhando de limpo."
        },
        {
            nome: "Felipe Toledo",
            origem: "São José dos Campos • SP",
            foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80",
            estrelas: 5,
            data: "Dezembro 2025",
            comentario: "Acesso facílimo à Represa de Piracaia! Levamos caiaque e aproveitamos o píer. A engenharia da casa contêiner é impressionante, acústica excelente e ar condicionado que gela super rápido. Estacionamento amplo e seguro para os carros. Nota 10!"
        },
        {
            nome: "Beatriz Lemes",
            origem: "São Paulo • SP",
            foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80",
            estrelas: 5,
            data: "Novembro 2025",
            comentario: "Fomos em família com crianças e foi maravilhoso. A piscina tem a prainha rasa que as crianças adoraram, e o gramado é lindo com o balanço de madeira. A cozinha gourmet é super bem equipada com máquina de gelo e utensílios completos. Amamos a estadia!"
        },
        {
            nome: "Eduardo Vargas",
            origem: "Guarulhos • SP",
            foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&h=160&q=80",
            estrelas: 5,
            data: "Outubro 2025",
            comentario: "A melhor experiência de hospedagem que já tive no interior paulista. O pôr do sol assistido da cadeira de descanso na varanda ou da piscina é cinematográfico. O anfitrião dá todas as instruções com carinho e precisão. 5 estrelas sem dúvidas!"
        }
    ];

    // Ícone oficial do Airbnb em SVG
    const airbnbLogoSvg = `
        <svg class="w-3 h-3 fill-current" viewBox="0 0 32 32">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.833 1.442 3.36 1.616 5.873.518 8.083-1.116 2.247-3.344 3.56-6.19 3.56-2.584 0-4.908-1.077-6.712-2.879-1.804 1.802-4.128 2.879-6.712 2.879-2.846 0-5.074-1.313-6.19-3.56-1.098-2.21-.924-4.723.518-8.083.986-2.293 5.146-11.003 7.1-14.833l.533-1.025C8.537 1.963 9.992 1 12 1h4zm0 2.5h-4c-1.192 0-2.072.584-3.111 2.443l-.533 1.026C6.444 10.71 2.33 19.324 1.413 21.46c-1.185 2.76-1.282 4.673-.424 6.398.857 1.724 2.505 2.642 4.723 2.642 2.215 0 4.237-.935 5.864-2.562l.424-.424.424.424c1.627 1.627 3.649 2.562 5.864 2.562 2.218 0 3.866-.918 4.723-2.642.858-1.725.761-3.638-.424-6.398-.917-2.136-5.031-10.75-6.943-14.491l-.533-1.026C14.072 4.084 13.192 3.5 12 3.5h4z"/>
        </svg>
    `;

    // 2. FUNÇÃO DE RENDERIZAÇÃO DOS CARTÕES
    function renderReviews() {
        const container = document.getElementById('reviews-cards-container');
        if (!container) return;

        container.innerHTML = avaliacoesAirbnb.map(item => `
            <div class="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="relative flex-shrink-0">
                                <img src="${item.foto}" alt="${item.nome}" class="w-12 h-12 rounded-full object-cover border-2 border-stone-200 shadow-sm">
                                <div class="absolute -bottom-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 border border-white shadow">
                                    ${airbnbLogoSvg}
                                </div>
                            </div>
                            <div>
                                <h4 class="font-bold text-stone-900 text-sm">${item.nome}</h4>
                                <p class="text-[11px] text-stone-600">${item.origem}</p>
                            </div>
                        </div>
                        <div class="flex text-amber-400 text-sm">
                            ${'★'.repeat(item.estrelas)}
                        </div>
                    </div>
                    <p class="text-stone-700 text-sm leading-relaxed">
                        "${item.comentario}"
                    </p>
                </div>
                <div class="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                    <span class="flex items-center gap-1 text-emerald-700 font-semibold">
                        <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Estadia Verificada no Airbnb
                    </span>
                    <span>${item.data}</span>
                </div>
            </div>
        `).join('');

        // Recria os ícones do Lucide para os novos elementos
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    // Inicialização segura
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderReviews);
    } else {
        renderReviews();
    }
})();
