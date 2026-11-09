/**
 * EcoContainer Piracaia - Visualizador 3D Ultra-Realista
 * Gêmeo Digital Fiel às Fotos Oficiais do Airbnb (1213833985011094710)
 * 
 * Destaques Modelados em Conformidade com as Fotos Reais:
 * - Salão Gourmet com Telhado Colonial de 4 Águas (telhas cerâmicas romanas), alvenaria amarela mostarda e 100% blindex
 * - Interior Gourmet: Churrasqueira de tijolinho com coifa chanfrada, fogão a lenha acoplado com chapa de ferro e forno, bancada em granito São Gabriel, mesa rústica e lustre de roda de carroça com spots
 * - Casa Contêiner Amarelo Ocre Mostarda com frisos verticais, portas de correr de vidro e torre com caixa d'água azul
 * - Varanda Coberta com vigas e caibros de pergolado aparentes, piso com tapete de ladrilho hidráulico, redes, pendentes de fibra natural, 2 cadeiras Adirondack na varanda, floreira tropical exuberante e fonte ornamental clássica de pedra
 * - Platô Elevado da Piscina em alvenaria amarela com talude gramado frontal e degraus de dormentes de madeira
 * - Deck e Borda boleada em Pedra São Tomé irregular com rejunte claro
 * - Piscina de Fibra com prainha semicircular e banco submerso, cascata de inox tipo arco de cisne com jato d'água ativo e ombrelone azul royal com bistrô
 * - Praça de Fogo em platô de Pedra São Tomé com 4 legítimas cadeiras Adirondack de madeira maciça com encosto leque e fogueira viva com labaredas animadas
 * - Abrigo/Pergolado rústico com lancha náutica coberta sobre carreta rodoviária (fotos 17 e 24)
 * - Estacionamento em concregrama (pisograma) com caminhonete prateada cabine dupla
 * - Cerca perimetral (alambrado com mourões e cerca viva), balanço de madeira no gramado e represa do Jaguari com píer
 * - Modo Noturno autêntico às fotos 13 e 14: LED azul subaquático na piscina, fogueira cintilante, pendentes de palha e iluminação cênica de jardim
 */

(function () {
    const container = document.getElementById('threejs-canvas');
    if (!container || typeof THREE === 'undefined') return;

    let scene, camera, renderer, controls;
    let dirLight, ambientLight, hemiLight;
    let interiorLight, poolLight, firePitLight, wallSconceLight;
    let porchLights = [], gardenLights = [];
    let isNight = false;
    let clickableHotspots = [];
    let animatedWaterMesh = null, animatedWaterJet = null;
    let animatedFlameGroup = null;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let targetCameraPos = null;
    let targetLookAt = new THREE.Vector3(0, 1.2, 0);

    // ==========================================
    // 1. GERADORES DE TEXTURAS PROCEDURAIS
    // ==========================================

    // Textura de Pedra São Tomé Irregular (fiel às fotos 13, 24 e 27)
    function createSaoTomeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Rejunte cinza cimento claro
        ctx.fillStyle = '#b5aba0';
        ctx.fillRect(0, 0, 512, 512);

        const stoneColors = ['#ebd8be', '#e5dcce', '#dfd3c0', '#eedfc8', '#dacdb8', '#f2e5d2', '#d9cbb2', '#ebd4b5'];
        const cols = 8, rows = 8;
        const cellW = 512 / cols;
        const cellH = 512 / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cx = c * cellW + cellW / 2 + (Math.sin(r * 3 + c) * 4);
                const cy = r * cellH + cellH / 2 + (Math.cos(c * 2 + r) * 4);
                const color = stoneColors[(r * 5 + c * 3) % stoneColors.length];

                ctx.fillStyle = color;
                ctx.beginPath();
                const numVerts = 5 + Math.floor(Math.sin(r + c * 2) * 2 + 2);
                for (let v = 0; v < numVerts; v++) {
                    const angle = (v / numVerts) * Math.PI * 2;
                    const rad = (cellW * 0.44) * (0.82 + Math.sin(r * 2 + v * 3) * 0.22);
                    const vx = cx + Math.cos(angle) * rad;
                    const vy = cy + Math.sin(angle) * rad;
                    if (v === 0) ctx.moveTo(vx, vy);
                    else ctx.lineTo(vx, vy);
                }
                ctx.closePath();
                ctx.fill();

                // Fissuras e nuances naturais da pedra quartzito
                ctx.strokeStyle = 'rgba(150, 130, 110, 0.25)';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // Destaque de luz suave no bordo
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3.5, 3.5);
        return tex;
    }

    // Textura de Telhado Colonial Cerâmico (telhas romanas com canais de sombra e luz)
    function createTileRoofTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#9e3f22';
        ctx.fillRect(0, 0, 512, 512);

        const tileW = 28;
        for (let x = 0; x < 512; x += tileW) {
            const grad = ctx.createLinearGradient(x, 0, x + tileW, 0);
            grad.addColorStop(0, '#66220e');
            grad.addColorStop(0.25, '#be4b29');
            grad.addColorStop(0.65, '#d85d38');
            grad.addColorStop(0.9, '#a23b1c');
            grad.addColorStop(1, '#571c0b');
            ctx.fillStyle = grad;
            ctx.fillRect(x, 0, tileW - 2, 512);
        }

        // Linhas de encaixe horizontal das telhas
        for (let y = 0; y < 512; y += 36) {
            ctx.fillStyle = 'rgba(25, 6, 2, 0.48)';
            ctx.fillRect(0, y, 512, 4);
            ctx.fillStyle = 'rgba(255, 195, 165, 0.26)';
            ctx.fillRect(0, y + 4, 512, 2);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(5, 5);
        return tex;
    }

    // Textura de Madeira Rústica para as Cadeiras Adirondack e Estruturas
    function createWoodTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#945827';
        ctx.fillRect(0, 0, 256, 256);

        for (let y = 0; y < 256; y += 2) {
            const val = Math.sin(y * 0.14) * 25 + Math.cos(y * 0.05) * 15;
            ctx.fillStyle = `rgba(${135 + val}, ${75 + val * 0.5}, ${30}, 0.25)`;
            ctx.fillRect(0, y, 256, 1.6);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    // Textura de Tijolinho Aparente para a Churrasqueira e Fogão a Lenha
    function createBrickTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#b5aba0'; // Rejunte
        ctx.fillRect(0, 0, 256, 256);

        const brickW = 40, brickH = 16;
        const brickColors = ['#b84d28', '#c95932', '#aa4320', '#a33c1a', '#bd542f'];
        let row = 0;
        for (let y = 2; y < 256; y += brickH + 2) {
            const shift = (row % 2) * (brickW / 2);
            for (let x = -shift; x < 256; x += brickW + 2) {
                ctx.fillStyle = brickColors[(row * 3 + Math.floor(x / 20)) % brickColors.length];
                ctx.fillRect(Math.max(0, x), y, brickW, brickH);
            }
            row++;
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        return tex;
    }

    // Textura de Ladrilho Hidráulico Tradicional Brasileiro (Foto 12)
    function createHydraulicTileTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ede2cf';
        ctx.fillRect(0, 0, 256, 256);

        const tileSize = 32;
        for (let x = 0; x < 256; x += tileSize) {
            for (let y = 0; y < 256; y += tileSize) {
                ctx.strokeStyle = '#8f3922';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x + 1.5, y + 1.5, tileSize - 3, tileSize - 3);
                ctx.fillStyle = ((x + y) / tileSize) % 2 === 0 ? '#b83b27' : '#caa143';
                ctx.beginPath();
                ctx.arc(x + tileSize / 2, y + tileSize / 2, 5.5, 0, Math.PI * 2);
                ctx.fill();

                // Pétalas decorativas
                ctx.fillStyle = '#426848';
                ctx.beginPath();
                ctx.arc(x + tileSize / 2, y + 5, 2.5, 0, Math.PI * 2);
                ctx.arc(x + tileSize / 2, y + tileSize - 5, 2.5, 0, Math.PI * 2);
                ctx.arc(x + 5, y + tileSize / 2, 2.5, 0, Math.PI * 2);
                ctx.arc(x + tileSize - 5, y + tileSize / 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        return new THREE.CanvasTexture(canvas);
    }

    // ==========================================
    // 2. INICIALIZAÇÃO DA CENA & RENDERER
    // ==========================================

    function init() {
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 550;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x76b4ea); // Céu límpido de montanha
        scene.fog = new THREE.FogExp2(0x8bc2ee, 0.012);

        // Câmera posicionada no exato ângulo herói da Foto 27
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 160);
        camera.position.set(2.5, 7.2, 16.5);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;
        container.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.02;
        controls.minDistance = 3.2;
        controls.maxDistance = 42;
        controls.target.copy(targetLookAt);

        setupLighting();
        buildSkyDome();
        buildGroundAndParking();
        buildBoatShelterAndBoat();
        buildGourmetPavilion();
        buildYellowContainerAndPorch();
        buildRaisedPoolWithSãoTomé();
        buildFirePitWithAdirondacks();
        buildLandscapeAndReservoir();
        buildPerimeterFence();
        buildHotspots();

        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('click', onCanvasClick);
        setupUIControls();

        animate();
    }

    // Iluminação Diurna e Noturna
    function setupLighting() {
        hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d6b44, 0.65);
        scene.add(hemiLight);

        ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(ambientLight);

        // Sol brilhante da serra de Piracaia
        dirLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
        dirLight.position.set(18, 28, 16);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 60;
        dirLight.shadow.camera.left = -22;
        dirLight.shadow.camera.right = 22;
        dirLight.shadow.camera.top = 22;
        dirLight.shadow.camera.bottom = -22;
        dirLight.shadow.bias = -0.0003;
        scene.add(dirLight);

        // Iluminação interna do Salão Gourmet (aconchegante)
        interiorLight = new THREE.PointLight(0xffb040, 1.8, 11);
        interiorLight.position.set(-3.8, 2.3, -3.2);
        scene.add(interiorLight);

        // Arandela decorativa externa no pilar da área gourmet (Foto 13)
        wallSconceLight = new THREE.PointLight(0xffd27d, 0.9, 4.5);
        wallSconceLight.position.set(-1.0, 1.8, -0.6);
        scene.add(wallSconceLight);

        // Pendentes de fibra natural da varanda do contêiner amarelo
        [1.8, 4.8].forEach(px => {
            const pl = new THREE.PointLight(0xff9933, 1.4, 5.5);
            pl.position.set(px, 2.2, -1.8);
            porchLights.push(pl);
            scene.add(pl);
        });

        // LED Subaquático Azul Royal da Piscina (Fotos 13 e 14)
        poolLight = new THREE.PointLight(0x0077ff, 2.6, 9.0);
        poolLight.position.set(3.6, 0.75, 1.6);
        scene.add(poolLight);

        // Fogueira viva da Praça de Fogo com luz âmbar cintilante
        firePitLight = new THREE.PointLight(0xff5500, 2.4, 10.0);
        firePitLight.position.set(-0.2, 0.55, 5.6);
        scene.add(firePitLight);
    }

    // Cúpula do Céu com Gradiente Suave
    function buildSkyDome() {
        const skyGeo = new THREE.SphereGeometry(80, 32, 16);
        const skyMat = new THREE.MeshBasicMaterial({ color: 0x68a5e3, side: THREE.BackSide });
        const skyDome = new THREE.Mesh(skyGeo, skyMat);
        scene.add(skyDome);
    }

    // ==========================================
    // 3. CONSTRUÇÃO DETALHADA DA PROPRIEDADE
    // ==========================================

    // Gramado, Terreno e Estacionamento de Pisograma com Caminhonete
    function buildGroundAndParking() {
        const groundGeo = new THREE.PlaneGeometry(90, 90, 36, 36);
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            if (dist > 10) {
                let h = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2.2 + (dist - 10) * 0.15;
                if (y < -14) h = Math.min(h, -0.7);
                pos.setZ(i, h);
            }
        }
        groundGeo.computeVertexNormals();
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d6b44, roughness: 0.92 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Estacionamento de Concregrama (Pisograma) à esquerda (Fotos 7, 11 e 13)
        const parkGroup = new THREE.Group();
        const blockMat = new THREE.MeshStandardMaterial({ color: 0x8a8882, roughness: 0.88 });
        const grassHole = new THREE.MeshStandardMaterial({ color: 0x345e3a, roughness: 0.95 });

        const parkBase = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.08, 10.5), grassHole);
        parkBase.position.set(-8.5, 0.04, 2.0);
        parkBase.receiveShadow = true;
        parkGroup.add(parkBase);

        for (let x = -11.5; x <= -5.5; x += 0.75) {
            for (let z = -2.8; z <= 6.8; z += 0.75) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.66), blockMat);
                b.position.set(x, 0.07, z);
                b.receiveShadow = true;
                parkGroup.add(b);
            }
        }

        // Caminhonete Prateada Cabine Dupla (Toyota Hilux prata vista nas fotos 13 e 24)
        const truck = new THREE.Group();
        const carPaint = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.25 });
        const darkGlass = new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.1, transmission: 0.6, transparent: true });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.8 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });

        // Caçamba e chassi
        const truckBed = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.7, 1.8), carPaint);
        truckBed.position.set(0, 0.65, 1.4);
        truckBed.castShadow = true;

        // Cabine dupla
        const truckCabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.82, 2.8), carPaint);
        truckCabin.position.set(0, 0.95, -0.6);
        truckCabin.castShadow = true;

        // Vidros da cabine
        const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 1.8), darkGlass);
        windshield.position.set(0, 1.3, -0.6);

        // Rodas de liga leve com pneus off-road
        [[-1.05, 1.4], [1.05, 1.4], [-1.05, -1.2], [1.05, -1.2]].forEach(([wx, wz]) => {
            const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16), wheelMat);
            tire.rotation.z = Math.PI / 2;
            tire.position.set(wx, 0.38, wz);
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.29, 12), rimMat);
            rim.rotation.z = Math.PI / 2;
            rim.position.set(wx, 0.38, wz);
            truck.add(tire, rim);
        });

        // Faróis dianteiros
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        [-0.75, 0.75].forEach(hx => {
            const light = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.05), headlightMat);
            light.position.set(hx, 0.85, -2.02);
            truck.add(light);
        });

        truck.add(truckBed, truckCabin, windshield);
        truck.position.set(-8.5, 0.0, 1.8);
        parkGroup.add(truck);

        scene.add(parkGroup);
    }

    // Abrigo/Pergolado Rústico com Lancha Náutica Coberta sobre Carreta (Fotos 17, 18 e 24)
    function buildBoatShelterAndBoat() {
        const shelterGroup = new THREE.Group();
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x5a3118, roughness: 0.75 });
        const coverRoofMat = new THREE.MeshStandardMaterial({ color: 0x8a4b28, roughness: 0.8 });
        const boatCoverMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.65 }); // Lona cinza náutica
        const trailerMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7 });

        const posX = -10.2, posZ = -6.5;
        const w = 4.2, d = 6.2, h = 2.6;

        // Mourões de eucalipto do pergolado
        [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].forEach(([px, pz]) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, h, 8), beamMat);
            post.position.set(posX + px, h / 2, posZ + pz);
            post.castShadow = true;
            shelterGroup.add(post);
        });

        // Vigas superiores e caibros
        const beamL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, d + 0.4), beamMat);
        beamL.position.set(posX - w / 2, h + 0.09, posZ);
        const beamR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, d + 0.4), beamMat);
        beamR.position.set(posX + w / 2, h + 0.09, posZ);
        shelterGroup.add(beamL, beamR);

        // Telhado inclinado do abrigo
        const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.08, d + 0.6), coverRoofMat);
        roof.position.set(posX, h + 0.22, posZ);
        roof.rotation.x = -0.06;
        roof.castShadow = true;
        shelterGroup.add(roof);

        // Lancha sob a capa náutica cinza
        const boat = new THREE.Group();
        const hull = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5.0, 6), boatCoverMat);
        hull.rotation.x = Math.PI / 2;
        hull.scale.set(1.0, 0.55, 1.0);
        hull.position.set(0, 0.8, 0);
        hull.castShadow = true;

        // Carreta rodoviária com rodas
        const trailerFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 5.4), trailerMat);
        trailerFrame.position.set(0, 0.45, 0);
        boat.add(hull, trailerFrame);

        [-1.05, 1.05].forEach(wx => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12), trailerMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(wx, 0.28, 0.2);
            boat.add(wheel);
        });

        boat.position.set(posX, 0.05, posZ);
        shelterGroup.add(boat);

        scene.add(shelterGroup);
    }

    // Salão Gourmet com Telhado Colonial Cerâmico de 4 Águas e Vidro Panorâmico
    function buildGourmetPavilion() {
        const gourmetGroup = new THREE.Group();
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xdda538, roughness: 0.68 }); // Amarelo mostarda fiel
        const tileRoofTex = createTileRoofTexture();
        const redTileMat = new THREE.MeshStandardMaterial({ map: tileRoofTex, roughness: 0.85 });
        const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x822b16, roughness: 0.8 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x542d13, roughness: 0.7 });
        const brickTex = createBrickTexture();
        const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.85 });
        const graniteMat = new THREE.MeshStandardMaterial({ color: 0x181a1b, roughness: 0.2, metalness: 0.4 });

        const width = 5.6, depth = 5.4, wallHeight = 2.7;
        const posX = -3.8, posZ = -3.2;

        // Piso interno de porcelanato rústico claro
        const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.15, depth), new THREE.MeshStandardMaterial({ color: 0xc8bea8, roughness: 0.55 }));
        floor.position.set(posX, 0.08, posZ);
        floor.receiveShadow = true;
        gourmetGroup.add(floor);

        // Metade inferior em alvenaria amarela mostarda
        const wallBaseFront = new THREE.Mesh(new THREE.BoxGeometry(width, 1.15, 0.18), yellowMat);
        wallBaseFront.position.set(posX, 0.58, posZ + depth / 2);
        wallBaseFront.castShadow = true;

        const wallBaseLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, depth), yellowMat);
        wallBaseLeft.position.set(posX - width / 2, 0.58, posZ);

        const wallBaseRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, depth), yellowMat);
        wallBaseRight.position.set(posX + width / 2, 0.58, posZ);

        const wallBackSolid = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, 0.18), yellowMat);
        wallBackSolid.position.set(posX, wallHeight / 2, posZ - depth / 2);
        wallBackSolid.castShadow = true;
        gourmetGroup.add(wallBaseFront, wallBaseLeft, wallBaseRight, wallBackSolid);

        // Metade superior 100% envidraçada em Blindex transparente com esquadrias
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xb5ecf7,
            transmission: 0.94,
            opacity: 0.32,
            transparent: true,
            roughness: 0.04,
            ior: 1.5,
            reflectivity: 0.95
        });

        const glassFront = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 1.52, 0.04), glassMat);
        glassFront.position.set(posX, 1.91, posZ + depth / 2);

        const glassLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.52, depth - 0.2), glassMat);
        glassLeft.position.set(posX - width / 2, 1.91, posZ);

        const glassRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.52, depth - 0.2), glassMat);
        glassRight.position.set(posX + width / 2, 1.91, posZ);
        gourmetGroup.add(glassFront, glassLeft, glassRight);

        // Pilares de sustentação de madeira nos 4 cantos
        [[-width / 2, -depth / 2], [width / 2, -depth / 2], [-width / 2, depth / 2], [width / 2, depth / 2]].forEach(([cx, cz]) => {
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, wallHeight, 0.18), yellowMat);
            pillar.position.set(posX + cx, wallHeight / 2, posZ + cz);
            pillar.castShadow = true;
            gourmetGroup.add(pillar);
        });

        // Telhado Colonial de 4 Águas com beiral saliente
        const roofHeight = 1.55;
        const eaveW = width + 0.9;
        const eaveD = depth + 0.9;
        const roofGeo = new THREE.ConeGeometry(Math.max(eaveW, eaveD) * 0.72, roofHeight, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeo, redTileMat);
        roof.position.set(posX, wallHeight + roofHeight / 2, posZ);
        roof.scale.set(eaveW / Math.max(eaveW, eaveD), 1.0, eaveD / Math.max(eaveW, eaveD));
        roof.castShadow = true;
        gourmetGroup.add(roof);

        // Cumeeiras cerâmicas nas 4 arestas diagonais
        const ridge1 = new THREE.Mesh(new THREE.BoxGeometry(eaveW * 0.95, 0.12, 0.12), ridgeMat);
        ridge1.position.set(posX, wallHeight + roofHeight - 0.05, posZ);
        ridge1.rotation.y = Math.PI / 4;
        gourmetGroup.add(ridge1);

        // --- INTERIOR GOURMET COMPLETO (FOTO 2) ---
        // Churrasqueira de tijolinho com coifa chanfrada e chaminé
        const bbq = new THREE.Group();
        const bbqBase = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.95, 0.95), brickMat);
        bbqBase.position.set(0, 0.47, 0);
        const bbqOpening = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.5), new THREE.MeshStandardMaterial({ color: 0x1c1917 }));
        bbqOpening.position.set(0, 0.55, 0.25);
        const bbqHood = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.68, 1.45, 4), brickMat);
        bbqHood.rotation.y = Math.PI / 4;
        bbqHood.position.set(0, 1.65, 0);
        bbq.add(bbqBase, bbqOpening, bbqHood);
        bbq.position.set(posX - 1.5, 0.1, posZ - depth / 2 + 0.65);
        gourmetGroup.add(bbq);

        // Fogão a lenha acoplado com chapa de ferro fundido de 3 bocas e forno
        const stove = new THREE.Group();
        const stoveBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.88, 0.95), brickMat);
        stoveBase.position.set(0, 0.44, 0);
        const ironTop = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.06, 0.85), new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9 }));
        ironTop.position.set(0, 0.91, 0);
        const ovenDoor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.85 }));
        ovenDoor.position.set(0.15, 0.46, 0.48);
        stove.add(stoveBase, ironTop, ovenDoor);
        stove.position.set(posX + 0.1, 0.1, posZ - depth / 2 + 0.65);
        gourmetGroup.add(stove);

        // Fogão moderno preto com panelas de cobre (Foto 2)
        const modernCooktop = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.75), new THREE.MeshStandardMaterial({ color: 0x111827 }));
        modernCooktop.position.set(posX + 1.4, 0.5, posZ - depth / 2 + 0.65);
        const copperPanMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.8, roughness: 0.25 });
        const pan1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.14, 12), copperPanMat);
        pan1.position.set(posX + 1.3, 0.99, posZ - depth / 2 + 0.55);
        const pan2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.12, 12), copperPanMat);
        pan2.position.set(posX + 1.55, 0.98, posZ - depth / 2 + 0.7);
        gourmetGroup.add(modernCooktop, pan1, pan2);

        // Bancada em granito São Gabriel preto polido
        const counter = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.95, 0.75), graniteMat);
        counter.position.set(posX - 0.5, 0.55, posZ + 0.8);
        gourmetGroup.add(counter);

        // Mesa de Jantar Rústica de Madeira com Cadeiras com Encosto X (Foto 2)
        const table = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.78, 1.15), woodMat);
        table.position.set(posX, 0.46, posZ - 0.4);
        table.castShadow = true;
        gourmetGroup.add(table);

        for (let c = -0.8; c <= 0.8; c += 0.8) {
            const chairF = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.82, 0.42), woodMat);
            chairF.position.set(posX + c, 0.44, posZ - 0.4 - 0.8);
            const chairB = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.82, 0.42), woodMat);
            chairB.position.set(posX + c, 0.44, posZ - 0.4 + 0.8);
            gourmetGroup.add(chairF, chairB);
        }

        // Lustre de Roda de Carroça com 6 Spots de Luz (Foto 2)
        const wagonWheel = new THREE.Group();
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.05, 12, 24), woodMat);
        rim.rotation.x = Math.PI / 2;
        wagonWheel.add(rim);
        for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2;
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.58, 8), woodMat);
            spoke.rotation.z = Math.PI / 2;
            spoke.rotation.y = angle;
            wagonWheel.add(spoke);
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe299 }));
            bulb.position.set(Math.cos(angle) * 0.58, -0.09, Math.sin(angle) * 0.58);
            wagonWheel.add(bulb);
        }
        wagonWheel.position.set(posX, 2.3, posZ - 0.4);
        gourmetGroup.add(wagonWheel);

        // Calçada externa perimetral em vermelho terracota brilhante (Fotos 13 e 15)
        const walkMat = new THREE.MeshStandardMaterial({ color: 0x9e3124, roughness: 0.45 });
        const walkTile = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.05, depth + 1.2), walkMat);
        walkTile.position.set(posX, 0.03, posZ);
        walkTile.receiveShadow = true;
        gourmetGroup.add(walkTile);

        // Floreira rente à base com folhagens (Foto 13 e 27)
        const bushMat = new THREE.MeshStandardMaterial({ color: 0x2e6b36, roughness: 0.7 });
        for (let fx = -width / 2 + 0.4; fx <= width / 2 - 0.4; fx += 0.8) {
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), bushMat);
            foliage.scale.set(1.2, 0.8, 0.7);
            foliage.position.set(posX + fx, 0.2, posZ + depth / 2 + 0.5);
            gourmetGroup.add(foliage);
        }

        scene.add(gourmetGroup);
    }

    // A Casa Contêiner Amarela e Varanda com Redes, Tapete de Ladrilho, Cadeiras e Caixa d'Água
    function buildYellowContainerAndPorch() {
        const contGroup = new THREE.Group();
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xe2a838, roughness: 0.68 }); // Amarelo mostarda autêntico
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x542d13, roughness: 0.65 });
        const postMat = new THREE.MeshStandardMaterial({ color: 0x6e3d1c, roughness: 0.7 });
        const whiteFrame = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xade8f4, transmission: 0.88, opacity: 0.35, transparent: true, roughness: 0.05 });
        const woodTex = createWoodTexture();
        const adirondackMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xb5783d, roughness: 0.65 });

        const length = 8.6, height = 2.6, depth = 2.44;
        const posX = 3.6, posZ = -4.5;

        // Corpo do Contêiner Naval
        const containerBody = new THREE.Group();
        const roof = new THREE.Mesh(new THREE.BoxGeometry(length, 0.12, depth), yellowMat);
        roof.position.set(0, height, 0);
        const floor = new THREE.Mesh(new THREE.BoxGeometry(length, 0.18, depth), yellowMat);
        floor.position.set(0, 0.25, 0);

        const backWall = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.08), yellowMat);
        backWall.position.set(0, height / 2, -depth / 2);
        containerBody.add(roof, floor, backWall);

        // Frisos verticais do contêiner marítimo
        for (let x = -length / 2 + 0.3; x <= length / 2 - 0.3; x += 0.35) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, height - 0.1, 0.04), yellowMat);
            rib.position.set(x, height / 2, -depth / 2 - 0.03);
            containerBody.add(rib);
        }

        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, height, depth), yellowMat);
        leftWall.position.set(-length / 2, height / 2, 0);
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, height, depth), yellowMat);
        rightWall.position.set(length / 2, height / 2, 0);
        containerBody.add(leftWall, rightWall);

        // Parede frontal amarela
        const frontWall = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.08), yellowMat);
        frontWall.position.set(0, height / 2, depth / 2);
        containerBody.add(frontWall);

        // Portas de correr de vidro com esquadrias brancas (Foto 15 e 27)
        const doorFrame1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), whiteFrame);
        doorFrame1.position.set(-1.4, 1.15, depth / 2 + 0.04);
        const doorGlass1 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.95, 0.02), glassMat);
        doorGlass1.position.set(-1.4, 1.15, depth / 2 + 0.05);
        containerBody.add(doorFrame1, doorGlass1);

        const doorFrame2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), whiteFrame);
        doorFrame2.position.set(1.4, 1.15, depth / 2 + 0.04);
        const doorGlass2 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.95, 0.02), glassMat);
        doorGlass2.position.set(1.4, 1.15, depth / 2 + 0.05);
        containerBody.add(doorFrame2, doorGlass2);

        // Janela com moldura branca
        const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.95, 0.08), whiteFrame);
        winFrame.position.set(3.3, 1.6, depth / 2 + 0.04);
        const winGlass = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.8, 0.02), glassMat);
        winGlass.position.set(3.3, 1.6, depth / 2 + 0.05);
        containerBody.add(winFrame, winGlass);

        containerBody.position.set(posX, 0, posZ);
        contGroup.add(containerBody);

        // Torre com Caixa d'Água Azul Fortlev/Tigre na ponta traseira direita (Foto 27)
        const waterTankTower = new THREE.Group();
        const tankPoles = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.4, 1.3), new THREE.MeshStandardMaterial({ color: 0x374151 }));
        tankPoles.position.y = 1.7;
        const blueTank = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.65, 1.15, 16), new THREE.MeshStandardMaterial({ color: 0x0255b3, roughness: 0.35 }));
        blueTank.position.y = 3.8;
        waterTankTower.add(tankPoles, blueTank);
        waterTankTower.position.set(posX + length / 2 + 0.9, 0, posZ - 0.2);
        contGroup.add(waterTankTower);

        // --- VARANDA DO CONTÊINER (FOTO 15) ---
        const porchGroup = new THREE.Group();
        const porchW = length + 0.4;
        const porchD = 2.4;
        const porchZ = posZ + depth / 2 + porchD / 2;

        // Piso de cimento queimado ocre polido
        const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(porchW, 0.16, porchD), new THREE.MeshStandardMaterial({ color: 0xc49156, roughness: 0.38 }));
        porchFloor.position.set(posX, 0.27, porchZ);
        porchFloor.receiveShadow = true;
        porchGroup.add(porchFloor);

        // Tapete decorativo em ladrilho hidráulico no centro da varanda (Foto 12)
        const tileTex = createHydraulicTileTexture();
        const tileMatCenter = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.5 }));
        tileMatCenter.rotation.x = -Math.PI / 2;
        tileMatCenter.position.set(posX - 0.5, 0.36, porchZ);
        porchGroup.add(tileMatCenter);

        // Pilares de madeira maciça de sustentação da varanda
        const numPil = 5;
        for (let i = 0; i < numPil; i++) {
            const px = posX - porchW / 2 + 0.2 + (i / (numPil - 1)) * (porchW - 0.4);
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, height + 0.15, 0.18), postMat);
            pillar.position.set(px, (height + 0.15) / 2 + 0.25, porchZ + porchD / 2 - 0.1);
            pillar.castShadow = true;
            porchGroup.add(pillar);
        }

        // Guarda-corpo de madeira rústica de 2 réguas com peitoril largo (Foto 15)
        const handrail = new THREE.Mesh(new THREE.BoxGeometry(porchW - 0.4, 0.08, 0.16), woodMat);
        handrail.position.set(posX, 1.05, porchZ + porchD / 2 - 0.1);
        const midRail = new THREE.Mesh(new THREE.BoxGeometry(porchW - 0.4, 0.06, 0.1), woodMat);
        midRail.position.set(posX, 0.65, porchZ + porchD / 2 - 0.1);
        porchGroup.add(handrail, midRail);

        // Estrutura de Pergolado com Caibros e Ripas de Madeira Aparentes (Foto 15)
        const pergolaGroup = new THREE.Group();
        const vigaFrontal = new THREE.Mesh(new THREE.BoxGeometry(porchW + 0.2, 0.18, 0.12), postMat);
        vigaFrontal.position.set(posX, height + 0.25, porchZ + porchD / 2 - 0.1);
        pergolaGroup.add(vigaFrontal);

        // Caibros transversais de madeira projetando para frente
        for (let rx = posX - porchW / 2 + 0.2; rx <= posX + porchW / 2 - 0.2; rx += 0.45) {
            const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, porchD + 0.4), woodMat);
            rafter.position.set(rx, height + 0.32, porchZ);
            rafter.rotation.x = 0.05;
            rafter.castShadow = true;
            pergolaGroup.add(rafter);
        }

        // Telhas onduladas translúcidas sobre o pergolado
        const roofTranslucent = new THREE.Mesh(
            new THREE.BoxGeometry(porchW + 0.4, 0.04, porchD + 0.5),
            new THREE.MeshPhysicalMaterial({ color: 0xf3f4f6, transmission: 0.7, opacity: 0.5, transparent: true, roughness: 0.2 })
        );
        roofTranslucent.position.set(posX, height + 0.4, porchZ);
        roofTranslucent.rotation.x = 0.05;
        pergolaGroup.add(roofTranslucent);
        porchGroup.add(pergolaGroup);

        // Duas Cadeiras Adirondack na Varanda encostadas na parede amarela (Foto 15)
        function createVerandaChair(vx, vz) {
            const chair = new THREE.Group();
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.55), adirondackMat);
            seat.position.set(0, 0.32, 0);
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.04), adirondackMat);
            back.rotation.x = -0.28;
            back.position.set(0, 0.65, -0.22);
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.65), adirondackMat);
            armL.position.set(-0.3, 0.5, -0.05);
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.65), adirondackMat);
            armR.position.set(0.3, 0.5, -0.05);
            chair.add(seat, back, armL, armR);
            chair.position.set(vx, 0.28, vz);
            chair.castShadow = true;
            return chair;
        }
        porchGroup.add(createVerandaChair(posX - 2.8, porchZ - 0.4));
        porchGroup.add(createVerandaChair(posX - 1.8, porchZ - 0.4));

        // Treliça de madeira cruzada em X na lateral direita da varanda (Foto 15)
        const trellis = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 1.8), new THREE.MeshStandardMaterial({ color: 0x8a4d25, roughness: 0.7 }));
        trellis.position.set(posX + porchW / 2 - 0.1, 1.35, porchZ);
        porchGroup.add(trellis);

        // Redes de Descanso Coloridas
        function createHammock(x1, x2, z, colorHex) {
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(x1, 1.8, z),
                new THREE.Vector3(x1 + (x2 - x1) * 0.3, 0.75, z),
                new THREE.Vector3(x1 + (x2 - x1) * 0.7, 0.75, z),
                new THREE.Vector3(x2, 1.8, z)
            );
            const tube = new THREE.TubeGeometry(curve, 20, 0.18, 8, false);
            return new THREE.Mesh(tube, new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.85 }));
        }
        porchGroup.add(createHammock(posX + 0.3, posX + 2.8, porchZ + 0.3, 0x1f2937)); // Rede escura como na foto 13

        // Pendentes de fibra natural tipo cúpula com ripas de palha (Foto 15)
        [posX - 1.8, posX + 1.2].forEach(lx => {
            const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshStandardMaterial({ color: 0xd6a86c, roughness: 0.8 }));
            lantern.scale.set(1.0, 1.25, 1.0);
            lantern.position.set(lx, 2.2, porchZ);
            porchGroup.add(lantern);
        });

        // 3 Degraus vermelhos terracota de acesso à varanda (Foto 15)
        const stairMat = new THREE.MeshStandardMaterial({ color: 0x9e3124, roughness: 0.5 });
        for (let s = 0; s < 3; s++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.35), stairMat);
            step.position.set(posX - 3.2, 0.08 + s * 0.09, porchZ + porchD / 2 + 0.18 + s * 0.3);
            step.receiveShadow = true;
            porchGroup.add(step);
        }

        // Fonte ornamental clássica esculpida com bacia de água azul claro (Foto 15)
        const fountain = new THREE.Group();
        const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0xe5e0d8 }));
        const fBowl1 = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.22, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0x58b9c7 }));
        fBowl1.position.y = 0.36;
        const fPedestal2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.28, 12), new THREE.MeshStandardMaterial({ color: 0xe5e0d8 }));
        fPedestal2.position.y = 0.55;
        const fBowl2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.14, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x58b9c7 }));
        fBowl2.position.y = 0.72;
        fountain.add(fBase, fBowl1, fPedestal2, fBowl2);
        fountain.position.set(posX - 3.8, 0.25, porchZ + porchD / 2 + 0.6);
        porchGroup.add(fountain);

        // Jardim Tropical da Varanda (Guaimbé recortado, dracenas magenta, helicônias - Foto 15)
        const tropGarden = new THREE.Group();
        const philodendronMat = new THREE.MeshStandardMaterial({ color: 0x1f592b, roughness: 0.55 });
        const magentaMat = new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.6 });
        const greenUpMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });

        for (let gx = posX - 2.0; gx <= posX + 3.2; gx += 0.7) {
            // Guaimbé / Costela de Adão
            const plant = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.75, 6), philodendronMat);
            plant.position.set(gx, 0.35, porchZ + porchD / 2 + 0.45);
            plant.rotation.x = 0.2;
            tropGarden.add(plant);

            // Folhagens magenta/dracena vermelha (Foto 15)
            const redDracena = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 5), magentaMat);
            redDracena.position.set(gx + 0.25, 0.42, porchZ + porchD / 2 + 0.55);
            tropGarden.add(redDracena);
        }
        porchGroup.add(tropGarden);

        contGroup.add(porchGroup);
        scene.add(contGroup);
    }

    // Platô Elevado da Piscina com Talude, Pedra São Tomé, Cascata de Inox e Ombrelone
    function buildRaisedPoolWithSãoTomé() {
        const poolGroup = new THREE.Group();
        const yellowWallMat = new THREE.MeshStandardMaterial({ color: 0xdda538, roughness: 0.72 });
        const saoTomeTex = createSaoTomeTexture();
        const stoneMat = new THREE.MeshStandardMaterial({ map: saoTomeTex, roughness: 0.85 });
        const poolFiberMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25 });
        const stainlessMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, metalness: 0.95, roughness: 0.1 });

        const plateauW = 6.4;
        const plateauD = 5.2;
        const plateauH = 0.72;
        const posX = 3.6, posZ = 1.6;

        // Platô elevado em alvenaria amarela
        const retaining = new THREE.Mesh(new THREE.BoxGeometry(plateauW, plateauH, plateauD), yellowWallMat);
        retaining.position.set(posX, plateauH / 2, posZ);
        retaining.castShadow = true;
        retaining.receiveShadow = true;
        poolGroup.add(retaining);

        // Deck superior revestido com Pedra São Tomé
        const stoneDeck = new THREE.Mesh(new THREE.BoxGeometry(plateauW + 0.1, 0.08, plateauD + 0.1), stoneMat);
        stoneDeck.position.set(posX, plateauH + 0.04, posZ);
        stoneDeck.receiveShadow = true;
        poolGroup.add(stoneDeck);

        // Talude gramado frontal em declive suave
        const slopeGeo = new THREE.PlaneGeometry(plateauW, 1.8);
        const slopeMat = new THREE.MeshStandardMaterial({ color: 0x3d6b44, roughness: 0.95 });
        const slope = new THREE.Mesh(slopeGeo, slopeMat);
        slope.rotation.x = -Math.PI / 3.5;
        slope.position.set(posX, plateauH * 0.45, posZ + plateauD / 2 + 0.65);
        slope.receiveShadow = true;
        poolGroup.add(slope);

        // 5 Degraus de Dormentes de Madeira inseridos no talude (Fotos 13 e 27)
        const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.9 });
        for (let s = 0; s < 5; s++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.35), sleeperMat);
            step.position.set(posX, 0.12 + s * 0.12, posZ + plateauD / 2 + 1.1 - s * 0.25);
            step.receiveShadow = true;
            poolGroup.add(step);
        }

        // Cuba da Piscina de Fibra Azul (retângulo + prainha frontal semicircular com banco submerso - Foto 24)
        const poolW = 3.8, poolD = 2.4;
        const basin = new THREE.Mesh(new THREE.BoxGeometry(poolW, 0.35, poolD), poolFiberMat);
        basin.position.set(posX - 0.3, plateauH + 0.02, posZ - 0.3);
        poolGroup.add(basin);

        const shallowBeach = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.95, 0.28, 24, 1, false, 0, Math.PI), poolFiberMat);
        shallowBeach.rotation.x = Math.PI / 2;
        shallowBeach.position.set(posX - 0.3, plateauH + 0.03, posZ + poolD / 2 - 0.2);
        poolGroup.add(shallowBeach);

        // Borda boleada curva de Pedra São Tomé contornando a prainha (Foto 24)
        const radialCoping = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.12, 8, 24, Math.PI), stoneMat);
        radialCoping.rotation.x = Math.PI / 2;
        radialCoping.position.set(posX - 0.3, plateauH + 0.08, posZ + poolD / 2 - 0.2);
        poolGroup.add(radialCoping);

        // Água da Piscina Translúcida em Turquesa Cristalino
        const waterMat = new THREE.MeshPhysicalMaterial({
            color: 0x00d2eb,
            transmission: 0.88,
            opacity: 0.92,
            transparent: true,
            roughness: 0.05,
            ior: 1.33,
            reflectivity: 0.96
        });
        const water = new THREE.Mesh(new THREE.BoxGeometry(poolW - 0.1, 0.05, poolD - 0.1), waterMat);
        water.position.set(posX - 0.3, plateauH + 0.16, posZ - 0.3);
        animatedWaterMesh = water;
        poolGroup.add(water);

        const beachWater = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.05, 20, 1, false, 0, Math.PI), waterMat);
        beachWater.rotation.x = Math.PI / 2;
        beachWater.position.set(posX - 0.3, plateauH + 0.16, posZ + poolD / 2 - 0.2);
        poolGroup.add(beachWater);

        // Cascata em Arco de Aço Inox (Swan Neck Waterfall Spout, Foto 24 e 27)
        const archCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(posX - 1.8, plateauH + 0.1, posZ - 1.2),
            new THREE.Vector3(posX - 1.8, plateauH + 1.3, posZ - 0.7),
            new THREE.Vector3(posX - 1.3, plateauH + 1.0, posZ - 0.35)
        );
        const archGeo = new THREE.TubeGeometry(archCurve, 16, 0.05, 12, false);
        const spout = new THREE.Mesh(archGeo, stainlessMat);
        spout.castShadow = true;
        poolGroup.add(spout);

        // Jato de Água ativo da cascata
        const jetCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(posX - 1.3, plateauH + 0.98, posZ - 0.35),
            new THREE.Vector3(posX - 1.1, plateauH + 0.58, posZ - 0.15),
            new THREE.Vector3(posX - 0.9, plateauH + 0.17, posZ - 0.05)
        );
        const jet = new THREE.Mesh(new THREE.TubeGeometry(jetCurve, 12, 0.03, 8, false), waterMat);
        animatedWaterJet = jet;
        poolGroup.add(jet);

        // Ombrelone Azul Royal Aberto com Mesa Bistrô e Cadeiras (Fotos 13 e 23)
        const bistroGroup = new THREE.Group();
        const tableGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 }));
        tableGlass.position.y = 0.72;
        const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), stainlessMat);
        tableLeg.position.y = 0.36;
        bistroGroup.add(tableGlass, tableLeg);

        const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.35, 8), stainlessMat);
        umbrellaPole.position.y = 1.18;
        const umbrellaCanopy = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.58, 8), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 })); // Azul royal
        umbrellaCanopy.position.y = 2.15;
        umbrellaCanopy.castShadow = true;
        bistroGroup.add(umbrellaPole, umbrellaCanopy);

        for (let i = 0; i < 4; i++) {
            const ca = (i / 4) * Math.PI * 2;
            const chair = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.45), new THREE.MeshStandardMaterial({ color: 0x374151 }));
            chair.position.set(Math.cos(ca) * 0.75, 0.38, Math.sin(ca) * 0.75);
            bistroGroup.add(chair);
        }
        bistroGroup.position.set(posX + 2.0, plateauH + 0.08, posZ - 1.2);
        poolGroup.add(bistroGroup);

        // Vasos Cerâmicos Cônicos Marrons com Plantas Ornamentais (Foto 24 e 27)
        [[-2.8, 1.8], [2.8, 1.8], [2.8, -1.8]].forEach(([vx, vz]) => {
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 0.48, 12), new THREE.MeshStandardMaterial({ color: 0x7c3a1e }));
            pot.position.set(posX + vx, plateauH + 0.3, posZ + vz);
            const plant = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0x166534 }));
            plant.position.set(posX + vx, plateauH + 0.78, posZ + vz);
            poolGroup.add(pot, plant);
        });

        scene.add(poolGroup);
    }

    // Praça de Fogo com as 4 Cadeiras Adirondack e Pisadeiras de Dormente
    function buildFirePitWithAdirondacks() {
        const firePitGroup = new THREE.Group();
        const saoTomeTex = createSaoTomeTexture();
        const stoneMat = new THREE.MeshStandardMaterial({ map: saoTomeTex, roughness: 0.85 });
        const woodTex = createWoodTexture();
        const adirondackMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xaa7038, roughness: 0.65 });
        const pitCenterX = -0.2, pitCenterZ = 5.6;

        // Pátio poligonal em Pedra São Tomé irregular fiel à Foto 13 e 27
        const firePatio = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.55, 0.12, 16), stoneMat);
        firePatio.position.set(pitCenterX, 0.06, pitCenterZ);
        firePatio.scale.set(1.15, 1.0, 0.95);
        firePatio.receiveShadow = true;
        firePitGroup.add(firePatio);

        // Anel de pedra assentada da fogueira
        const pitRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.14, 12, 24), new THREE.MeshStandardMaterial({ color: 0xc4bcb0, roughness: 0.9 }));
        pitRing.rotation.x = Math.PI / 2;
        pitRing.position.set(pitCenterX, 0.16, pitCenterZ);
        pitRing.castShadow = true;
        firePitGroup.add(pitRing);

        const ashBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.98 }));
        ashBase.position.set(pitCenterX, 0.12, pitCenterZ);
        firePitGroup.add(ashBase);

        // Troncos de lenha cruzados na fogueira
        const woodLogMat = new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.9 });
        for (let l = 0; l < 6; l++) {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.65, 8), woodLogMat);
            log.rotation.z = Math.PI / 3;
            log.rotation.y = (l * Math.PI) / 3;
            log.position.set(pitCenterX, 0.24, pitCenterZ);
            firePitGroup.add(log);
        }

        // Brasas ardentes incandescentes
        const embers = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff3b00 }));
        embers.position.set(pitCenterX, 0.26, pitCenterZ);
        firePitGroup.add(embers);

        // Chamas animadas da fogueira (3 cones estilizados pulsantes)
        animatedFlameGroup = new THREE.Group();
        const flameMat1 = new THREE.MeshBasicMaterial({ color: 0xff7700, transparent: true, opacity: 0.85 });
        const flameMat2 = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.9 });
        const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 6), flameMat1);
        f1.position.y = 0.3;
        const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 6), flameMat2);
        f2.position.set(0.06, 0.25, 0.04);
        animatedFlameGroup.add(f1, f2);
        animatedFlameGroup.position.set(pitCenterX, 0.28, pitCenterZ);
        firePitGroup.add(animatedFlameGroup);

        // 4 Autênticas Cadeiras Adirondack Maciças (Fotos 13, 14 e 27)
        function createAdirondackChair(x, z, rotY) {
            const chair = new THREE.Group();

            // Assento inclinado para trás
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.68), adirondackMat);
            seat.rotation.x = 0.18;
            seat.position.set(0, 0.32, 0);

            // Encosto alto inclinado com ripas tipo leque
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.88, 0.05), adirondackMat);
            back.rotation.x = -0.35;
            back.position.set(0, 0.70, -0.30);

            // Braços horizontais largos característicos
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.78), adirondackMat);
            armL.position.set(-0.38, 0.54, -0.05);
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.78), adirondackMat);
            armR.position.set(0.38, 0.54, -0.05);

            // Pernas frontais verticais e pernas traseiras inclinadas
            const legF = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.36, 0.06), adirondackMat);
            legF.position.set(0, 0.18, 0.26);
            const legB = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.22, 0.06), adirondackMat);
            legB.position.set(0, 0.11, -0.34);

            chair.add(seat, back, armL, armR, legF, legB);
            chair.position.set(x, 0.12, z);
            chair.rotation.y = rotY;
            chair.castShadow = true;
            return chair;
        }

        // Posicionamento exato das 4 cadeiras ao redor da fogueira
        firePitGroup.add(createAdirondackChair(pitCenterX - 1.5, pitCenterZ - 0.4, 1.2));
        firePitGroup.add(createAdirondackChair(pitCenterX + 1.5, pitCenterZ - 0.4, -1.2));
        firePitGroup.add(createAdirondackChair(pitCenterX - 1.2, pitCenterZ + 1.4, 2.4));
        firePitGroup.add(createAdirondackChair(pitCenterX + 1.2, pitCenterZ + 1.4, -2.4));

        // Pisadeiras de dormentes de madeira na grama conectando fogueira, piscina e área gourmet
        const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3d2719, roughness: 0.95 });
        for (let s = 0; s < 5; s++) {
            const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.35), sleeperMat);
            sleeper.position.set(pitCenterX + 0.6 + s * 0.45, 0.08 + s * 0.08, pitCenterZ - 0.8 - s * 0.6);
            sleeper.receiveShadow = true;
            firePitGroup.add(sleeper);
        }
        for (let s = 0; s < 5; s++) {
            const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.35), sleeperMat);
            sleeper.position.set(pitCenterX - 0.6 - s * 0.5, 0.06, pitCenterZ - 0.8 - s * 0.7);
            sleeper.receiveShadow = true;
            firePitGroup.add(sleeper);
        }

        scene.add(firePitGroup);
    }

    // Vegetação Nativa, Bananeiras, Balanço e Represa do Jaguari
    function buildLandscapeAndReservoir() {
        const landGroup = new THREE.Group();

        // Balanço rústico de madeira com cordas no gramado (Foto 17)
        const swingGroup = new THREE.Group();
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x6e3d1f, roughness: 0.7 });
        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), beamMat);
        postL.position.set(-1.4, 1.6, 0);
        const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), beamMat);
        postR.position.set(1.4, 1.6, 0);
        const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 8), beamMat);
        topBar.rotation.z = Math.PI / 2;
        topBar.position.set(0, 3.1, 0);
        const seatBoard = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.32), beamMat);
        seatBoard.position.set(0, 0.75, 0);
        swingGroup.add(postL, postR, topBar, seatBoard);
        swingGroup.position.set(8.8, 0, 4.5);
        landGroup.add(swingGroup);

        // Bananeiras ornamentais e folhagens tropicais com iluminação de jardim (Fotos 23 e 27)
        const bananaMat = new THREE.MeshStandardMaterial({ color: 0x2e6b36, roughness: 0.6 });
        [
            [7.8, 0.5], [8.2, -1.8], [7.5, -3.8], [-7.5, -4.5], [-1.0, 7.8], [9.8, 1.8]
        ].forEach(([bx, bz]) => {
            const plant = new THREE.Group();
            for (let f = 0; f < 6; f++) {
                const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.8, 6), bananaMat);
                leaf.rotation.x = Math.PI / 3;
                leaf.rotation.y = (f / 6) * Math.PI * 2;
                leaf.position.y = 0.9;
                plant.add(leaf);
            }
            plant.position.set(bx, 0.1, bz);
            landGroup.add(plant);

            // Espetos de jardim iluminando a vegetação à noite (Fotos 13 e 14)
            const gLight = new THREE.PointLight(0x7ec850, 0.65, 3.8);
            gLight.position.set(bx, 0.3, bz);
            gardenLights.push(gLight);
            scene.add(gLight);
        });

        // Árvores da Mantiqueira ao fundo
        const treeMat = new THREE.MeshStandardMaterial({ color: 0x1b4329, roughness: 0.85 });
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.9 });
        [
            [-13, -9], [-15, 0], [13, -7], [15, 2], [14, 8], [-3, -13], [5, -14]
        ].forEach(([tx, tz]) => {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.2, 8), trunkMat);
            trunk.position.y = 1.1;
            const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3.5, 8), treeMat);
            foliage.position.y = 3.0;
            tree.add(trunk, foliage);
            tree.position.set(tx, 0, tz);
            landGroup.add(tree);
        });

        // Represa do Jaguari no horizonte
        const reservoirGeo = new THREE.PlaneGeometry(95, 35);
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

        // Deck Náutico Flutuante sobre Tambores Azuis (Foto 8)
        const dockGroup = new THREE.Group();
        const dockWood = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 2.2), new THREE.MeshStandardMaterial({ color: 0x8b542c, roughness: 0.6 }));
        dockWood.position.set(0, 0.1, 0);
        const rampWood = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 3.6), new THREE.MeshStandardMaterial({ color: 0x9e6236, roughness: 0.6 }));
        rampWood.position.set(0, 0.2, 2.4);
        rampWood.rotation.x = 0.08;
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

    // Cerca Perimetral com Alambrado, Mourões e Cerca Viva (Foto 24)
    function buildPerimeterFence() {
        const fenceGroup = new THREE.Group();
        const postMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.8 }); // Mourões de concreto
        const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x1e5e2e, roughness: 0.9 }); // Cerca viva densa

        // Cerca viva e mourões na lateral direita (ao lado da piscina)
        for (let z = -6.0; z <= 8.0; z += 2.0) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), postMat);
            post.position.set(8.2, 0.9, z);
            fenceGroup.add(post);

            const hedge = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 2.0), hedgeMat);
            hedge.position.set(8.5, 0.8, z);
            fenceGroup.add(hedge);
        }

        scene.add(fenceGroup);
    }

    // Hotspots Interativos Oficiais
    function buildHotspots() {
        const hotspotData = [
            {
                title: '🏊 Piscina com Cascata & Platô em Pedra São Tomé',
                desc: 'Piscina privativa em platô elevado revestido de legítima Pedra São Tomé, com cascata em arco de aço inox, prainha com degraus submersos, mesa bistrô com ombrelone azul royal e iluminação subaquática noturna.',
                pos: new THREE.Vector3(3.6, 1.4, 1.6)
            },
            {
                title: '🪵 Salão Gourmet Envidraçado com Fogão a Lenha',
                desc: 'Pavilhão com telhado colonial cerâmico de 4 águas, alvenaria amarela mostarda e fechamento panorâmico 100% blindex. Equipado com churrasqueira de tijolinho à vista, fogão a lenha acoplado com chapa de ferro e forno, bancada em granito São Gabriel, mesa rústica e lustre de roda de carroça.',
                pos: new THREE.Vector3(-3.8, 2.4, -3.2)
            },
            {
                title: '🔥 Praça de Fogo com Cadeiras Adirondack',
                desc: 'Fogueira de chão aconchegante em platô de Pedra São Tomé no gramado, cercada por 4 cadeiras Adirondack de madeira maciça e caminhos de dormentes rústicos sob um céu estrelado espetacular.',
                pos: new THREE.Vector3(-0.2, 0.9, 5.6)
            },
            {
                title: '🏡 Casa Contêiner Amarela & Varanda com Pergolado',
                desc: 'Contêiner naval amarelo mostarda com varanda coberta de vigas e caibros aparentes de madeira, piso com tapete central de ladrilho hidráulico, cadeiras Adirondack, redes de descanso, pendentes de palha e floreira tropical com fonte clássica.',
                pos: new THREE.Vector3(3.6, 2.0, -2.4)
            },
            {
                title: '⛵ Acesso à Represa do Jaguari & Píer Flutuante',
                desc: 'Localização privilegiada com rampa e espaço para lanchas com pergolado, píer flutuante de madeira para banho, caiaque, stand-up paddle ou ancoragem na represa de Piracaia.',
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
                    scene.background.setHex(0x060e18); // Noite estrelada profunda
                    scene.fog.color.setHex(0x060e18);
                    ambientLight.intensity = 0.14;
                    hemiLight.intensity = 0.18;
                    dirLight.intensity = 0.20;
                    interiorLight.intensity = 3.2;
                    if (wallSconceLight) wallSconceLight.intensity = 1.8;
                    poolLight.intensity = 3.4;
                    firePitLight.intensity = 3.6;
                    porchLights.forEach(l => l.intensity = 2.6);
                    gardenLights.forEach(l => l.intensity = 1.3);
                    if (lightModeText) lightModeText.textContent = 'Modo Diurno (Ensolarado)';
                } else {
                    scene.background.setHex(0x76b4ea); // Dia ensolarado
                    scene.fog.color.setHex(0x8bc2ee);
                    ambientLight.intensity = 0.35;
                    hemiLight.intensity = 0.65;
                    dirLight.intensity = 1.4;
                    interiorLight.intensity = 1.8;
                    if (wallSconceLight) wallSconceLight.intensity = 0.9;
                    poolLight.intensity = 2.6;
                    firePitLight.intensity = 2.4;
                    porchLights.forEach(l => l.intensity = 1.4);
                    gardenLights.forEach(l => l.intensity = 0.65);
                    if (lightModeText) lightModeText.textContent = 'Modo Noturno (Aconchego)';
                }
            });
        }

        document.getElementById('close-hotspot-btn')?.addEventListener('click', () => {
            document.getElementById('hotspot-info-box')?.classList.add('hidden');
        });

        document.getElementById('reset-cam-btn')?.addEventListener('click', () => {
            moveCameraTo(new THREE.Vector3(2.5, 7.2, 16.5), new THREE.Vector3(0, 1.2, 0));
        });

        // Presets de Câmera Alinhados com as Fotos Reais
        const presetButtons = document.querySelectorAll('.cam-preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                presetButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const preset = btn.getAttribute('data-preset');
                switch (preset) {
                    case 'geral':
                        // Visão panorâmica geral herói (Foto 27)
                        moveCameraTo(new THREE.Vector3(2.5, 7.2, 16.5), new THREE.Vector3(0, 1.2, 0));
                        break;
                    case 'piscina':
                        // Piscina, cascata e deck de Pedra São Tomé (Foto 24)
                        moveCameraTo(new THREE.Vector3(4.6, 2.6, 5.8), new THREE.Vector3(3.6, 1.1, 1.6));
                        break;
                    case 'fogao':
                        // Salão gourmet e fogão a lenha (Foto 2)
                        moveCameraTo(new THREE.Vector3(-3.8, 2.2, -0.8), new THREE.Vector3(-3.8, 1.6, -3.5));
                        break;
                    case 'fogo':
                        // Praça de fogo com cadeiras Adirondack e labaredas (Fotos 13 e 14)
                        moveCameraTo(new THREE.Vector3(-0.2, 2.4, 9.2), new THREE.Vector3(-0.2, 0.5, 5.6));
                        break;
                    case 'varanda':
                    case 'interior':
                        // Varanda de pergolado do contêiner amarelo (Foto 15)
                        moveCameraTo(new THREE.Vector3(1.5, 1.8, 0.4), new THREE.Vector3(3.6, 1.4, -2.3));
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

    // Loop de Animação com Água Ondulante, Cascata e Chamas Vivas
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

        // Animação dos anéis dos hotspots
        clickableHotspots.forEach(hp => {
            const ring = hp.children[1];
            if (ring) {
                const s = 1 + Math.sin(time) * 0.15;
                ring.scale.set(s, s, s);
            }
        });

        // Fogueira viva: labaredas oscilantes e luz cintilante
        if (animatedFlameGroup) {
            const flameScale = 1.0 + Math.sin(time * 9) * 0.22 + Math.cos(time * 15) * 0.12;
            animatedFlameGroup.scale.set(flameScale, flameScale * 1.1, flameScale);
            animatedFlameGroup.rotation.y = time * 2;
        }

        if (firePitLight) {
            const flicker = Math.sin(time * 8) * 0.42 + Math.cos(time * 14) * 0.25;
            firePitLight.intensity = (isNight ? 3.6 : 2.4) + flicker;
        }

        // Ondulação suave e reflexos da água da piscina
        if (animatedWaterMesh) {
            animatedWaterMesh.position.y = 0.72 + 0.16 + Math.sin(time * 1.6) * 0.008;
        }
        if (animatedWaterJet) {
            animatedWaterJet.scale.y = 1.0 + Math.sin(time * 4.0) * 0.03;
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
