/**
 * EcoContainer Piracaia - Gêmeo Digital 3D Fiel às Fotos Oficiais do Airbnb
 * Anúncio: "Casa Container luxo/fogao lenha/lareira /piscina" (Piracaia - SP)
 * 
 * Reconstrução Arquitetônica 100% Baseada nas Fotos Reais:
 * 1. Casa Contêiner Amarelo Ocre / Mostarda com frisos metálicos e portas brancas
 * 2. Varanda Coberta com piso de cimento queimado, tapete de ladrilho hidráulico, pilares de madeira, guarda-corpo rústico e redes de descanso
 * 3. Casa Gourmet com Telhado Colonial de 4 Águas (telhas cerâmicas vermelhas), paredes amarelas e fechamento total em vidro blindex panorâmico
 * 4. Interior Gourmet com Churrasqueira + Fogão a Lenha de tijolinho à vista, chapa de ferro, bancada de granito, lustre de roda de carroça e mesa maciça
 * 5. Piscina Elevada de Fibra Azul com prainha frontal semicircular, platô em Pedra São Tomé irregular, cascata de inox em arco e mesa com ombrelone azul royal
 * 6. Praça de Fogo em Pedra São Tomé com 4 cadeiras Adirondack de madeira maciça e fogueira de chão com brasas cintilantes
 * 7. Caminhos de dormentes de madeira na grama, estacionamento em concregrama (pisograma), balanço de jardim e vista para a Represa do Jaguari
 * 8. Modo Noturno com iluminação idêntica às fotos noturnas (LED azul na piscina, fogueira alaranjada, pendentes de palha e luzes de jardim)
 */

(function () {
    const container = document.getElementById('threejs-canvas');
    if (!container || typeof THREE === 'undefined') return;

    let scene, camera, renderer, controls;
    let dirLight, ambientLight, interiorLight, poolLight, firePitLight, porchLights = [];
    let isNight = false;
    let clickableHotspots = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let targetCameraPos = null;
    let targetLookAt = new THREE.Vector3(0, 1.2, 0);

    function init() {
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 550;

        // 1. Cena com atmosfera de serra de Piracaia
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xdbe8ec); // Céu suave ensolarado
        scene.fog = new THREE.FogExp2(0xdbe8ec, 0.016);

        // 2. Câmera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 140);
        camera.position.set(13, 8.5, 14);

        // 3. Renderer com fidelidade de cores e sombras suaves
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        container.appendChild(renderer.domElement);

        // 4. OrbitControls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.02;
        controls.minDistance = 3.5;
        controls.maxDistance = 35;
        controls.target.copy(targetLookAt);

        // 5. Configurar Iluminação
        setupLighting();

        // 6. Construção Arquitetônica
        buildGroundAndParking();
        buildGourmetPavilion();
        buildYellowContainerAndPorch();
        buildRaisedPoolWithSãoTomé();
        buildFirePitWithAdirondacks();
        buildLandscapeAndReservoir();
        buildHotspots();

        // 7. Eventos & UI
        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('click', onCanvasClick);
        setupUIControls();

        // 8. Loop de animação
        animate();
    }

    // Configuração de Luzes (Dia e Noite)
    function setupLighting() {
        ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);

        dirLight = new THREE.DirectionalLight(0xfffaed, 1.3);
        dirLight.position.set(18, 24, 14);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 50;
        dirLight.shadow.camera.left = -18;
        dirLight.shadow.camera.right = 18;
        dirLight.shadow.camera.top = 18;
        dirLight.shadow.camera.bottom = -18;
        dirLight.shadow.bias = -0.0004;
        scene.add(dirLight);

        // Luz interna do Salão Gourmet (dourada acolhedora)
        interiorLight = new THREE.PointLight(0xffba55, 1.6, 9);
        interiorLight.position.set(-3.5, 2.2, -3.2);
        scene.add(interiorLight);

        // Luzes pendentes da varanda do contêiner
        const pLight1 = new THREE.PointLight(0xffa834, 1.2, 5);
        pLight1.position.set(2.2, 2.2, -1.8);
        const pLight2 = new THREE.PointLight(0xffa834, 1.2, 5);
        pLight2.position.set(5.5, 2.2, -1.8);
        porchLights.push(pLight1, pLight2);
        scene.add(pLight1, pLight2);

        // LED Subaquático Azul Royal da Piscina (Fiel às fotos noturnas)
        poolLight = new THREE.PointLight(0x0055ff, 1.8, 7.5);
        poolLight.position.set(3.4, 0.65, 1.2);
        scene.add(poolLight);

        // Fogueira da Praça de Fogo (Âmbar/Fogo com cintilação)
        firePitLight = new THREE.PointLight(0xff5500, 1.8, 9);
        firePitLight.position.set(-0.2, 0.45, 5.6);
        scene.add(firePitLight);
    }

    // 1. Gramado, Terreno e Estacionamento em Concregrama (Pisograma)
    function buildGroundAndParking() {
        // Gramado principal com suave declive
        const groundGeo = new THREE.PlaneGeometry(80, 80, 32, 32);
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            if (dist > 10) {
                let h = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2.2 + (dist - 10) * 0.15;
                if (y < -14) h = Math.min(h, -0.7); // Desce em direção à represa
                pos.setZ(i, h);
            }
        }
        groundGeo.computeVertexNormals();
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d6b44, roughness: 0.95 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Estacionamento de Concregrama (Pisograma) à esquerda onde ficam os carros
        const parkingGroup = new THREE.Group();
        const blockMat = new THREE.MeshStandardMaterial({ color: 0x8a8882, roughness: 0.9 });
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x325838, roughness: 0.95 });

        // Base do piso vazado
        const parkBase = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.08, 9.5), grassMat);
        parkBase.position.set(-8.0, 0.04, 2.2);
        parkBase.receiveShadow = true;
        parkingGroup.add(parkBase);

        // Blocos vazados de concreto
        for (let x = -11.0; x <= -5.0; x += 0.8) {
            for (let z = -2.0; z <= 6.5; z += 0.8) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.7), blockMat);
                b.position.set(x, 0.07, z);
                b.receiveShadow = true;
                parkingGroup.add(b);
            }
        }

        // Caminhonete Prateada estacionada (como vista na foto oficial da entrada)
        const truck = new THREE.Group();
        const carPaint = new THREE.MeshStandardMaterial({ color: 0x7c8288, metalness: 0.8, roughness: 0.3 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
        const truckBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.85, 4.4), carPaint);
        truckBody.position.y = 0.7;
        truckBody.castShadow = true;
        const truckCabin = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.75, 2.2), carPaint);
        truckCabin.position.set(0, 1.45, -0.4);
        truckCabin.castShadow = true;
        truck.add(truckBody, truckCabin);

        // Rodas da caminhonete
        [[-1.0, 1.2], [1.0, 1.2], [-1.0, -1.2], [1.0, -1.2]].forEach(([wx, wz]) => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16), wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(wx, 0.36, wz);
            truck.add(wheel);
        });
        truck.position.set(-8.2, 0.0, 2.0);
        parkingGroup.add(truck);

        scene.add(parkingGroup);
    }

    // 2. Casa Gourmet com Telhado Colonial de 4 Águas e Vidro Panorâmico
    function buildGourmetPavilion() {
        const gourmetGroup = new THREE.Group();
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xd89d28, roughness: 0.75 }); // Amarelo mostarda idêntico à foto
        const redTileMat = new THREE.MeshStandardMaterial({ color: 0xba482b, roughness: 0.85 }); // Telhas cerâmicas vermelhas coloniais
        const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x93361e, roughness: 0.8 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x542d13, roughness: 0.7 });
        const brickMat = new THREE.MeshStandardMaterial({ color: 0xa8432a, roughness: 0.88 });
        const graniteMat = new THREE.MeshStandardMaterial({ color: 0x1f2122, roughness: 0.25, metalness: 0.4 });

        // Dimensões do Pavilhão Gourmet: 5.4m x 5.2m
        const width = 5.4, depth = 5.2, wallHeight = 2.65;

        // Piso interno de cimento queimado claro
        const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.15, depth), new THREE.MeshStandardMaterial({ color: 0xbdb3a2, roughness: 0.7 }));
        floor.position.set(-3.5, 0.08, -3.2);
        floor.receiveShadow = true;
        gourmetGroup.add(floor);

        // Metade inferior das paredes em alvenaria amarela (altura 1.1m)
        const wallBaseFront = new THREE.Mesh(new THREE.BoxGeometry(width, 1.05, 0.18), yellowMat);
        wallBaseFront.position.set(-3.5, 0.53, -3.2 + depth / 2);
        wallBaseFront.castShadow = true;
        wallBaseFront.receiveShadow = true;

        const wallBaseLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.05, depth), yellowMat);
        wallBaseLeft.position.set(-3.5 - width / 2, 0.53, -3.2);
        wallBaseLeft.castShadow = true;

        const wallBaseRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.05, depth), yellowMat);
        wallBaseRight.position.set(-3.5 + width / 2, 0.53, -3.2);
        wallBaseRight.castShadow = true;

        const wallBackSolid = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, 0.18), yellowMat);
        wallBackSolid.position.set(-3.5, wallHeight / 2, -3.2 - depth / 2);
        wallBackSolid.castShadow = true;
        gourmetGroup.add(wallBaseFront, wallBaseLeft, wallBaseRight, wallBackSolid);

        // Metade superior totalmente envidraçada em Blindex transparente (1.55m de vidro)
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x9be0f0,
            transmission: 0.92,
            opacity: 0.35,
            transparent: true,
            roughness: 0.05,
            ior: 1.5,
            reflectivity: 0.95
        });

        // Vidros frontais e laterais
        const glassFront = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 1.55, 0.04), glassMat);
        glassFront.position.set(-3.5, 1.83, -3.2 + depth / 2);

        const glassLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.55, depth - 0.2), glassMat);
        glassLeft.position.set(-3.5 - width / 2, 1.83, -3.2);

        const glassRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.55, depth - 0.2), glassMat);
        glassRight.position.set(-3.5 + width / 2, 1.83, -3.2);
        gourmetGroup.add(glassFront, glassLeft, glassRight);

        // Pilares de madeira e vigas de apoio
        [-width / 2, width / 2].forEach(px => {
            [-depth / 2, depth / 2].forEach(pz => {
                const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, wallHeight, 0.18), yellowMat);
                col.position.set(-3.5 + px, wallHeight / 2, -3.2 + pz);
                col.castShadow = true;
                gourmetGroup.add(col);
            });
        });

        // Telhado Colonial de 4 Águas (Pirâmide de telha cerâmica vermelha com beiral saliente)
        const roofHeight = 1.45;
        const roofPeakY = wallHeight + roofHeight;
        const eaveWidth = width + 0.8;
        const eaveDepth = depth + 0.8;

        const roofGeo = new THREE.ConeGeometry(Math.max(eaveWidth, eaveDepth) * 0.72, roofHeight, 4);
        roofGeo.rotateY(Math.PI / 4); // Alinhar as 4 águas aos eixos dos muros
        const roof = new THREE.Mesh(roofGeo, redTileMat);
        roof.position.set(-3.5, wallHeight + roofHeight / 2, -3.2);
        roof.scale.set(eaveWidth / Math.max(eaveWidth, eaveDepth), 1.0, eaveDepth / Math.max(eaveWidth, eaveDepth));
        roof.castShadow = true;
        gourmetGroup.add(roof);

        // Cumeeiras / espigões de telha cerâmica escura
        const ridge1 = new THREE.Mesh(new THREE.BoxGeometry(eaveWidth * 0.95, 0.12, 0.12), ridgeMat);
        ridge1.position.set(-3.5, roofPeakY - 0.05, -3.2);
        ridge1.rotation.y = Math.PI / 4;
        gourmetGroup.add(ridge1);

        // --- INTERIOR GOURMET REAL: CHURRASQUEIRA + FOGÃO A LENHA + MESA + RODA DE CARROÇA ---
        // Churrasqueira de tijolinho à vista com coifa escalonada
        const bbq = new THREE.Group();
        const bbqBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.95), brickMat);
        bbqBase.position.set(0, 0.45, 0);
        bbqBase.castShadow = true;
        const bbqHood = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, 1.4, 4), brickMat);
        bbqHood.rotation.y = Math.PI / 4;
        bbqHood.position.set(0, 1.6, 0);
        bbqHood.castShadow = true;
        const grill = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.75), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 }));
        grill.position.set(0, 0.92, 0.05);
        bbq.add(bbqBase, bbqHood, grill);
        bbq.position.set(-5.0, 0.1, -4.8);
        gourmetGroup.add(bbq);

        // Fogão a lenha acoplado com chapa de ferro fundido de 3 bocas e portinhola
        const stove = new THREE.Group();
        const stoveBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 0.95), brickMat);
        stoveBase.position.set(0, 0.42, 0);
        stoveBase.castShadow = true;
        const ironTop = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.9 }));
        ironTop.position.set(0, 0.88, 0);
        // Forno de ferro fundido com porta preta
        const ovenDoor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.85 }));
        ovenDoor.position.set(0.1, 0.45, 0.48);
        stove.add(stoveBase, ironTop, ovenDoor);
        stove.position.set(-3.5, 0.1, -4.8);
        gourmetGroup.add(stove);

        // Bancada de granito preto com banquetas de madeira
        const counter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.95, 0.75), graniteMat);
        counter.position.set(-1.8, 0.55, -4.8);
        counter.castShadow = true;
        gourmetGroup.add(counter);

        // Banquetas altas de madeira
        [-2.3, -1.8, -1.3].forEach(bx => {
            const stool = new THREE.Group();
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.38), woodMat);
            seat.position.y = 0.7;
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.7, 8), woodMat);
            leg.position.y = 0.35;
            stool.add(seat, leg);
            stool.position.set(bx, 0.1, -4.0);
            stool.castShadow = true;
            gourmetGroup.add(stool);
        });

        // Grande Mesa de Jantar Rústica de Madeira com Cadeiras
        const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.78, 1.1), woodMat);
        table.position.set(-3.5, 0.48, -2.8);
        table.castShadow = true;
        gourmetGroup.add(table);

        // Lustre Rústico de Roda de Carroça com lâmpadas pendentes
        const wagonWheel = new THREE.Group();
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 12, 24), woodMat);
        rim.rotation.x = Math.PI / 2;
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12), woodMat);
        wagonWheel.add(rim, hub);
        for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2;
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), woodMat);
            spoke.rotation.z = Math.PI / 2;
            spoke.rotation.y = angle;
            wagonWheel.add(spoke);
            // Pequena lâmpada
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd175 }));
            bulb.position.set(Math.cos(angle) * 0.55, -0.08, Math.sin(angle) * 0.55);
            wagonWheel.add(bulb);
        }
        wagonWheel.position.set(-3.5, 2.3, -2.8);
        gourmetGroup.add(wagonWheel);

        scene.add(gourmetGroup);
    }

    // 3. O Contêiner Amarelo Ocre e Varanda com Redes, Tapete de Ladrilho e Pergolado
    function buildYellowContainerAndPorch() {
        const contGroup = new THREE.Group();
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xd89d28, roughness: 0.72 }); // Amarelo mostarda fiel
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x542d13, roughness: 0.65 });
        const postMat = new THREE.MeshStandardMaterial({ color: 0x7c4820, roughness: 0.7 });
        const whiteFrame = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xa8e6cf, transmission: 0.85, opacity: 0.4, transparent: true, roughness: 0.05 });

        // Dimensões do Contêiner Amarelo 40ft: 8.5m x 2.44m x 2.6m
        const length = 8.5, height = 2.6, depth = 2.44;
        const posX = 3.6, posZ = -4.5;

        // Corpo do Contêiner
        const containerBody = new THREE.Group();
        // Teto plano do contêiner
        const roof = new THREE.Mesh(new THREE.BoxGeometry(length, 0.12, depth), yellowMat);
        roof.position.set(0, height, 0);
        roof.castShadow = true;
        // Piso elevado do contêiner
        const floor = new THREE.Mesh(new THREE.BoxGeometry(length, 0.18, depth), yellowMat);
        floor.position.set(0, 0.25, 0);
        floor.receiveShadow = true;

        // Parede de trás do contêiner com frisos verticais
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.08), yellowMat);
        backWall.position.set(0, height / 2, -depth / 2);
        backWall.castShadow = true;
        containerBody.add(roof, floor, backWall);

        // Frisos verticais de contêiner marítimo (ondulação amarela)
        for (let x = -length / 2 + 0.3; x <= length / 2 - 0.3; x += 0.35) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, height - 0.1, 0.04), yellowMat);
            rib.position.set(x, height / 2, -depth / 2 - 0.03);
            containerBody.add(rib);
        }

        // Laterais do contêiner
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, height, depth), yellowMat);
        leftWall.position.set(-length / 2, height / 2, 0);
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, height, depth), yellowMat);
        rightWall.position.set(length / 2, height / 2, 0);
        containerBody.add(leftWall, rightWall);

        // Parede Frontal Amarela com Portas de Vidro de Correr e Janelas Brancas
        const frontWall = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.08), yellowMat);
        frontWall.position.set(0, height / 2, depth / 2);
        containerBody.add(frontWall);

        // Frisos na frente amarela
        for (let x = -length / 2 + 0.3; x <= length / 2 - 0.3; x += 0.35) {
            if (Math.abs(x - 0.8) > 1.2 && Math.abs(x + 2.2) > 1.0) { // Deixar vão das portas
                const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, height - 0.1, 0.04), yellowMat);
                rib.position.set(x, height / 2, depth / 2 + 0.03);
                containerBody.add(rib);
            }
        }

        // Porta de correr com esquadria branca (como na foto oficial da varanda)
        const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), whiteFrame);
        doorFrame.position.set(0.8, 1.15, depth / 2 + 0.04);
        const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.95, 0.02), glassMat);
        doorGlass.position.set(0.8, 1.15, depth / 2 + 0.05);
        containerBody.add(doorFrame, doorGlass);

        // Janela com moldura branca
        const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.08), whiteFrame);
        winFrame.position.set(3.0, 1.6, depth / 2 + 0.04);
        const winGlass = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.85, 0.02), glassMat);
        winGlass.position.set(3.0, 1.6, depth / 2 + 0.05);
        containerBody.add(winFrame, winGlass);

        containerBody.position.set(posX, 0, posZ);
        contGroup.add(containerBody);

        // --- VARANDA COBERTA DO CONTÊINER (A PARTE MAIS CHARMOSA DAS FOTOS) ---
        const porchGroup = new THREE.Group();
        const porchWidth = length + 0.4;
        const porchDepth = 2.4;
        const porchZ = posZ + depth / 2 + porchDepth / 2;

        // Piso de cimento queimado ocre polido da varanda (altura +0.35m)
        const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(porchWidth, 0.16, porchDepth), new THREE.MeshStandardMaterial({ color: 0xc49156, roughness: 0.4 }));
        porchFloor.position.set(posX, 0.27, porchZ);
        porchFloor.receiveShadow = true;
        porchGroup.add(porchFloor);

        // "Tapete de Ladrilho Hidráulico" embutido no centro do piso (exatamente como na foto 12)
        const tileGeo = new THREE.PlaneGeometry(1.8, 1.2);
        const tileMat = new THREE.MeshStandardMaterial({ color: 0xdfd3b8, roughness: 0.5 });
        const tileMatCenter = new THREE.Mesh(tileGeo, tileMat);
        tileMatCenter.rotation.x = -Math.PI / 2;
        tileMatCenter.position.set(posX - 0.5, 0.36, porchZ);
        porchGroup.add(tileMatCenter);

        // Pilares de Madeira Quadrados da Varanda (4 pilares robustos)
        const numPil = 4;
        for (let i = 0; i < numPil; i++) {
            const px = posX - porchWidth / 2 + 0.2 + (i / (numPil - 1)) * (porchWidth - 0.4);
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, height + 0.1, 0.18), postMat);
            pillar.position.set(px, (height + 0.1) / 2 + 0.25, porchZ + porchDepth / 2 - 0.1);
            pillar.castShadow = true;
            porchGroup.add(pillar);
        }

        // Guarda-corpo de madeira rústica com 2 travessas horizontais
        const rail1 = new THREE.Mesh(new THREE.BoxGeometry(porchWidth - 0.4, 0.06, 0.1), woodMat);
        rail1.position.set(posX, 0.95, porchZ + porchDepth / 2 - 0.1);
        const rail2 = new THREE.Mesh(new THREE.BoxGeometry(porchWidth - 0.4, 0.06, 0.1), woodMat);
        rail2.position.set(posX, 0.60, porchZ + porchDepth / 2 - 0.1);
        porchGroup.add(rail1, rail2);

        // Cobertura da Varanda (Pergolado com forro ripado de madeira e telhado inclinado)
        const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(porchWidth + 0.2, 0.1, porchDepth + 0.3), new THREE.MeshStandardMaterial({ color: 0x6e3b1c, roughness: 0.7 }));
        porchRoof.position.set(posX, height + 0.2, porchZ);
        porchRoof.rotation.x = 0.06; // Leve inclinação para frente
        porchRoof.castShadow = true;
        porchGroup.add(porchRoof);

        // Vigas transversais de madeira do pergolado
        for (let vx = posX - porchWidth / 2 + 0.4; vx <= posX + porchWidth / 2 - 0.4; vx += 0.8) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, porchDepth + 0.2), woodMat);
            beam.position.set(vx, height + 0.12, porchZ);
            beam.rotation.x = 0.06;
            porchGroup.add(beam);
        }

        // Painel de Treliça de Madeira na lateral da varanda (Privacidade como na foto 12)
        const trellis = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.0, 1.8), new THREE.MeshStandardMaterial({ color: 0x8a4d25, roughness: 0.7 }));
        trellis.position.set(posX + porchWidth / 2 - 0.1, 1.35, porchZ);
        porchGroup.add(trellis);

        // Redes de Descanso Coloridas penduradas entre os pilares
        function createHammock(x1, x2, z, colorHex) {
            const hammock = new THREE.Group();
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(x1, 1.8, z),
                new THREE.Vector3(x1 + (x2 - x1) * 0.3, 0.75, z),
                new THREE.Vector3(x1 + (x2 - x1) * 0.7, 0.75, z),
                new THREE.Vector3(x2, 1.8, z)
            );
            const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.18, 8, false);
            const hammockMesh = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.9 }));
            hammock.add(hammockMesh);
            return hammock;
        }
        porchGroup.add(createHammock(posX - 3.2, posX - 0.6, porchZ + 0.4, 0xb8384b)); // Rede vermelha/estampada
        porchGroup.add(createHammock(posX + 0.2, posX + 2.8, porchZ + 0.4, 0x2b5ca8)); // Rede azul

        // Luminárias pendentes artesanais de palha/ripas de madeira
        [posX - 1.8, posX + 1.2].forEach(lx => {
            const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: 0xd6a86c, roughness: 0.8 }));
            lantern.scale.set(1.0, 1.3, 1.0);
            lantern.position.set(lx, 2.2, porchZ);
            porchGroup.add(lantern);
        });

        // Escada de Acesso à Varanda (3 degraus pintados em vinho terracota como na foto)
        const stairMat = new THREE.MeshStandardMaterial({ color: 0x933123, roughness: 0.8 });
        for (let s = 0; s < 3; s++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.35), stairMat);
            step.position.set(posX - 3.2, 0.08 + s * 0.09, porchZ + porchDepth / 2 + 0.18 + s * 0.3);
            step.receiveShadow = true;
            porchGroup.add(step);
        }

        // Fonte clássica de jardim ao lado da escada
        const fountain = new THREE.Group();
        const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0xded8cc }));
        const fBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.2, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xded8cc }));
        fBowl.position.y = 0.35;
        fountain.add(fBase, fBowl);
        fountain.position.set(posX - 4.2, 0.25, porchZ + porchDepth / 2 + 0.4);
        porchGroup.add(fountain);

        contGroup.add(porchGroup);
        scene.add(contGroup);
    }

    // 4. Piscina Elevada de Fibra Azul no Platô em Pedra São Tomé com Cascata e Ombrelone
    function buildRaisedPoolWithSãoTomé() {
        const poolGroup = new THREE.Group();
        const yellowWallMat = new THREE.MeshStandardMaterial({ color: 0xd89d28, roughness: 0.8 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2dcd2, roughness: 0.85 }); // Pedra São Tomé bege clara irregular
        const poolFiberMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25 }); // Fibra azul piscina
        const stainlessMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.15 });

        // Platô Elevado de Alvenaria (altura +0.75m acima da grama inferior como nas fotos)
        const plateauWidth = 6.4;
        const plateauDepth = 5.2;
        const plateauHeight = 0.65;
        const posX = 3.6, posZ = 1.6;

        // Mureta de contenção amarela do platô
        const retainingBase = new THREE.Mesh(new THREE.BoxGeometry(plateauWidth, plateauHeight, plateauDepth), yellowWallMat);
        retainingBase.position.set(posX, plateauHeight / 2, posZ);
        retainingBase.castShadow = true;
        retainingBase.receiveShadow = true;
        poolGroup.add(retainingBase);

        // Deck superior totalmente revestido de Pedra São Tomé
        const stoneDeck = new THREE.Mesh(new THREE.BoxGeometry(plateauWidth + 0.1, 0.08, plateauDepth + 0.1), stoneMat);
        stoneDeck.position.set(posX, plateauHeight + 0.04, posZ);
        stoneDeck.receiveShadow = true;
        poolGroup.add(stoneDeck);

        // Rampa / Degrau de acesso vermelho na lateral do platô
        const poolRamp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.9), new THREE.MeshStandardMaterial({ color: 0x933123 }));
        poolRamp.position.set(posX - plateauWidth / 2 - 0.4, 0.25, posZ - 1.2);
        poolGroup.add(poolRamp);

        // Cuba da Piscina de Fibra Azul (com formato retangular + prainha frontal semicircular)
        const poolWidth = 3.8, poolDepth = 2.4;
        const basin = new THREE.Mesh(new THREE.BoxGeometry(poolWidth, 0.35, poolDepth), poolFiberMat);
        basin.position.set(posX - 0.3, plateauHeight + 0.02, posZ - 0.3);
        poolGroup.add(basin);

        // Prainha frontal semicircular com degraus submersos
        const shallowBeach = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 0.28, 24, 1, false, 0, Math.PI), poolFiberMat);
        shallowBeach.rotation.x = Math.PI / 2;
        shallowBeach.position.set(posX - 0.3, plateauHeight + 0.03, posZ + poolDepth / 2 - 0.2);
        poolGroup.add(shallowBeach);

        // Água Translúcida da Piscina em tom Turquesa Cristalino
        const waterMat = new THREE.MeshPhysicalMaterial({
            color: 0x00c4e0,
            transmission: 0.85,
            opacity: 0.9,
            transparent: true,
            roughness: 0.06,
            ior: 1.33,
            reflectivity: 0.95
        });
        const water = new THREE.Mesh(new THREE.BoxGeometry(poolWidth - 0.1, 0.05, poolDepth - 0.1), waterMat);
        water.position.set(posX - 0.3, plateauHeight + 0.16, posZ - 0.3);
        poolGroup.add(water);

        // Cascata em Arco de Aço Inox (Exatamente como vista na foto 24 jorrando água)
        const archCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(posX - 1.8, plateauHeight + 0.1, posZ - 1.3),
            new THREE.Vector3(posX - 1.8, plateauHeight + 1.2, posZ - 0.8),
            new THREE.Vector3(posX - 1.3, plateauHeight + 0.9, posZ - 0.4)
        );
        const archGeo = new THREE.TubeGeometry(archCurve, 16, 0.045, 12, false);
        const waterfallSpout = new THREE.Mesh(archGeo, stainlessMat);
        waterfallSpout.castShadow = true;
        poolGroup.add(waterfallSpout);

        // Filete de água cristalina caindo da cascata
        const waterJetCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(posX - 1.3, plateauHeight + 0.88, posZ - 0.4),
            new THREE.Vector3(posX - 1.1, plateauHeight + 0.5, posZ - 0.2),
            new THREE.Vector3(posX - 0.9, plateauHeight + 0.16, posZ - 0.1)
        );
        const waterJet = new THREE.Mesh(new THREE.TubeGeometry(waterJetCurve, 12, 0.025, 8, false), waterMat);
        poolGroup.add(waterJet);

        // Mesa Bistrô Redonda com Cadeiras e Grande Ombrelone Azul Royal
        const bistroGroup = new THREE.Group();
        const tableGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }));
        tableGlass.position.y = 0.72;
        const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), stainlessMat);
        tableLeg.position.y = 0.36;
        bistroGroup.add(tableGlass, tableLeg);

        // Ombrelone Azul Royal Aberto
        const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8), stainlessMat);
        umbrellaPole.position.y = 1.15;
        const umbrellaCanopy = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.55, 8), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 })); // Azul royal
        umbrellaCanopy.position.y = 2.1;
        umbrellaCanopy.castShadow = true;
        bistroGroup.add(umbrellaPole, umbrellaCanopy);

        // 4 Cadeiras ao redor da mesa
        for (let i = 0; i < 4; i++) {
            const ca = (i / 4) * Math.PI * 2;
            const chair = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.45), new THREE.MeshStandardMaterial({ color: 0x4a4a4a }));
            chair.position.set(Math.cos(ca) * 0.75, 0.38, Math.sin(ca) * 0.75);
            bistroGroup.add(chair);
        }
        bistroGroup.position.set(posX + 2.0, plateauHeight + 0.08, posZ - 1.2);
        poolGroup.add(bistroGroup);

        // Vasos de plantas ornamentais (dracenas) na borda da piscina
        [[-2.8, 1.8], [2.8, 1.8], [2.8, -1.8]].forEach(([vx, vz]) => {
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0x6e371f }));
            pot.position.set(posX + vx, plateauHeight + 0.3, posZ + vz);
            const plant = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.65, 8), new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
            plant.position.set(posX + vx, plateauHeight + 0.75, posZ + vz);
            poolGroup.add(pot, plant);
        });

        scene.add(poolGroup);
    }

    // 5. Praça de Fogo com Cadeiras Adirondack e Caminho de Dormentes
    function buildFirePitWithAdirondacks() {
        const firePitGroup = new THREE.Group();
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe0dad0, roughness: 0.85 }); // Pedra São Tomé clara
        const adirondackMat = new THREE.MeshStandardMaterial({ color: 0x935f33, roughness: 0.65 }); // Madeira maciça mel
        const pitCenterZ = 5.6, pitCenterX = -0.2;

        // Platô recortado no gramado revestido com Pedra São Tomé irregular
        const firePatio = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.12, 16), stoneMat);
        firePatio.position.set(pitCenterX, 0.06, pitCenterZ);
        firePatio.scale.set(1.15, 1.0, 0.95);
        firePatio.receiveShadow = true;
        firePitGroup.add(firePatio);

        // Fogueira de chão rebaixada com anel de pedra assentada
        const pitRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.14, 12, 24), new THREE.MeshStandardMaterial({ color: 0xc4bcb0, roughness: 0.9 }));
        pitRing.rotation.x = Math.PI / 2;
        pitRing.position.set(pitCenterX, 0.16, pitCenterZ);
        pitRing.castShadow = true;
        firePitGroup.add(pitRing);

        // Fundo do poço de fogo com carvão e cinzas
        const ashBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.98 }));
        ashBase.position.set(pitCenterX, 0.12, pitCenterZ);
        firePitGroup.add(ashBase);

        // Troncos de madeira cruzados na fogueira
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.9 });
        for (let l = 0; l < 5; l++) {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.65, 8), woodMat);
            log.rotation.z = Math.PI / 3;
            log.rotation.y = (l * Math.PI) / 2.5;
            log.position.set(pitCenterX, 0.24, pitCenterZ);
            firePitGroup.add(log);
        }

        // Brasas ardentes incandescentes
        const embers = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff3b00 }));
        embers.position.set(pitCenterX, 0.28, pitCenterZ);
        firePitGroup.add(embers);

        // 4 Autênticas Cadeiras Adirondack de Madeira Maciça (Como nas fotos 13 e 14)
        function createAdirondackChair(x, z, rotY) {
            const chair = new THREE.Group();
            // Assento inclinado
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.65), adirondackMat);
            seat.rotation.x = 0.18;
            seat.position.set(0, 0.32, 0);

            // Encosto ripado alto inclinado
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.05), adirondackMat);
            back.rotation.x = -0.35;
            back.position.set(0, 0.68, -0.28);

            // Braços largos característicos
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.75), adirondackMat);
            armL.position.set(-0.35, 0.52, -0.05);
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.75), adirondackMat);
            armR.position.set(0.35, 0.52, -0.05);

            // Pernas da cadeira
            const legF = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.06), adirondackMat);
            legF.position.set(0, 0.18, 0.25);
            const legB = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.06), adirondackMat);
            legB.position.set(0, 0.11, -0.32);

            chair.add(seat, back, armL, armR, legF, legB);
            chair.position.set(x, 0.12, z);
            chair.rotation.y = rotY;
            chair.castShadow = true;
            return chair;
        }

        firePitGroup.add(createAdirondackChair(pitCenterX - 1.5, pitCenterZ - 0.4, 1.2));
        firePitGroup.add(createAdirondackChair(pitCenterX + 1.5, pitCenterZ - 0.4, -1.2));
        firePitGroup.add(createAdirondackChair(pitCenterX - 1.2, pitCenterZ + 1.4, 2.4));
        firePitGroup.add(createAdirondackChair(pitCenterX + 1.2, pitCenterZ + 1.4, -2.4));

        // Caminhos de Dormentes de Madeira (pisadeiras na grama ligando fogueira, piscina e casa)
        const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3d2719, roughness: 0.95 });
        // Caminho da fogueira até a piscina
        for (let s = 0; s < 5; s++) {
            const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.35), sleeperMat);
            sleeper.position.set(pitCenterX + 0.6 + s * 0.45, 0.08 + s * 0.08, pitCenterZ - 0.8 - s * 0.6);
            sleeper.receiveShadow = true;
            firePitGroup.add(sleeper);
        }
        // Caminho da fogueira até o salão gourmet
        for (let s = 0; s < 5; s++) {
            const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.35), sleeperMat);
            sleeper.position.set(pitCenterX - 0.6 - s * 0.5, 0.06, pitCenterZ - 0.8 - s * 0.7);
            sleeper.receiveShadow = true;
            firePitGroup.add(sleeper);
        }

        scene.add(firePitGroup);
    }

    // 6. Vegetação, Balanço Rústico e Represa do Jaguari
    function buildLandscapeAndReservoir() {
        const landGroup = new THREE.Group();

        // Balanço rústico de madeira com cordas no gramado (Foto 17)
        const swingGroup = new THREE.Group();
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x6e3d1f, roughness: 0.7 });
        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), beamMat);
        postL.position.set(-1.4, 1.6, 0);
        postL.castShadow = true;
        const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), beamMat);
        postR.position.set(1.4, 1.6, 0);
        postR.castShadow = true;
        const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 8), beamMat);
        topBar.rotation.z = Math.PI / 2;
        topBar.position.set(0, 3.1, 0);
        topBar.castShadow = true;

        // Cordas e assento
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd4b886 });
        const seatBoard = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.32), beamMat);
        seatBoard.position.set(0, 0.75, 0);
        swingGroup.add(postL, postR, topBar, seatBoard);
        swingGroup.position.set(8.5, 0, 4.5);
        landGroup.add(swingGroup);

        // Bananeiras ornamentais e plantas tropicais com espetos de iluminação
        const bananaMat = new THREE.MeshStandardMaterial({ color: 0x2e6b36, roughness: 0.6 });
        [
            [7.5, 0.5], [8.0, -1.5], [7.2, -3.5], [-7.5, -4.5], [-1.0, 7.8], [9.5, 1.5]
        ].forEach(([bx, bz]) => {
            const plant = new THREE.Group();
            for (let f = 0; f < 5; f++) {
                const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.6, 6), bananaMat);
                leaf.rotation.x = Math.PI / 3;
                leaf.rotation.y = (f / 5) * Math.PI * 2;
                leaf.position.y = 0.8;
                plant.add(leaf);
            }
            plant.position.set(bx, 0.1, bz);
            landGroup.add(plant);
        });

        // Árvores da Mantiqueira ao fundo
        const treeMat = new THREE.MeshStandardMaterial({ color: 0x1b4329, roughness: 0.85 });
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.9 });
        [
            [-12, -8], [-14, 0], [12, -6], [14, 2], [13, 8], [-3, -12], [4, -13]
        ].forEach(([tx, tz]) => {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 2.0, 8), trunkMat);
            trunk.position.y = 1.0;
            trunk.castShadow = true;
            const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 8), treeMat);
            foliage.position.y = 2.8;
            foliage.castShadow = true;
            tree.add(trunk, foliage);
            tree.position.set(tx, 0, tz);
            landGroup.add(tree);
        });

        // Espelho d'água da Represa do Jaguari no horizonte
        const reservoirGeo = new THREE.PlaneGeometry(90, 30);
        const reservoirMat = new THREE.MeshPhysicalMaterial({
            color: 0x184c66,
            roughness: 0.12,
            metalness: 0.4,
            transmission: 0.65,
            transparent: true,
            opacity: 0.9,
            reflectivity: 0.95
        });
        const reservoir = new THREE.Mesh(reservoirGeo, reservoirMat);
        reservoir.rotation.x = -Math.PI / 2;
        reservoir.position.set(0, -0.5, -24);
        landGroup.add(reservoir);

        // Deck Náutico Flutuante na Represa com Tambores Azuis (Exatamente como na foto 8)
        const dockGroup = new THREE.Group();
        const dockWood = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 2.2), new THREE.MeshStandardMaterial({ color: 0x8b542c, roughness: 0.6 }));
        dockWood.position.set(0, 0.1, 0);
        const rampWood = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 3.6), new THREE.MeshStandardMaterial({ color: 0x9e6236, roughness: 0.6 }));
        rampWood.position.set(0, 0.2, 2.4);
        rampWood.rotation.x = 0.08;
        // Tambores azuis de flutuação
        const drumMat = new THREE.MeshStandardMaterial({ color: 0x0265c2, roughness: 0.4 });
        for (let d = -1.6; d <= 1.6; d += 0.8) {
            const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.65, 12), drumMat);
            drum.rotation.z = Math.PI / 2;
            drum.position.set(d, -0.12, -0.8);
            dockGroup.add(drum);
        }
        dockGroup.add(dockWood, rampWood);
        dockGroup.position.set(0, -0.45, -20);
        landGroup.add(dockGroup);

        scene.add(landGroup);
    }

    // 7. Hotspots Interativos Fidedignos aos Destaques Reais do Anúncio
    function buildHotspots() {
        const hotspotData = [
            {
                title: '🏊 Piscina com Cascata & Platô em Pedra São Tomé',
                desc: 'Piscina privativa em platô elevado revestido de legítima Pedra São Tomé, com cascata em arco de aço inox, prainha com degraus submersos, mesa bistrô com ombrelone azul royal e iluminação subaquática noturna.',
                pos: new THREE.Vector3(3.6, 1.4, 1.6)
            },
            {
                title: '🪵 Salão Gourmet Envidraçado com Fogão a Lenha',
                desc: 'Pavilhão coberto com telhado colonial cerâmico de 4 águas, paredes amarelas e fechamento panorâmico em vidro blindex. Equipado com autêntica churrasqueira e fogão a lenha de tijolinho à vista com chapa de ferro, lustre de roda de carroça e mesa maciça.',
                pos: new THREE.Vector3(-3.5, 2.4, -3.2)
            },
            {
                title: '🔥 Praça de Fogo com Cadeiras Adirondack',
                desc: 'Fogueira de chão aconchegante em platô de Pedra São Tomé no gramado, cercada por 4 cadeiras Adirondack de madeira maciça e caminhos de dormentes rústicos sob um céu estrelado espetacular.',
                pos: new THREE.Vector3(-0.2, 0.9, 5.6)
            },
            {
                title: '🏡 Casa Contêiner Amarela & Varanda com Redes',
                desc: 'Contêiner naval amarelo mostarda com varanda coberta de madeira, piso de cimento queimado com tapete central de ladrilho hidráulico, redes de descanso para relaxar e portas de vidro com climatização.',
                pos: new THREE.Vector3(3.6, 2.0, -2.4)
            },
            {
                title: '⛵ Acesso à Represa do Jaguari & Píer Flutuante',
                desc: 'Localização privilegiada com rampa pavimentada direta até a represa de Piracaia e píer flutuante de madeira para banho, caiaque, stand-up paddle ou ancoragem de lanchas.',
                pos: new THREE.Vector3(0, 0.4, -18)
            }
        ];

        hotspotData.forEach(data => {
            const g = new THREE.Group();
            const s = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
            const r = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.32, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
            r.rotation.x = Math.PI / 2;
            g.add(s, r);
            g.position.copy(data.pos);
            g.userData = data;
            scene.add(g);
            clickableHotspots.push(g);
        });
    }

    // Clique e Interação nos Hotspots
    function onCanvasClick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableHotspots, true);

        if (intersects.length > 0) {
            let root = intersects[0].object;
            while (root.parent && !root.userData.title) root = root.parent;
            if (root.userData.title) {
                const box = document.getElementById('hotspot-info-box');
                const title = document.getElementById('hotspot-title');
                const desc = document.getElementById('hotspot-desc');
                if (title) title.textContent = root.userData.title;
                if (desc) desc.textContent = root.userData.desc;
                if (box) box.classList.remove('hidden');
            }
        }
    }

    // Configuração dos Controles de Câmera e Dia/Noite
    function setupUIControls() {
        const toggleLightBtn = document.getElementById('toggle-light-btn');
        const lightModeText = document.getElementById('light-mode-text');

        if (toggleLightBtn) {
            toggleLightBtn.addEventListener('click', () => {
                isNight = !isNight;
                if (isNight) {
                    scene.background.setHex(0x09111a);
                    scene.fog.color.setHex(0x09111a);
                    ambientLight.intensity = 0.2;
                    dirLight.intensity = 0.25;
                    interiorLight.intensity = 2.8;
                    poolLight.intensity = 2.8;
                    firePitLight.intensity = 3.0;
                    porchLights.forEach(l => l.intensity = 2.4);
                    if (lightModeText) lightModeText.textContent = 'Modo Diurno (Ensolarado)';
                } else {
                    scene.background.setHex(0xdbe8ec);
                    scene.fog.color.setHex(0xdbe8ec);
                    ambientLight.intensity = 0.75;
                    dirLight.intensity = 1.3;
                    interiorLight.intensity = 1.6;
                    poolLight.intensity = 1.8;
                    firePitLight.intensity = 1.8;
                    porchLights.forEach(l => l.intensity = 1.2);
                    if (lightModeText) lightModeText.textContent = 'Modo Noturno (Aconchego)';
                }
            });
        }

        document.getElementById('close-hotspot-btn')?.addEventListener('click', () => {
            document.getElementById('hotspot-info-box')?.classList.add('hidden');
        });

        document.getElementById('reset-cam-btn')?.addEventListener('click', () => {
            moveCameraTo(new THREE.Vector3(13, 8.5, 14), new THREE.Vector3(0, 1.2, 0));
        });

        // Presets de Câmera Fidedignos
        const presetButtons = document.querySelectorAll('.cam-preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                presetButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const preset = btn.getAttribute('data-preset');
                switch (preset) {
                    case 'geral':
                        moveCameraTo(new THREE.Vector3(13, 8.5, 14), new THREE.Vector3(0, 1.2, 0));
                        break;
                    case 'piscina':
                        moveCameraTo(new THREE.Vector3(4.8, 2.8, 6.2), new THREE.Vector3(3.6, 1.0, 1.6));
                        break;
                    case 'fogao':
                        moveCameraTo(new THREE.Vector3(-4.5, 3.0, 1.2), new THREE.Vector3(-3.5, 1.5, -3.2));
                        break;
                    case 'fogo':
                        moveCameraTo(new THREE.Vector3(-0.2, 2.5, 9.5), new THREE.Vector3(-0.2, 0.4, 5.6));
                        break;
                    case 'interior':
                    case 'varanda':
                        moveCameraTo(new THREE.Vector3(3.2, 2.4, 0.8), new THREE.Vector3(3.6, 1.6, -2.4));
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

    // Loop de Animação com suavização e chama tremulante
    function animate() {
        requestAnimationFrame(animate);

        if (targetCameraPos) {
            camera.position.lerp(targetCameraPos, 0.05);
            controls.target.lerp(targetLookAt, 0.05);
            if (camera.position.distanceTo(targetCameraPos) < 0.08) {
                targetCameraPos = null;
            }
        }

        const time = Date.now() * 0.003;
        clickableHotspots.forEach(hp => {
            const ring = hp.children[1];
            if (ring) {
                const s = 1 + Math.sin(time) * 0.15;
                ring.scale.set(s, s, s);
            }
        });

        // Efeito de chama tremulante e viva na praça de fogo
        if (firePitLight) {
            const flicker = Math.sin(time * 7) * 0.35 + Math.cos(time * 13) * 0.2;
            firePitLight.intensity = (isNight ? 2.8 : 1.6) + flicker;
        }

        controls.update();
        renderer.render(scene, camera);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
