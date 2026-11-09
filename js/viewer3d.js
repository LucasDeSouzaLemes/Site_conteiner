/**
 * EcoContainer Piracaia - Visualizador 3D com Three.js
 * Gêmeo Digital da Propriedade Real:
 * - Casa Contêiner 40ft Grafite com Fachada Panorâmica de Vidro
 * - Piscina Privativa Retangular com Borda Atérmica, Água Turquesa e Iluminação Subaquática
 * - Varanda Gourmet Coberta com Fogão a Lenha Rústico, Chaminé Alta e Churrasqueira
 * - Praça de Fogo ao Luar (Fire Pit com bancos de tora e brasas incandescentes)
 * - Lareira Interna Aconchegante na Sala
 * - Represa do Jaguari no horizonte e relevo da Serra da Mantiqueira
 * - Iluminação Dia / Noite dinâmica e Hotspots Interativos
 */

(function () {
    const container = document.getElementById('threejs-canvas');
    if (!container || typeof THREE === 'undefined') return;

    let scene, camera, renderer, controls;
    let dirLight, ambientLight, interiorLight, poolLight, firePitLight;
    let isNight = false;
    let clickableHotspots = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let targetCameraPos = null;
    let targetLookAt = new THREE.Vector3(0, 1.2, 0);

    function init() {
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 550;

        // 1. Cena
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xdce9e2);
        scene.fog = new THREE.FogExp2(0xdce9e2, 0.018);

        // 2. Câmera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
        camera.position.set(15, 8.5, 15);

        // 3. Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        container.appendChild(renderer.domElement);

        // 4. Controles (OrbitControls)
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.03;
        controls.minDistance = 3.5;
        controls.maxDistance = 32;
        controls.target.copy(targetLookAt);

        // 5. Iluminação
        setupLighting();

        // 6. Construção da Casa Contêiner & Cenário Real
        buildTerrainAndReservoir();
        buildContainer();
        buildInteriorAndFireplace();
        buildGourmetVeranda();
        buildPoolAndDeck();
        buildFirePit();
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
        ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        dirLight = new THREE.DirectionalLight(0xfff6e5, 1.25);
        dirLight.position.set(16, 22, 12);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 45;
        dirLight.shadow.camera.left = -15;
        dirLight.shadow.camera.right = 15;
        dirLight.shadow.camera.top = 15;
        dirLight.shadow.camera.bottom = -15;
        dirLight.shadow.bias = -0.0004;
        scene.add(dirLight);

        // Luz interna acolhedora
        interiorLight = new THREE.PointLight(0xffaa44, 1.4, 10);
        interiorLight.position.set(0.5, 2.0, 0);
        scene.add(interiorLight);

        // Luz subaquática da piscina
        poolLight = new THREE.PointLight(0x00f0ff, 1.2, 7);
        poolLight.position.set(2.4, 0.35, 4.3);
        scene.add(poolLight);

        // Luz da praça de fogo
        firePitLight = new THREE.PointLight(0xff6611, 1.5, 8);
        firePitLight.position.set(5.2, 0.45, 6.8);
        scene.add(firePitLight);
    }

    // Terreno, Relevo da Mantiqueira & Represa do Jaguari
    function buildTerrainAndReservoir() {
        const groundGeo = new THREE.PlaneGeometry(75, 75, 36, 36);
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const distFromCenter = Math.sqrt(x * x + y * y);
            if (distFromCenter > 8) {
                let h = Math.sin(x * 0.12) * Math.cos(y * 0.12) * 2.5 + (distFromCenter - 8) * 0.18;
                if (y < -12) h = Math.min(h, -0.6);
                pos.setZ(i, h);
            }
        }
        groundGeo.computeVertexNormals();
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d6b4f, roughness: 0.92, metalness: 0.05 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Espelho d'água da Represa do Jaguari
        const reservoirGeo = new THREE.PlaneGeometry(80, 26);
        const reservoirMat = new THREE.MeshPhysicalMaterial({
            color: 0x1a5870,
            roughness: 0.15,
            metalness: 0.3,
            transmission: 0.6,
            transparent: true,
            opacity: 0.88,
            reflectivity: 0.9
        });
        const reservoir = new THREE.Mesh(reservoirGeo, reservoirMat);
        reservoir.rotation.x = -Math.PI / 2;
        reservoir.position.set(0, -0.35, -20);
        scene.add(reservoir);

        // Pátio nivelado de brita
        const pad = new THREE.Mesh(
            new THREE.BoxGeometry(15, 0.12, 11),
            new THREE.MeshStandardMaterial({ color: 0x757470, roughness: 0.95 })
        );
        pad.position.set(-0.5, 0.06, 2.5);
        pad.receiveShadow = true;
        scene.add(pad);
    }

    // Casa Contêiner 40ft High Cube
    function buildContainer() {
        const containerGroup = new THREE.Group();
        const length = 8.5, heightCont = 2.6, depth = 2.4;
        const containerMat = new THREE.MeshStandardMaterial({
            color: 0x242827,
            roughness: 0.42,
            metalness: 0.65
        });

        // Teto e Painéis Solares
        const roof = new THREE.Mesh(new THREE.BoxGeometry(length, 0.14, depth), containerMat);
        roof.position.set(0, heightCont, 0);
        roof.castShadow = true;
        containerGroup.add(roof);

        const solarMat = new THREE.MeshStandardMaterial({ color: 0x12243d, roughness: 0.25, metalness: 0.8 });
        for (let i = -2.8; i <= 2.8; i += 1.8) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.8), solarMat);
            panel.position.set(i, heightCont + 0.1, 0);
            containerGroup.add(panel);
        }

        // Piso
        const floor = new THREE.Mesh(new THREE.BoxGeometry(length, 0.15, depth), containerMat);
        floor.position.set(0, 0.08, 0);
        floor.receiveShadow = true;
        containerGroup.add(floor);

        // Parede traseira com frisos navais
        const backBase = new THREE.Mesh(new THREE.BoxGeometry(length, heightCont, 0.08), containerMat);
        backBase.position.set(0, heightCont / 2, -depth / 2);
        backBase.castShadow = true;
        containerGroup.add(backBase);

        for (let x = -length / 2 + 0.25; x < length / 2 - 0.2; x += 0.3) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, heightCont, 0.05), containerMat);
            rib.position.set(x, heightCont / 2, -depth / 2 - 0.03);
            containerGroup.add(rib);
        }

        // Laterais
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, heightCont, depth), containerMat);
        leftWall.position.set(-length / 2, heightCont / 2, 0);
        leftWall.castShadow = true;
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, heightCont, depth), containerMat);
        rightWall.position.set(length / 2, heightCont / 2, 0);
        rightWall.castShadow = true;
        containerGroup.add(leftWall, rightWall);

        // Vidro Panorâmico Frontal
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x8fd3e8,
            transmission: 0.88,
            opacity: 0.38,
            transparent: true,
            roughness: 0.05,
            ior: 1.5,
            reflectivity: 0.95
        });
        const glassPanel = new THREE.Mesh(new THREE.BoxGeometry(length * 0.72, heightCont * 0.88, 0.04), glassMat);
        glassPanel.position.set(0.6, heightCont / 2, depth / 2);
        containerGroup.add(glassPanel);

        // Moldura do vidro
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
        const topFrame = new THREE.Mesh(new THREE.BoxGeometry(length * 0.72, 0.08, 0.08), frameMat);
        topFrame.position.set(0.6, heightCont * 0.93, depth / 2);
        containerGroup.add(topFrame);

        // Canto sólido da cozinha
        const frontSolid = new THREE.Mesh(new THREE.BoxGeometry(length * 0.28, heightCont, 0.08), containerMat);
        frontSolid.position.set(-length / 2 + (length * 0.28) / 2, heightCont / 2, depth / 2);
        containerGroup.add(frontSolid);

        scene.add(containerGroup);
    }

    // Interior com Suíte e Lareira
    function buildInteriorAndFireplace() {
        const intGroup = new THREE.Group();
        const length = 8.5, depth = 2.4;

        // Piso de madeira
        const intFloor = new THREE.Mesh(
            new THREE.BoxGeometry(length - 0.2, 0.02, depth - 0.2),
            new THREE.MeshStandardMaterial({ color: 0xb57c4c, roughness: 0.45 })
        );
        intFloor.position.set(0, 0.16, 0);
        intGroup.add(intFloor);

        // Cama Queen
        const bed = new THREE.Group();
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.35, 1.6), new THREE.MeshStandardMaterial({ color: 0xf4f4f4 }));
        mattress.position.set(0, 0.35, 0);
        const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.37, 1.62), new THREE.MeshStandardMaterial({ color: 0x22553b }));
        duvet.position.set(-0.25, 0.35, 0);
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 1.7), new THREE.MeshStandardMaterial({ color: 0x3d2817 }));
        headboard.position.set(0.95, 0.55, 0);
        bed.add(mattress, duvet, headboard);
        bed.position.set(length / 2 - 1.4, 0.15, -0.15);
        intGroup.add(bed);

        // Lareira interna na sala
        const fpGroup = new THREE.Group();
        const fpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.75, 16), new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.3 }));
        fpBase.position.y = 0.5;
        const fpPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 12), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 }));
        fpPipe.position.y = 1.6;
        const fpEmber = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
        fpEmber.position.set(0, 0.45, 0.12);
        const fpLight = new THREE.PointLight(0xff7722, 1.1, 3.5);
        fpLight.position.set(0, 0.55, 0.18);
        fpGroup.add(fpBase, fpPipe, fpEmber, fpLight);
        fpGroup.position.set(-0.2, 0.15, -0.3);
        intGroup.add(fpGroup);

        // Bancada interna
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.65), new THREE.MeshStandardMaterial({ color: 0x1f2421 }));
        counter.position.set(-length / 2 + 1.2, 0.55, -depth / 2 + 0.45);
        intGroup.add(counter);

        scene.add(intGroup);
    }

    // Varanda Gourmet com Fogão a Lenha e Churrasqueira
    function buildGourmetVeranda() {
        const length = 8.5, depth = 2.4;
        const gourmetGroup = new THREE.Group();
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.7 });
        const roofWoodMat = new THREE.MeshStandardMaterial({ color: 0x61381b, roughness: 0.6 });

        // Pilares
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 0.14), pillarMat);
        p1.position.set(-length / 2 - 3.8, 1.3, -depth / 2 + 0.1);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 0.14), pillarMat);
        p2.position.set(-length / 2 - 3.8, 1.3, depth / 2 + 1.2);
        const p3 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 0.14), pillarMat);
        p3.position.set(-length / 2 - 0.2, 1.3, depth / 2 + 1.2);
        gourmetGroup.add(p1, p2, p3);

        // Telhado da varanda gourmet
        const gourmetRoof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 4.0), roofWoodMat);
        gourmetRoof.position.set(-length / 2 - 2.0, 2.65, 0.3);
        gourmetRoof.rotation.z = -0.05;
        gourmetRoof.castShadow = true;
        gourmetGroup.add(gourmetRoof);

        // Piso rústico
        const gourmetFloor = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.14, 3.8), new THREE.MeshStandardMaterial({ color: 0xa89f91, roughness: 0.85 }));
        gourmetFloor.position.set(-length / 2 - 2.0, 0.12, 0.3);
        gourmetFloor.receiveShadow = true;
        gourmetGroup.add(gourmetFloor);

        // Fogão a Lenha e Churrasqueira
        const brickMat = new THREE.MeshStandardMaterial({ color: 0x93422d, roughness: 0.88 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.85 });

        const stoveBase = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 0.95), brickMat);
        stoveBase.position.set(-length / 2 - 2.5, 0.52, -0.6);
        stoveBase.castShadow = true;
        gourmetGroup.add(stoveBase);

        const stoveTop = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.75), ironMat);
        stoveTop.position.set(-length / 2 - 2.3, 0.96, -0.6);
        gourmetGroup.add(stoveTop);

        const stoveDoor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.04), ironMat);
        stoveDoor.position.set(-length / 2 - 2.3, 0.4, -0.11);
        gourmetGroup.add(stoveDoor);

        // Chaminé alta preta
        const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 16), ironMat);
        chimney.position.set(-length / 2 - 3.1, 2.2, -0.6);
        chimney.castShadow = true;
        const chimneyCap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.18, 16), ironMat);
        chimneyCap.position.set(-length / 2 - 3.1, 3.45, -0.6);
        gourmetGroup.add(chimney, chimneyCap);

        // Churrasqueira de tijolos
        const bbq = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.4, 0.85), brickMat);
        bbq.position.set(-length / 2 - 1.2, 0.8, -0.6);
        bbq.castShadow = true;
        const bbqGrill = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.03, 0.65), ironMat);
        bbqGrill.position.set(-length / 2 - 1.2, 0.95, -0.55);
        gourmetGroup.add(bbq, bbqGrill);

        // Mesa de jantar rústica
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x5a341a, roughness: 0.65 });
        const diningTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.9), tableMat);
        diningTable.position.set(-length / 2 - 2.2, 0.5, 1.3);
        diningTable.castShadow = true;

        const bench1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.42, 0.32), tableMat);
        bench1.position.set(-length / 2 - 2.2, 0.32, 0.65);
        const bench2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.42, 0.32), tableMat);
        bench2.position.set(-length / 2 - 2.2, 0.32, 1.95);
        gourmetGroup.add(diningTable, bench1, bench2);

        scene.add(gourmetGroup);
    }

    // Deck de Madeira e Piscina Privativa Retangular
    function buildPoolAndDeck() {
        const poolGroup = new THREE.Group();
        const deckWoodMat = new THREE.MeshStandardMaterial({ color: 0x8b542c, roughness: 0.6 });
        const deckBase = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.22, 5.8), deckWoodMat);
        deckBase.position.set(1.5, 0.16, 4.3);
        deckBase.receiveShadow = true;
        deckBase.castShadow = true;
        poolGroup.add(deckBase);

        // Piscina Retangular
        const poolWidth = 3.6, poolDepth = 2.2;
        const stoneCopingMat = new THREE.MeshStandardMaterial({ color: 0xdfdad2, roughness: 0.7 });
        const coping = new THREE.Mesh(new THREE.BoxGeometry(poolWidth + 0.4, 0.26, poolDepth + 0.4), stoneCopingMat);
        coping.position.set(2.4, 0.2, 4.3);
        poolGroup.add(coping);

        const poolBasinMat = new THREE.MeshStandardMaterial({ color: 0x1ba9cd, roughness: 0.3 });
        const basin = new THREE.Mesh(new THREE.BoxGeometry(poolWidth, 0.24, poolDepth), poolBasinMat);
        basin.position.set(2.4, 0.18, 4.3);
        poolGroup.add(basin);

        // Água translúcida
        const poolWaterMat = new THREE.MeshPhysicalMaterial({
            color: 0x05b8d1,
            transmission: 0.8,
            opacity: 0.92,
            transparent: true,
            roughness: 0.08,
            ior: 1.33,
            reflectivity: 0.95
        });
        const poolWater = new THREE.Mesh(new THREE.BoxGeometry(poolWidth - 0.05, 0.08, poolDepth - 0.05), poolWaterMat);
        poolWater.position.set(2.4, 0.28, 4.3);
        poolGroup.add(poolWater);

        // Espreguiçadeiras
        const loungerMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.6 });
        const cushionMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.85 });

        function createLounger(x, z, rot) {
            const lounger = new THREE.Group();
            const frame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 1.8), loungerMat);
            frame.position.y = 0.15;
            const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 1.75), cushionMat);
            cushion.position.y = 0.26;
            const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.45), cushionMat);
            headrest.position.set(0, 0.32, -0.6);
            headrest.rotation.x = -0.3;
            lounger.add(frame, cushion, headrest);
            lounger.position.set(x, 0.24, z);
            lounger.rotation.y = rot;
            lounger.castShadow = true;
            return lounger;
        }

        poolGroup.add(createLounger(-0.8, 3.4, 0.2));
        poolGroup.add(createLounger(-0.6, 5.0, 0.15));

        scene.add(poolGroup);
    }

    // Praça de Fogo ao Luar
    function buildFirePit() {
        const firePitGroup = new THREE.Group();
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6e6860, roughness: 0.95 });
        const numStones = 16;
        const pitRadius = 1.0;
        for (let i = 0; i < numStones; i++) {
            const angle = (i / numStones) * Math.PI * 2;
            const sx = Math.cos(angle) * pitRadius;
            const sz = Math.sin(angle) * pitRadius;
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + Math.sin(i) * 0.04, 0), stoneMat);
            rock.position.set(sx, 0.16, sz);
            rock.rotation.set(i, i * 0.5, 0);
            rock.castShadow = true;
            firePitGroup.add(rock);
        }

        const ashBase = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.98 }));
        ashBase.position.y = 0.1;
        firePitGroup.add(ashBase);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x422613, roughness: 0.9 });
        for (let i = 0; i < 4; i++) {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.75, 8), woodMat);
            log.rotation.z = Math.PI / 3;
            log.rotation.y = (i * Math.PI) / 2;
            log.position.y = 0.22;
            firePitGroup.add(log);
        }

        const embers = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff4800 }));
        embers.position.y = 0.26;
        firePitGroup.add(embers);

        const logBenchMat = new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.85 });
        const benchDistances = [
            { x: 1.8, z: 0, r: 0 },
            { x: -1.8, z: 0, r: 0 },
            { x: 0, z: 1.8, r: Math.PI / 2 },
            { x: 0, z: -1.8, r: Math.PI / 2 }
        ];
        benchDistances.forEach(b => {
            const bench = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 1.1, 12), logBenchMat);
            bench.rotation.z = Math.PI / 2;
            bench.rotation.y = b.r;
            bench.position.set(b.x, 0.22, b.z);
            bench.castShadow = true;
            firePitGroup.add(bench);
        });

        firePitGroup.position.set(5.2, 0.06, 6.8);
        scene.add(firePitGroup);
    }

    // Vegetação Nativa da Mantiqueira
    function buildTrees() {
        const treePositions = [
            [-8, -5], [-9, 4], [-7, 8], [9, -4], [9, 3], [8, 8],
            [-4, -7], [3, -8], [7, -6], [-10, -9], [11, -8]
        ];
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x422915, roughness: 0.9 });
        const foliageMat = new THREE.MeshStandardMaterial({ color: 0x18442c, roughness: 0.85 });

        treePositions.forEach(([x, z]) => {
            const tree = new THREE.Group();
            const h = 3.6 + Math.random() * 2.2;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h * 0.45, 8), trunkMat);
            trunk.position.y = (h * 0.45) / 2;
            trunk.castShadow = true;
            tree.add(trunk);

            for (let i = 0; i < 3; i++) {
                const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2 - i * 0.25, 1.5, 8), foliageMat);
                cone.position.y = (h * 0.35) + i * 0.95;
                cone.castShadow = true;
                tree.add(cone);
            }
            tree.position.set(x, 0, z);
            scene.add(tree);
        });
    }

    // Hotspots Interativos
    function buildHotspots() {
        const hotspotData = [
            {
                title: '🏊 Piscina Privativa com Vista Panorâmica',
                desc: 'Piscina exclusiva integrada ao deck de madeira com espreguiçadeiras e vista deslumbrante para o vale e as montanhas de Piracaia.',
                pos: new THREE.Vector3(2.4, 0.85, 4.3)
            },
            {
                title: '🪵 Fogão a Lenha Rústico & Área Gourmet',
                desc: 'Varanda gourmet coberta completa com autêntico fogão a lenha mineiro, chaminé alta, churrasqueira e mesa rústica para refeições especiais.',
                pos: new THREE.Vector3(-6.2, 1.8, -0.6)
            },
            {
                title: '🔥 Praça de Fogo sob as Estrelas',
                desc: 'Espaço com fogueira de chão em pedras naturais e bancos de tora, ideal para assar marshmallows e curtir o friozinho da serra.',
                pos: new THREE.Vector3(5.2, 0.9, 6.8)
            },
            {
                title: '🛋️ Lareira Interna & Suíte Aconchegante',
                desc: 'Sala de estar envidraçada com lareira aconchegante, cama Queen com enxoval hoteleiro e isolamento termoacústico naval de alto padrão.',
                pos: new THREE.Vector3(-0.2, 1.5, -0.3)
            },
            {
                title: '🌊 Acesso à Represa do Jaguari',
                desc: 'Localização privilegiada na represa de Piracaia para banho, esportes náuticos, caiaque ou contemplação da natureza preservada.',
                pos: new THREE.Vector3(0, 0.5, -16)
            }
        ];

        hotspotData.forEach(data => {
            const g = new THREE.Group();
            const s = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshBasicMaterial({ color: 0x52b788 }));
            const r = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.32, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
            r.rotation.x = Math.PI / 2;
            g.add(s, r);
            g.position.copy(data.pos);
            g.userData = data;
            scene.add(g);
            clickableHotspots.push(g);
        });
    }

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
                    ambientLight.intensity = 0.18;
                    dirLight.intensity = 0.25;
                    interiorLight.intensity = 2.8;
                    poolLight.intensity = 2.6;
                    firePitLight.intensity = 2.8;
                    if (lightModeText) lightModeText.textContent = 'Modo Diurno (Ensolarado)';
                } else {
                    scene.background.setHex(0xdce9e2);
                    scene.fog.color.setHex(0xdce9e2);
                    ambientLight.intensity = 0.7;
                    dirLight.intensity = 1.25;
                    interiorLight.intensity = 1.4;
                    poolLight.intensity = 1.2;
                    firePitLight.intensity = 1.5;
                    if (lightModeText) lightModeText.textContent = 'Modo Noturno (Aconchego)';
                }
            });
        }

        // Fechar Hotspot
        document.getElementById('close-hotspot-btn')?.addEventListener('click', () => {
            document.getElementById('hotspot-info-box')?.classList.add('hidden');
        });

        // Reset de Câmera
        document.getElementById('reset-cam-btn')?.addEventListener('click', () => {
            moveCameraTo(new THREE.Vector3(15, 8.5, 15), new THREE.Vector3(0, 1.2, 0));
        });

        // Presets de Câmera
        const presetButtons = document.querySelectorAll('.cam-preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                presetButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const preset = btn.getAttribute('data-preset');
                switch (preset) {
                    case 'geral':
                        moveCameraTo(new THREE.Vector3(15, 8.5, 15), new THREE.Vector3(0, 1.2, 0));
                        break;
                    case 'piscina':
                        moveCameraTo(new THREE.Vector3(4.8, 3.2, 7.8), new THREE.Vector3(2.4, 0.4, 4.3));
                        break;
                    case 'fogao':
                        moveCameraTo(new THREE.Vector3(-6.8, 3.2, 4.2), new THREE.Vector3(-5.2, 1.3, -0.2));
                        break;
                    case 'fogo':
                        moveCameraTo(new THREE.Vector3(7.2, 2.6, 9.2), new THREE.Vector3(5.2, 0.4, 6.8));
                        break;
                    case 'interior':
                        moveCameraTo(new THREE.Vector3(1.2, 2.0, 3.4), new THREE.Vector3(0.0, 1.2, 0.0));
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

        // Brilho tremulante realista na praça de fogo
        if (firePitLight) {
            const flicker = Math.sin(time * 6) * 0.25 + Math.cos(time * 11) * 0.15;
            firePitLight.intensity = (isNight ? 2.5 : 1.4) + flicker;
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
