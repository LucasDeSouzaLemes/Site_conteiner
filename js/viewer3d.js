/**
 * EcoContainer Piracaia - Visualizador 3D com Three.js
 * Renderiza a arquitetura da casa contêiner, deck com ofurô,
 * montanhas de Piracaia, iluminação dia/noite e hotspots interativos.
 */

(function () {
    const container = document.getElementById('threejs-canvas');
    if (!container) return;

    let scene, camera, renderer, controls;
    let dirLight, ambientLight, interiorLight, ofuroLight;
    let isNight = false;
    let clickableHotspots = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Estado da animação de câmera
    let targetCameraPos = null;
    let targetLookAt = new THREE.Vector3(0, 1.2, 0);

    function init() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Cena
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xdce9e2); // Céu suave diurno de serra
        scene.fog = new THREE.FogExp2(0xdce9e2, 0.022);

        // 2. Câmera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(13, 7, 13);

        // 3. Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // 4. Controles (OrbitControls)
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.03; // Não descer abaixo do chão
        controls.minDistance = 4;
        controls.maxDistance = 28;
        controls.target.copy(targetLookAt);

        // 5. Iluminação
        setupLighting();

        // 6. Construção da Casa Contêiner & Cenário
        buildTerrain();
        buildContainer();
        buildDeckAndOfuro();
        buildTrees();
        buildHotspots();

        // 7. Event Listeners
        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('click', onCanvasClick);
        setupUIControls();

        // 8. Loop de animação
        animate();
    }

    // Configuração de Luzes
    function setupLighting() {
        ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        scene.add(ambientLight);

        dirLight = new THREE.DirectionalLight(0xfff4e0, 1.2);
        dirLight.position.set(15, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 40;
        dirLight.shadow.camera.left = -12;
        dirLight.shadow.camera.right = 12;
        dirLight.shadow.camera.top = 12;
        dirLight.shadow.camera.bottom = -12;
        dirLight.shadow.bias = -0.0005;
        scene.add(dirLight);

        // Luzes internas acolhedoras
        interiorLight = new THREE.PointLight(0xffaa44, 1.5, 8);
        interiorLight.position.set(0, 2, 0);
        scene.add(interiorLight);

        // Luz do ofurô
        ofuroLight = new THREE.PointLight(0x00e5ff, 1.2, 4);
        ofuroLight.position.set(2.8, 0.7, 3.2);
        scene.add(ofuroLight);
    }

    // Terreno & Relevo de Piracaia (Mantiqueira)
    function buildTerrain() {
        // Gramado principal com ondulação
        const groundGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const distFromCenter = Math.sqrt(x * x + y * y);
            if (distFromCenter > 8) {
                // Morros suaves nas bordas
                const height = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 2.2 + (distFromCenter - 8) * 0.15;
                pos.setZ(i, height);
            }
        }
        groundGeo.computeVertexNormals();

        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x3d6b4f,
            roughness: 0.9,
            metalness: 0.05
        });

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Base de pedra/brita sob a casa
        const padGeo = new THREE.BoxGeometry(11, 0.15, 7.5);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x7a7975, roughness: 0.95 });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set(0.5, 0.07, 0.8);
        pad.receiveShadow = true;
        scene.add(pad);
    }

    // Casa Contêiner 40 pés High Cube (Modelada com materiais realistas)
    function buildContainer() {
        const containerGroup = new THREE.Group();

        const length = 9.0;
        const height = 2.6;
        const depth = 2.4;

        // Estrutura principal metálica (Pintura Grafite Industrial)
        const containerMat = new THREE.MeshStandardMaterial({
            color: 0x222826,
            roughness: 0.45,
            metalness: 0.7
        });

        // 1. Teto e Piso
        const roofGeo = new THREE.BoxGeometry(length, 0.15, depth);
        const roof = new THREE.Mesh(roofGeo, containerMat);
        roof.position.set(0, height, 0);
        roof.castShadow = true;
        roof.receiveShadow = true;
        containerGroup.add(roof);

        // Painéis Solares no teto (Apelo ecológico)
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x112244, roughness: 0.2, metalness: 0.8 });
        for (let i = -3; i <= 3; i += 1.8) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.8), solarMat);
            panel.position.set(i, height + 0.1, 0);
            containerGroup.add(panel);
        }

        const floorGeo = new THREE.BoxGeometry(length, 0.15, depth);
        const floor = new THREE.Mesh(floorGeo, containerMat);
        floor.position.set(0, 0.08, 0);
        floor.receiveShadow = true;
        containerGroup.add(floor);

        // 2. Paredes de Aço Frisadas (Ondulação característica do contêiner)
        // Parede de Trás (Sólida com frisos)
        const backWallGroup = new THREE.Group();
        const backBase = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.08), containerMat);
        backBase.position.set(0, height / 2, -depth / 2);
        backBase.castShadow = true;
        backWallGroup.add(backBase);

        // Frisos verticais
        for (let x = -length / 2 + 0.2; x < length / 2 - 0.2; x += 0.25) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, height, 0.05), containerMat);
            rib.position.set(x, height / 2, -depth / 2 - 0.03);
            backWallGroup.add(rib);
        }
        containerGroup.add(backWallGroup);

        // Paredes Laterais
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, depth), containerMat);
        leftWall.position.set(-length / 2, height / 2, 0);
        leftWall.castShadow = true;
        containerGroup.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, depth), containerMat);
        rightWall.position.set(length / 2, height / 2, 0);
        rightWall.castShadow = true;
        containerGroup.add(rightWall);

        // 3. Fachada Frontal de Vidro Panorâmico (Voltada para a represa/mata)
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x88ccdd,
            transmission: 0.88,
            opacity: 0.35,
            transparent: true,
            roughness: 0.05,
            ior: 1.5,
            reflectivity: 0.9
        });

        // Esquadrias pretas modernas
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });

        // Porta de vidro deslizante de ponta a ponta
        const glassPanel = new THREE.Mesh(new THREE.BoxGeometry(length * 0.75, height * 0.88, 0.04), glassMat);
        glassPanel.position.set(0.6, height / 2, depth / 2);
        containerGroup.add(glassPanel);

        // Molduras
        const topFrame = new THREE.Mesh(new THREE.BoxGeometry(length * 0.75, 0.08, 0.1), frameMat);
        topFrame.position.set(0.6, height * 0.94, depth / 2);
        containerGroup.add(topFrame);

        // Parede frontal fechada no canto da cozinha
        const frontSolid = new THREE.Mesh(new THREE.BoxGeometry(length * 0.25, height, 0.08), containerMat);
        frontSolid.position.set(-length / 2 + (length * 0.25) / 2, height / 2, depth / 2);
        containerGroup.add(frontSolid);

        // 4. Interior Aconchegante (Visível através dos vidros)
        // Piso de madeira nobre
        const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0xbf8b5e, roughness: 0.4 });
        const intFloor = new THREE.Mesh(new THREE.BoxGeometry(length - 0.2, 0.02, depth - 0.2), woodFloorMat);
        intFloor.position.set(0, 0.16, 0);
        containerGroup.add(intFloor);

        // Cama Queen no quarto panorâmico
        const bedGroup = new THREE.Group();
        const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.35, 1.6), mattressMat);
        mattress.position.set(0, 0.35, 0);

        const duvetMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.9 });
        const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.37, 1.62), duvetMat);
        duvet.position.set(-0.25, 0.35, 0);

        const headboardMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 });
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.7), headboardMat);
        headboard.position.set(0.95, 0.6, 0);

        bedGroup.add(mattress, duvet, headboard);
        bedGroup.position.set(length / 2 - 1.4, 0.15, -0.15);
        containerGroup.add(bedGroup);

        // Bancada da Cozinha Integrada
        const kitchenMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, roughness: 0.3 });
        const counter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.65), kitchenMat);
        counter.position.set(-length / 2 + 1.3, 0.55, -depth / 2 + 0.45);
        containerGroup.add(counter);

        scene.add(containerGroup);
    }

    // Deck de Madeira, Pérgola e Ofurô Aquecido
    function buildDeckAndOfuro() {
        const deckGroup = new THREE.Group();

        // Deck de Cumaru ripado
        const deckWoodMat = new THREE.MeshStandardMaterial({ color: 0x935b37, roughness: 0.6 });
        const deckWidth = 9.8;
        const deckDepth = 4.2;

        const deckBase = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 0.18, deckDepth), deckWoodMat);
        deckBase.position.set(0.4, 0.18, 3.2);
        deckBase.receiveShadow = true;
        deckBase.castShadow = true;
        deckGroup.add(deckBase);

        // Pérgola metálica no deck
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.4 });
        const postGeo = new THREE.BoxGeometry(0.1, 2.7, 0.1);

        const p1 = new THREE.Mesh(postGeo, metalMat);
        p1.position.set(-1.8, 1.35, 5.0);
        const p2 = new THREE.Mesh(postGeo, metalMat);
        p2.position.set(4.8, 1.35, 5.0);
        deckGroup.add(p1, p2);

        // Travessas da pérgola
        const beamGeo = new THREE.BoxGeometry(6.8, 0.08, 0.1);
        const beam = new THREE.Mesh(beamGeo, metalMat);
        beam.position.set(1.5, 2.7, 5.0);
        deckGroup.add(beam);

        // Ofurô de Madeira Circular com Água Iluminada
        const ofuroGroup = new THREE.Group();
        const tubMat = new THREE.MeshStandardMaterial({ color: 0x6e3c1b, roughness: 0.5 });
        const tubOuter = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.95, 0.85, 24), tubMat);
        tubOuter.position.y = 0.45;
        tubOuter.castShadow = true;

        // Água do ofurô
        const waterMat = new THREE.MeshPhysicalMaterial({
            color: 0x00bcd4,
            transmission: 0.7,
            opacity: 0.85,
            transparent: true,
            roughness: 0.1,
            reflectivity: 0.95
        });
        const water = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 24), waterMat);
        water.position.y = 0.78;

        ofuroGroup.add(tubOuter, water);
        ofuroGroup.position.set(2.8, 0.25, 3.2);
        deckGroup.add(ofuroGroup);

        // Cadeiras Acapulco no deck
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
        const chair1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), chairMat);
        chair1.position.set(-1.0, 0.45, 3.2);
        chair1.rotation.y = 0.4;
        chair1.castShadow = true;

        const chair2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), chairMat);
        chair2.position.set(-0.1, 0.45, 3.5);
        chair2.rotation.y = -0.3;
        chair2.castShadow = true;
        deckGroup.add(chair1, chair2);

        scene.add(deckGroup);
    }

    // Vegetação Nativa (Pinheiros, Araucárias e Arbustos da Mantiqueira)
    function buildTrees() {
        const treePositions = [
            [-7, -3], [-8, 2], [-6, 6], [8, -2], [9, 3], [7, 7],
            [-3, -6], [2, -7], [6, -5], [-9, -8], [10, -7]
        ];

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
        const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.8 });

        treePositions.forEach(([x, z]) => {
            const tree = new THREE.Group();
            const height = 3.5 + Math.random() * 2.0;

            // Tronco
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, height * 0.4, 8), trunkMat);
            trunk.position.y = (height * 0.4) / 2;
            trunk.castShadow = true;
            tree.add(trunk);

            // Copa em camadas (estilo conífera/pinheiro)
            for (let i = 0; i < 3; i++) {
                const cone = new THREE.Mesh(
                    new THREE.ConeGeometry(1.2 - i * 0.25, 1.4, 8),
                    foliageMat
                );
                cone.position.y = (height * 0.3) + i * 0.9;
                cone.castShadow = true;
                tree.add(cone);
            }

            tree.position.set(x, 0, z);
            scene.add(tree);
        });
    }

    // Hotspots Interativos (Esferas brilhantes com informações)
    function buildHotspots() {
        const hotspotData = [
            {
                id: 'ofuro',
                title: '♨️ Deck Panorâmico & Ofurô Aquecido',
                desc: 'Ofurô privativo sob pergolado, ideal para relaxar após explorar as cachoeiras de Piracaia e contemplar as estrelas.',
                pos: new THREE.Vector3(2.8, 1.2, 3.2)
            },
            {
                id: 'quarto',
                title: '🛏️ Quarto Panorâmico Integrado',
                desc: 'Cama Queen com enxoval de hotelaria, acordando com vista direta para a vegetação nativa e horizonte da serra.',
                pos: new THREE.Vector3(2.8, 1.5, 0.4)
            },
            {
                id: 'isolamento',
                title: '🛡️ Isolamento Termoacústico Naval',
                desc: 'Lã de rocha de alta espessura e ar condicionado inverter. Silêncio absoluto e temperatura agradável o ano todo.',
                pos: new THREE.Vector3(-1.8, 2.0, -1.2)
            },
            {
                id: 'sustentabilidade',
                title: '☀️ Energia Solar & Baixo Impacto',
                desc: 'Estrutura reaproveitada, painéis solares no teto e sistema sustentável que preserva a natureza local.',
                pos: new THREE.Vector3(0, 3.0, 0)
            }
        ];

        hotspotData.forEach(data => {
            const group = new THREE.Group();

            // Ponto central
            const sphereGeo = new THREE.SphereGeometry(0.16, 16, 16);
            const sphereMat = new THREE.MeshBasicMaterial({ color: 0x52b788 });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);

            // Anel pulsante externo
            const ringGeo = new THREE.RingGeometry(0.22, 0.28, 24);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.75
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;

            group.add(sphere, ring);
            group.position.copy(data.pos);
            group.userData = data;

            scene.add(group);
            clickableHotspots.push(group);
        });
    }

    // Clique no Canvas para Interagir com Hotspots
    function onCanvasClick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableHotspots, true);

        if (intersects.length > 0) {
            let root = intersects[0].object;
            while (root.parent && !root.userData.title) {
                root = root.parent;
            }
            if (root.userData.title) {
                showHotspotInfo(root.userData);
            }
        }
    }

    function showHotspotInfo(data) {
        const box = document.getElementById('hotspot-info-box');
        const title = document.getElementById('hotspot-title');
        const desc = document.getElementById('hotspot-desc');
        if (!box) return;

        title.textContent = data.title;
        desc.textContent = data.desc;
        box.classList.remove('hidden');
    }

    // Configuração dos Botões de Câmera e Dia/Noite
    function setupUIControls() {
        // Alternância Dia / Noite
        const toggleLightBtn = document.getElementById('toggle-light-btn');
        const lightModeText = document.getElementById('light-mode-text');

        if (toggleLightBtn) {
            toggleLightBtn.addEventListener('click', () => {
                isNight = !isNight;
                if (isNight) {
                    scene.background.setHex(0x0a1118);
                    scene.fog.color.setHex(0x0a1118);
                    ambientLight.intensity = 0.15;
                    dirLight.intensity = 0.2;
                    interiorLight.intensity = 2.8;
                    ofuroLight.intensity = 2.2;
                    lightModeText.textContent = 'Modo Diurno (Ensolarado)';
                } else {
                    scene.background.setHex(0xdce9e2);
                    scene.fog.color.setHex(0xdce9e2);
                    ambientLight.intensity = 0.65;
                    dirLight.intensity = 1.2;
                    interiorLight.intensity = 1.5;
                    ofuroLight.intensity = 1.2;
                    lightModeText.textContent = 'Modo Noturno (Aconchego)';
                }
            });
        }

        // Fechar Hotspot Info
        const closeBtn = document.getElementById('close-hotspot-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('hotspot-info-box').classList.add('hidden');
            });
        }

        // Resetar Câmera
        const resetBtn = document.getElementById('reset-cam-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                moveCameraTo(new THREE.Vector3(13, 7, 13), new THREE.Vector3(0, 1.2, 0));
            });
        }

        // Presets de Câmera
        const presetButtons = document.querySelectorAll('.cam-preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                presetButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const preset = btn.getAttribute('data-preset');
                switch (preset) {
                    case 'geral':
                        moveCameraTo(new THREE.Vector3(13, 7, 13), new THREE.Vector3(0, 1.2, 0));
                        break;
                    case 'deck':
                        moveCameraTo(new THREE.Vector3(5.5, 3.0, 6.8), new THREE.Vector3(2.5, 1.0, 3.2));
                        break;
                    case 'quarto':
                        moveCameraTo(new THREE.Vector3(4.2, 2.2, 2.4), new THREE.Vector3(2.5, 1.3, 0.4));
                        break;
                    case 'topo':
                        moveCameraTo(new THREE.Vector3(0.1, 15, 0.2), new THREE.Vector3(0, 0, 0));
                        break;
                }
            });
        });
    }

    function moveCameraTo(pos, lookAt) {
        targetCameraPos = pos;
        targetLookAt = lookAt;
    }

    function onWindowResize() {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Loop de Animação com suavização (lerp)
    function animate() {
        requestAnimationFrame(animate);

        // Suavização do movimento da câmera para presets
        if (targetCameraPos) {
            camera.position.lerp(targetCameraPos, 0.05);
            controls.target.lerp(targetLookAt, 0.05);
            if (camera.position.distanceTo(targetCameraPos) < 0.08) {
                targetCameraPos = null;
            }
        }

        // Pulsação suave dos anéis de hotspots
        const time = Date.now() * 0.003;
        clickableHotspots.forEach(hp => {
            const ring = hp.children[1];
            if (ring) {
                const s = 1 + Math.sin(time) * 0.15;
                ring.scale.set(s, s, s);
            }
        });

        controls.update();
        renderer.render(scene, camera);
    }

    // Inicialização segura
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

