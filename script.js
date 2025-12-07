// Three.js 및 애플리케이션 변수
let scene, camera, renderer;
let drawingGroup, drawingPlane;
let raycaster, mouse;
let isDrawing = false;
let isRotating = false;
let isMovingObjects = false;
let isCameraMode = false;
let currentPoints = [];
let currentLines = [];
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let cameraRotation = { theta: 0, phi: Math.PI / 4 };
let color = '#ff0000';
let brushSize = 5;
let drawingHeight = 0;
let heightGrid = null;
let currentPlane = 'horizontal';
let planePosition = { x: 0, y: 0, z: 0 };
let shapeIdCounter = 0;
let isEraserMode = false;
let isPointerMode = false;
let fontLoader = null;
let fonts = {};
let selectedObject = null;
let moveStartPoint = null;
let originalObjectPositions = [];
let objectInfoTimeout = null;
let keys = {};
let cameraMoveSpeed = 0.2;
let textureLoader = null;

// 도형 그리기 관련 변수
let isShapeDrawingMode = false;
let isDrawingShape = false;
let currentDrawingShape = null;
let shapeStartPoint = null;
let currentShapeType = 'rectangle';
let sizeDisplay = null;

// 페인트 관련 변수
let isPaintMode = false;
let paintSize = 3;
let paintShape = 'square';

// 카메라 회전 관련 변수
let cameraYaw = 0;
let cameraPitch = 0;
let cameraTarget = new THREE.Vector3();

// 펜 관련 변수 추가
let currentPenType = 'normal';
let penIdCounter = 0;

// 지형 관련 변수
let terrainIdCounter = 0;

// 되돌리기(Undo) 관련 변수
let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 50; // 최대 히스토리 개수

// 포인터 모드 관련 개선된 변수들
let isAreaSelecting = false;
let areaSelectStart = { x: 0, y: 0 };
let areaSelectEnd = { x: 0, y: 0 };
let selectedObjects = []; // 다중 선택된 객체들
let isMultiSelectMode = false; // 다중 선택 모드인지 여부

// 브리지 모드 관련 변수
let isBridgeMode = false;
let bridgeObjects = []; // 연결할 객체들
let bridgeIdCounter = 0;
let bridgeType = 'line'; // 연결 유형: line, curve, plane, cylinder, sphere
let bridgeWidth = 0.5;
let bridgeSegments = 12;
let bridgeOpacity = 0.7;

// 오디오 관련 변수
let isAudioMode = false;
let audioContext = null;
let audioAnalyser = null;
let audioSource = null;
let audioDataArray = null;
let isMicrophoneActive = false;
let isAudioPlaying = false;
let audioVisualizations = [];
let audioVisualizationIdCounter = 0;
let audioType = 'wave';
let audioSensitivity = 50;
let audioScale = 3;
let audioColorMode = 'spectrum';
let microphoneStream = null;
let audioFile = null;

// 회전 제어 관련 변수
let isObjectRotating = false;
let rotationAxis = 'y';

// --- 애니메이션 관련 변수 ---
let animationFrames = [];   // 캡처된 프레임 저장
let isAnimPlaying = false;  // 재생 중 여부
let currentFrameIdx = 0;    // 현재 재생 중인 프레임 인덱스
let animProgress = 0;       // 프레임 간 전환 진행도 (0.0 ~ 1.0)
let animStartTime = 0;      // 애니메이션 시작 시간

// --- 폴리곤 모델링 관련 변수 ---
let isPolygonMode = false;
let polygonPoints = [];       // 찍은 점들의 3D 좌표 저장
let polygonMarkers = [];      // 점을 표시하는 구체 메쉬들
let polygonLines = [];        // 점들을 잇는 선 메쉬들
let polygonGuideLine = null;  // 마우스를 따라다니는 가이드 선

// --- 스컬프팅 관련 변수 ---
let isSculptMode = false;
let isSculptingAction = false; // 실제 마우스로 변형 중인지 여부
let sculptTool = 'pull';       // 'pull' or 'push'
let sculptBrushMesh = null;    // 마우스 따라다니는 브러시 가이드

// --- 세부 조각(Detail Sculpting) 관련 변수 ---
let isDetailMode = false;
let detailTargetMesh = null;      // 현재 편집 중인 메쉬
let detailHelperGroup = null;     // 점(Points)과 선(Wireframe)을 담을 그룹
let selectedDetailVertex = null;  // 현재 드래그 중인 점(Helper Sphere)
let detailVertexIndex = -1;       // 현재 드래그 중인 점의 원본 Vertex 인덱스

// --- 동영상 관련 변수 ---
let videoIdCounter = 0;
let videoElements = []; // 생성된 video HTML 엘리먼트들을 관리

// --- MOUSE 시뮬레이션 관련 변수 ---
let isMouseMode = false;
let currentMouseTool = null; // 'mouse', 'cheese', 'trap'
let mouseAgents = []; // 활동 중인 쥐 객체 배열
let cheeseItems = []; // 배치된 치즈 객체 배열
let trapItems = [];   // 배치된 덫 객체 배열

// --- 배경 설정 관련 변수 ---
let bgCameraStream = null; // 카메라 스트림 저장
let bgVideoElement = null; // 카메라 영상용 비디오 태그

// --- Math 기능 관련 변수 ---
let mathMeshCounter = 0;

// --- 음성 인식 관련 변수 ---
let recognition = null;
let isVoiceListening = false;

// 애플리케이션 초기화
function init() {
    const canvas = document.getElementById('canvas');
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Drawing plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
        visible: false,
        side: THREE.DoubleSide 
    });
    drawingPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    drawingPlane.rotation.x = -Math.PI / 2;
    drawingPlane.position.set(0, 0, 0);
    scene.add(drawingPlane);
    
    // Drawing group
    drawingGroup = new THREE.Group();
    scene.add(drawingGroup);
    
    // Grid
    const gridHelper = new THREE.GridHelper(20, 40, 0x4a5568, 0x2d3748);
    scene.add(gridHelper);
    
    // Height grid (moveable)
    const heightGridGeometry = new THREE.PlaneGeometry(20, 20, 40, 40);
    const heightGridMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    heightGrid = new THREE.Mesh(heightGridGeometry, heightGridMaterial);
    heightGrid.rotation.x = -Math.PI / 2;
    heightGrid.position.y = 0;
    scene.add(heightGrid);
    
    // Axes
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0xffffff, 0.8);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.4);
    pointLight2.position.set(-10, 5, -10);
    scene.add(pointLight2);
    
    // Font loader
    fontLoader = new THREE.FontLoader();
    loadFonts();
    
    // Texture loader
    textureLoader = new THREE.TextureLoader();
    
    // Size display element
    sizeDisplay = document.getElementById('size-display');
    
    // 페인트 패널 리스너 추가
    document.getElementById('paintSize').addEventListener('input', (e) => {
        paintSize = parseFloat(e.target.value);
        document.getElementById('paintSizeValue').textContent = paintSize;
    });
    
    document.getElementById('paintShape').addEventListener('change', (e) => {
        paintShape = e.target.value;
    });
    
    // 브리지 패널 리스너 추가
    document.getElementById('bridgeWidth').addEventListener('input', (e) => {
        bridgeWidth = parseFloat(e.target.value);
        document.getElementById('bridgeWidthValue').textContent = bridgeWidth;
    });
    
    document.getElementById('bridgeSegments').addEventListener('input', (e) => {
        bridgeSegments = parseInt(e.target.value);
        document.getElementById('bridgeSegmentsValue').textContent = bridgeSegments;
    });
    
    document.getElementById('bridgeOpacity').addEventListener('input', (e) => {
        bridgeOpacity = parseFloat(e.target.value);
        document.getElementById('bridgeOpacityValue').textContent = bridgeOpacity;
    });
    
    document.getElementById('bridgeType').addEventListener('change', (e) => {
        bridgeType = e.target.value;
    });
    
    // 다중 객체 정보 패널 리스너 추가
    document.addEventListener('click', (e) => {
        const multiObjectInfo = document.getElementById('multi-object-info');
        if (!multiObjectInfo.contains(e.target) && e.target !== canvas) {
            closeMultiObjectInfo();
        }
    });
    
    // Event listeners
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', onWheel);
    
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    // UI listeners
    document.getElementById('colorPicker').addEventListener('change', (e) => {
        color = e.target.value;
    });
    
    document.getElementById('brushSize').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById('sizeValue').textContent = brushSize;
    });
    
    document.getElementById('planeSelector').addEventListener('change', (e) => {
        currentPlane = e.target.value;
        updatePlaneOrientation();
    });
    
    // Text panel listeners
    document.getElementById('textSize').addEventListener('input', (e) => {
        document.getElementById('textSizeValue').textContent = e.target.value;
    });
    
    document.getElementById('textDepth').addEventListener('input', (e) => {
        document.getElementById('textDepthValue').textContent = e.target.value;
    });
    
    // Image panel listeners
    document.getElementById('imageWidth').addEventListener('input', (e) => {
        document.getElementById('imageWidthValue').textContent = e.target.value;
    });
    
    document.getElementById('imageHeight').addEventListener('input', (e) => {
        document.getElementById('imageHeightValue').textContent = e.target.value;
    });
    
    // 브리지 모드 전용 이벤트 리스너 추가
    document.addEventListener('click', handleBridgeModeClick);
    
    // Close panels when clicking outside
    document.addEventListener('click', (e) => {
        const penPanel = document.getElementById('pen-panel');
        const mapPanel = document.getElementById('map-panel');
        const shapesPanel = document.getElementById('shapes-panel');
        const textPanel = document.getElementById('text-panel');
        const imagePanel = document.getElementById('image-panel');
        const paintPanel = document.getElementById('paint-panel');
        const bridgePanel = document.getElementById('bridge-panel');
        const ctrlShapesPanel = document.getElementById('ctrl-shapes-panel');
        const objectInfo = document.getElementById('object-info');
        const multiObjectInfo = document.getElementById('multi-object-info');
        const cameraControls = document.getElementById('cameraControlsInfo');
        
        if (!penPanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            penPanel.style.display = 'none';
        }
        
        if (!mapPanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            mapPanel.style.display = 'none';
        }
        
        if (!shapesPanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            shapesPanel.style.display = 'none';
        }
        
        if (!textPanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            textPanel.style.display = 'none';
        }
        
        if (!imagePanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            imagePanel.style.display = 'none';
        }
        
        if (!paintPanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            paintPanel.style.display = 'none';
        }
        
        // 브리지 모드에서는 브리지 패널이 닫히지 않도록 수정
        if (!isBridgeMode && !bridgePanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            bridgePanel.style.display = 'none';
        }
        
        if (!ctrlShapesPanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            ctrlShapesPanel.style.display = 'none';
        }
        
        // 객체 정보 패널은 클릭해도 닫히지 않도록 수정
        if (!objectInfo.contains(e.target) && e.target !== canvas) {
            closeObjectInfo();
        }
        
        if (!cameraControls.contains(e.target)) {
            cameraControls.style.display = 'none';
        }
    });

    // init() 함수 내부에 추가 (다른 이벤트 리스너들과 함께)

    // 오디오 파일 입력 리스너
    document.getElementById('audioFile').addEventListener('change', handleAudioFile);

    // 오디오 설정 리스너들
    document.getElementById('audioSensitivity').addEventListener('input', (e) => {
        audioSensitivity = parseInt(e.target.value);
        document.getElementById('audioSensitivityValue').textContent = audioSensitivity;
    });

    document.getElementById('audioScale').addEventListener('input', (e) => {
        audioScale = parseFloat(e.target.value);
        document.getElementById('audioScaleValue').textContent = audioScale;
    });

    document.getElementById('audioType').addEventListener('change', (e) => {
        audioType = e.target.value;
    });

    document.getElementById('audioColor').addEventListener('change', (e) => {
        audioColorMode = e.target.value;
    });

    // 패널 닫기 로직에 오디오 패널 추가
    document.addEventListener('click', (e) => {
        // 기존 코드에 추가
        const audioPanel = document.getElementById('audio-panel');
        
        if (!audioPanel.contains(e.target) && !e.target.closest('.menu-btn')) {
            audioPanel.style.display = 'none';
        }
    });
    
    // 초기 상태 저장
    saveState();
    
    animate();
}

// 브리지 모드 전용 클릭 핸들러
function handleBridgeModeClick(e) {
    if (!isBridgeMode) return;
    
    const bridgePanel = document.getElementById('bridge-panel');
    const canvas = document.getElementById('canvas');
    
    // 캔버스 클릭 시에도 브리지 패널이 유지되도록 함
    if (e.target === canvas) {
        // 브리지 패널을 유지하고 다른 패널만 닫음
        document.getElementById('pen-panel').style.display = 'none';
        document.getElementById('map-panel').style.display = 'none';
        document.getElementById('shapes-panel').style.display = 'none';
        document.getElementById('text-panel').style.display = 'none';
        document.getElementById('image-panel').style.display = 'none';
        document.getElementById('paint-panel').style.display = 'none';
        document.getElementById('ctrl-shapes-panel').style.display = 'none';
        closeObjectInfo();
        
        // 브리지 패널은 계속 표시
        bridgePanel.style.display = 'flex';
    }
}

// 되돌리기(Undo) 관련 함수들
function saveState() {
    // 현재 상태를 저장하기 전에, 히스토리 인덱스 이후의 상태는 제거
    if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
    }
    
    // 현재 drawingGroup의 상태를 저장
    const state = {
        children: [],
        audioVisualizations: []
    };
    
    // 각 객체를 복제하여 저장
    drawingGroup.children.forEach(child => {
        // 객체를 복제 (단순 참조가 아닌 실제 복사)
        const cloned = cloneObject(child);
        if (cloned) {
            state.children.push(cloned);
        }
    });
    
    // 히스토리 스택에 상태 추가
    historyStack.push(state);
    historyIndex++;
    
    // 히스토리 개수 제한
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
        historyIndex--;
    }

    audioVisualizations.forEach(viz => {
        const cloned = cloneObject(viz);
        if (cloned) {
            cloned.userData.isAudioVisualization = true;
            cloned.userData.audioType = viz.userData.audioType;
            state.audioVisualizations.push(cloned);
        }
    });

    // 되돌리기 버튼 상태 업데이트
    updateUndoButton();
}

function cloneObject(obj) {
    // 객체의 타입에 따라 다른 방식으로 복제
    if (obj.isGroup) {
        const group = new THREE.Group();
        group.name = obj.name;
        group.position.copy(obj.position);
        group.rotation.copy(obj.rotation);
        group.scale.copy(obj.scale);
        
        // userData 깊은 복사 (오디오 시각화 데이터 등 보존)
        group.userData = JSON.parse(JSON.stringify(obj.userData));
        
        // originalMaterial은 복사하지 않음 (새 객체는 선택되지 않은 상태여야 하므로)
        delete group.userData.originalMaterial;
        
        obj.children.forEach(child => {
            const clonedChild = cloneObject(child);
            if (clonedChild) {
                group.add(clonedChild);
            }
        });
        
        return group;
    } else if (obj.isMesh) {
        let geometry, material;
        
        // 지오메트리 복제
        if (obj.geometry) {
            geometry = obj.geometry.clone();
        }
        
        // 머티리얼 복제 (수정된 핵심 부분!)
        // 선택된 상태(파란색)라면, 현재 material이 아닌 저장된 originalMaterial을 복제해야 함
        const sourceMaterial = obj.userData.originalMaterial || obj.material;

        if (sourceMaterial) {
            if (Array.isArray(sourceMaterial)) {
                material = sourceMaterial.map(mat => mat.clone());
            } else {
                material = sourceMaterial.clone();
            }
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = obj.name;
        mesh.position.copy(obj.position);
        mesh.rotation.copy(obj.rotation);
        mesh.scale.copy(obj.scale);
        
        // userData 복사 하되 originalMaterial은 제외
        mesh.userData = JSON.parse(JSON.stringify(obj.userData));
        delete mesh.userData.originalMaterial;
        
        return mesh;
    } else if (obj.isLine) {
        const geometry = obj.geometry.clone();
        
        // 라인 머티리얼 복제 (수정된 부분)
        const sourceMaterial = obj.userData.originalMaterial || obj.material;
        const material = sourceMaterial.clone();
        
        const line = new THREE.Line(geometry, material);
        line.name = obj.name;
        line.position.copy(obj.position);
        line.rotation.copy(obj.rotation);
        line.scale.copy(obj.scale);
        
        // userData 복사
        line.userData = JSON.parse(JSON.stringify(obj.userData));
        delete line.userData.originalMaterial;
        
        return line;
    }
    
    return null;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState();
    }
}

function restoreState() {
    if (historyIndex >= 0 && historyIndex < historyStack.length) {
        const state = historyStack[historyIndex];
        
        // 현재 drawingGroup의 모든 자식 제거
        while (drawingGroup.children.length > 0) {
            const child = drawingGroup.children[0];
            drawingGroup.remove(child);
            
            // 메모리 해제
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }

        cleanupAudioVisualizations(); // 기존 시각화 정리
        state.audioVisualizations.forEach(viz => {
            drawingGroup.add(viz);
            audioVisualizations.push(viz);
        });
        
        // 저장된 상태로 복원
        state.children.forEach(child => {
            drawingGroup.add(child);
        });
        
        // 선택된 객체 해제
        deselectAllObjects();
        
        // 되돌리기 버튼 상태 업데이트
        updateUndoButton();
        
        showStatus('되돌리기 완료');
        setTimeout(hideStatus, 1500);
    }
}

function updateUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (historyIndex > 0) {
        undoBtn.disabled = false;
    } else {
        undoBtn.disabled = true;
    }
}

// 폰트 로딩 함수
function loadFonts() {
    const fontUrls = {
        helvetiker: 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
        optimer: 'https://threejs.org/examples/fonts/optimer_regular.typeface.json',
        gentilis: 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json',
        notosanskr: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/fonts/notosanskr_regular.typeface.json'
    };
    
    let loadedFonts = 0;
    const totalFonts = Object.keys(fontUrls).length;
    
    Object.keys(fontUrls).forEach(fontName => {
        fontLoader.load(
            fontUrls[fontName],
            (font) => {
                fonts[fontName] = font;
                loadedFonts++;
                
                if (loadedFonts === totalFonts) {
                    console.log('모든 폰트 로딩 완료');
                }
            },
            (xhr) => {
                console.log(`${fontName} 로딩 중: ${(xhr.loaded / xhr.total * 100)}%`);
            },
            (error) => {
                console.error(`폰트 로딩 실패: ${fontName}`, error);
                loadedFonts++;
                
                if (fontName === 'notosanskr') {
                    console.log('한글 폰트 로드 실패, Helvetiker로 대체');
                    fonts['notosanskr'] = fonts['helvetiker'];
                }
            }
        );
    });
    
    setTimeout(() => {
        if (loadedFonts < totalFonts) {
            console.warn('일부 폰트 로딩이 시간 초과되었습니다.');
            Object.keys(fontUrls).forEach(fontName => {
                if (!fonts[fontName]) {
                    fonts[fontName] = fonts['helvetiker'] || null;
                    console.log(`기본 폰트로 대체: ${fontName}`);
                }
            });
        }
    }, 10000);
}

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    // 카메라 모드에서 키 입력 처리
    if (isCameraMode) {
        handleCameraMovement();
    }
    
    renderer.render(scene, camera);

    function animate() {
    requestAnimationFrame(animate);
    
    // 카메라 모드에서 키 입력 처리
    if (isCameraMode) {
        handleCameraMovement();
    }
    
    // 오디오 시각화 업데이트
    if (audioVisualizations.length > 0 && (isMicrophoneActive || isAudioPlaying)) {
        updateAudioVisualizations();
    }

    // 선택된 객체 자동 회전 처리
    if (isObjectRotating && selectedObject) {
        const speedVal = document.getElementById('rotateSpeed').value;
        const speed = parseFloat(speedVal) * 0.005; // 속도 배율 조정
        const axis = document.getElementById('rotateAxis').value;
        
        if (axis === 'x' || axis === 'free') selectedObject.rotation.x += speed;
        if (axis === 'y' || axis === 'free') selectedObject.rotation.y += speed;
        if (axis === 'z' || axis === 'free') selectedObject.rotation.z += speed;
    }

    // ---  애니메이션 재생 로직 ---
    if (isAnimPlaying && animationFrames.length > 1) {
        updateAnimation();
    }

    // ---  MOUSE 시뮬레이션 업데이트 ---
    if (mouseAgents.length > 0) {
        updateMouseSimulation();
    }
    
    renderer.render(scene, camera);
}
}

// 카메라 이동 처리
function handleCameraMovement() {
    if (!isCameraMode) return;
    
    const moveSpeed = cameraMoveSpeed;
    
    // 카메라의 현재 방향 벡터 계산
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // 오른쪽 방향 벡터 계산
    const right = new THREE.Vector3();
    right.crossVectors(direction, camera.up).normalize();
    
    // 이동 처리
    if (keys['KeyW']) {
        camera.position.addScaledVector(direction, moveSpeed);
        cameraTarget.addScaledVector(direction, moveSpeed);
    }
    if (keys['KeyS']) {
        camera.position.addScaledVector(direction, -moveSpeed);
        cameraTarget.addScaledVector(direction, -moveSpeed);
    }
    if (keys['KeyA']) {
        camera.position.addScaledVector(right, -moveSpeed);
        cameraTarget.addScaledVector(right, -moveSpeed);
    }
    if (keys['KeyD']) {
        camera.position.addScaledVector(right, moveSpeed);
        cameraTarget.addScaledVector(right, moveSpeed);
    }
    if (keys['KeyQ']) {
        camera.position.y += moveSpeed;
        cameraTarget.y += moveSpeed;
    }
    if (keys['KeyE']) {
        camera.position.y -= moveSpeed;
        cameraTarget.y -= moveSpeed;
    }
    
    // 카메라가 타겟을 바라보도록 설정
    camera.lookAt(cameraTarget);
}

// 마우스 이벤트 핸들러 - 개선된 버전
function onMouseDown(event) {
    event.preventDefault();
    
    if (event.button === 2) {
        // 카메라 모드가 아닐 때만 마우스 우클릭으로 카메라 회전
        if (!isCameraMode) {
            isRotating = true;
            isDragging = true;
            lastMouse = { x: event.clientX, y: event.clientY };
            showStatus('카메라 회전 중...');
        }
        return;
    }
    
    // 카메라 모드에서는 마우스 왼쪽 드래그로 회전
    if (isCameraMode && event.button === 0) {
        isRotating = true;
        isDragging = true;
        lastMouse = { x: event.clientX, y: event.clientY };
        showStatus('카메라 회전 중...');
        return;
    }
    
    // 브리지 모드에서의 마우스 다운 처리
    if (isBridgeMode && event.button === 0) {
        // 객체 선택
        const selected = selectObjectOnClick(event);
        
        if (selected) {
            // 이미 선택된 객체인지 확인
            const index = bridgeObjects.indexOf(selected);
            if (index === -1) {
                // 새 객체 선택
                bridgeObjects.push(selected);
                applyBridgeSelectionEffect(selected);
                showStatus(`브리지 모드: ${bridgeObjects.length}개 객체 선택됨. 더 선택하거나 패널에서 연결 생성.`);
            } else {
                // 선택 해제
                bridgeObjects.splice(index, 1);
                removeBridgeSelectionEffect(selected);
                showStatus(`브리지 모드: ${bridgeObjects.length}개 객체 선택됨. 더 선택하거나 패널에서 연결 생성.`);
            }
        }
        return;
    }
    
    // 포인터 모드에서의 마우스 다운 처리
    if (isPointerMode && event.button === 0) {
        // 먼저 객체 선택 시도
        const selected = selectObjectOnClick(event);
        
        if (selected) {
            // Shift 키를 누르고 있으면 다중 선택 모드
            if (event.shiftKey) {
                // 이미 선택된 객체인지 확인
                const index = selectedObjects.indexOf(selected);
                if (index === -1) {
                    // 새 객체 선택
                    selectObjectForMultiSelection(selected);
                } else {
                    // 선택 해제
                    deselectObjectFromMultiSelection(selected);
                }
                isMultiSelectMode = selectedObjects.length > 0;
            } else {
                // 단일 선택 모드
                deselectAllObjects();
                selectedObject = selected;
                applySelectionEffect(selectedObject);
                isMultiSelectMode = false;
            }
            
            // 객체 이동 준비
            isMovingObjects = true;
            moveStartPoint = getIntersectionPoint(event);
            
            // 원래 위치 저장 - 수정된 부분
            if (isMultiSelectMode) {
                originalObjectPositions = selectedObjects.map(obj => obj.position.clone());
            } else if (selectedObject) {
                originalObjectPositions = [selectedObject.position.clone()];
            }
            
            showStatus(isMultiSelectMode ? 
                `${selectedObjects.length}개 객체 선택됨 - 드래그하여 이동` : 
                '객체 선택됨 - 드래그하여 이동');
        } else {
            // 객체가 선택되지 않았으면 영역 선택 시작
            startAreaSelection(event);
        }
        return;
    }
    
    // 페인트 모드
    if (isPaintMode && event.button === 0) {
        createPaintFill(event);
        return;
    }

    // --- 폴리곤 모드 로직 ---
    if (isPolygonMode && event.button === 0) {
        handlePolygonClick(event);
        return;
    }

    // --- 스컬프팅 시작 ---
    if (isSculptMode && event.button === 0) {
        isSculptingAction = true;
        sculptMesh(event); // 클릭 즉시 1회 적용
        saveState(); // 시작 전 상태 저장 (혹은 끝나고 저장하도록 로직 변경 가능)
        return;
    }

    // --- 세부 조각(Detail) 모드 로직 ---
    if (isDetailMode && event.button === 0) {
        handleDetailVertexClick(event);
        // 점을 클릭하지 않았더라도 화면 회전 등을 위해 return 하지 않고 흘려보낼 수도 있음.
        // 하지만 점을 클릭했다면 드래그 시작이므로 return
        if (selectedDetailVertex) return; 
    }

    // --- 동영상 재생/일시정지 제어 ---
    // 포인터 모드나 다른 도구 모드가 아닐 때 (또는 포인터 모드에서도 가능하게 하려면 조건 조정)
    if (!isShapeDrawingMode && !isPaintMode && !isBridgeMode && !isEraserMode && !isPolygonMode && !isSculptMode && !isDetailMode) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(drawingGroup.children);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            // 비디오 객체인지 확인 (userData에 저장된 비디오 엘리먼트가 있는지)
            if (object.userData && object.userData.videoElement) {
                const vid = object.userData.videoElement;
                if (vid.paused) {
                    vid.play();
                    showStatus('동영상 재생 ▶️');
                } else {
                    vid.pause();
                    showStatus('동영상 일시정지 ⏸️');
                }
                // 클릭 이벤트가 다른 로직(드래그 등)으로 넘어가지 않게 하려면 return
                // 하지만 이동도 해야한다면 return 하지 않음.
                // 여기서는 재생 컨트롤만 하고 이동 로직으로 넘어가도록 둠.
            }
        }
    }

    // --- MOUSE 아이템 배치 로직 ---
    if (isMouseMode && event.button === 0) {
        spawnMouseItem(event);
        return;
    }
    
    // 도형 그리기 모드
    if (isShapeDrawingMode && event.button === 0) {
        startShapeDrawing(event);
        return;
    }
    
    // Eraser mode
    if (isEraserMode) {
        eraseObject(event);
        return;
    }
    
    // Drawing mode
    const point = getIntersectionPoint(event);
    if (point) {
        isDrawing = true;
        currentPoints = [point.clone()];
        currentLines = [];
        showStatus('그리는 중...');
    }
}

function onMouseMove(event) {
    event.preventDefault();
    
    // 브리지 모드에서의 마우스 이동 처리
    if (isBridgeMode) {
        // 객체 위에 호버링 시 하이라이트
        highlightObjectOnHover(event);
        return;
    }
    
    // 포인터 모드에서의 마우스 이동 처리
    if (isPointerMode) {
        // 영역 선택 중인 경우
        if (isAreaSelecting) {
            updateAreaSelection(event);
            return;
        }
        
        // 객체 이동 중인 경우
        if (isMovingObjects && moveStartPoint) {
            moveObjects(event);
            return;
        }
        
        // 객체 위에 호버링 시 하이라이트
        highlightObjectOnHover(event);
        return;
    }
    
    if (isDragging && isRotating) {
        const deltaX = event.clientX - lastMouse.x;
        const deltaY = event.clientY - lastMouse.y;
        
        if (isCameraMode) {
            // 카메라 모드에서는 자유로운 카메라 회전
            updateCameraRotation(deltaX, deltaY);
        } else {
            // 일반 모드에서는 원점 중심 회전
            cameraRotation.theta -= deltaX * 0.01;
            cameraRotation.phi += deltaY * 0.01;
            cameraRotation.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraRotation.phi));
            
            const radius = 12;
            camera.position.x = radius * Math.sin(cameraRotation.phi) * Math.cos(cameraRotation.theta);
            camera.position.y = radius * Math.cos(cameraRotation.phi);
            camera.position.z = radius * Math.sin(cameraRotation.phi) * Math.sin(cameraRotation.theta);
            camera.lookAt(0, 0, 0);
        }
        
        lastMouse = { x: event.clientX, y: event.clientY };
        return;
    }

    // 폴리곤 가이드 라인 업데이트 ---
    if (isPolygonMode && polygonPoints.length > 0) {
        updatePolygonGuide(event);
    }

    // --- 스컬프팅 드래그 및 브러시 표시 ---
    if (isSculptMode) {
        updateSculptBrush(event); // 브러시 위치 업데이트
        
        if (isSculptingAction) {
            sculptMesh(event); // 드래그 중 변형 적용
        }
        return; // 스컬프팅 중에는 다른 동작 차단
    }

    // --- 세부 조각(Detail) 드래그 ---
    if (isDetailMode && selectedDetailVertex) {
        moveDetailVertex(event);
        return;
    }
    
    // 세부 조각 모드일 때 마우스 오버 효과 (점 하이라이트 등)
    if (isDetailMode && !selectedDetailVertex) {
        highlightDetailVertex(event);
    }
    
    // 도형 그리기 모드
    if (isShapeDrawingMode && isDrawingShape && shapeStartPoint && currentShapeType) {
        updateShapeDrawing(event);
        return;
    }
    
    if (!isDrawing || isEraserMode || isPointerMode || isCameraMode || isShapeDrawingMode || isPaintMode || isBridgeMode) return;
    
    const point = getIntersectionPoint(event);
    if (point && currentPoints.length > 0) {
        const lastPoint = currentPoints[currentPoints.length - 1];
        const distance = point.distanceTo(lastPoint);
        
        if (distance > 0.05) {
            currentPoints.push(point.clone());
            
            // 기존 라인들 제거
            currentLines.forEach(line => {
                drawingGroup.remove(line);
                line.geometry.dispose();
                line.material.dispose();
            });
            currentLines = [];
            
            // 펜 타입에 따라 다른 방식으로 그리기
            if (currentPoints.length >= 2) {
                switch(currentPenType) {
                    case 'normal':
                        createNormalPen();
                        break;
                    case 'double':
                        createDoublePen();
                        break;
                    case 'dotted':
                        createDottedPen();
                        break;
                    case 'dashed':
                        createDashedPen();
                        break;
                    case 'variable':
                        createVariablePen();
                        break;
                    case 'wave':
                        createWavePen();
                        break;
                    case 'zigzag':
                        createZigzagPen();
                        break;
                    case 'spiral':
                        createSpiralPen();
                        break;
                }
            }
        }
    }
}

function onMouseUp(event) {
    event.preventDefault();
    
    // 브리지 모드에서의 마우스 업 처리
    if (isBridgeMode) {
        // 특별한 처리 없음
        return;
    }
    
    // 포인터 모드에서의 마우스 업 처리
    if (isPointerMode) {
        // 영역 선택 종료
        if (isAreaSelecting) {
            endAreaSelection();
        }
        
        // 객체 이동 종료
        if (isMovingObjects) {
            endObjectMove();
            saveState(); // 상태 저장
        }
        
        isMovingObjects = false;
        moveStartPoint = null;
        
        // 객체 정보 표시
        if (isMultiSelectMode && selectedObjects.length > 0) {
            showMultiObjectInfo();
        } else if (selectedObject && !isAreaSelecting) {
            showObjectInfo(selectedObject);
        }
        
        return;
    }

    // ---  세부 조각 종료 ---
    if (isDetailMode) {
        if (selectedDetailVertex) {
            selectedDetailVertex = null;
            detailVertexIndex = -1;
            saveState(); // 변형 후 상태 저장
        }
        // return; // 회전을 위해 return 하지 않음
    }

    // --- 스컬프팅 종료 ---
    if (isSculptMode) {
        isSculptingAction = false;
        // 중요: 여기서 return을 제거해야 아래의 회전 정지 코드가 실행됩니다.
    }
    
    // 회전 및 드래그 종료 (스컬프팅 모드여도 이 코드가 실행되어야 함)
    if (isDragging) {
        isDragging = false;
        isRotating = false;
    }
    
    // 도형 그리기 종료
    if (isShapeDrawingMode && isDrawingShape) {
        endShapeDrawing();
        saveState(); // 상태 저장
    }
    
    // 펜 그리기 종료
    if (isDrawing) {
        isDrawing = false;
        currentPoints = [];
        currentLines = [];
        saveState(); // 상태 저장
    }
    
    hideStatus();
    hideSizeDisplay();
}

// 브리지 모드 관련 함수들
function toggleBridgeMode() {
    isBridgeMode = !isBridgeMode;
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isPaintMode = false;
    
    const bridgeBtn = document.getElementById('bridgeBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const pointerBtn = document.getElementById('pointerBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const shapeDrawBtn = document.getElementById('shapeDrawBtn');
    const paintBtn = document.getElementById('paintBtn');
    const canvas = document.getElementById('canvas');
    const modeIndicator = document.getElementById('modeIndicator');
    const bridgePanel = document.getElementById('bridge-panel');
    
    if (isBridgeMode) {
        bridgeBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        pointerBtn.classList.remove('active');
        cameraBtn.classList.remove('active');
        shapeDrawBtn.classList.remove('active');
        paintBtn.classList.remove('active');
        canvas.classList.add('bridge-mode');
        canvas.classList.remove('eraser-mode');
        canvas.classList.remove('pointer-mode');
        canvas.classList.remove('moving-mode');
        canvas.classList.remove('camera-mode');
        canvas.classList.remove('shape-drawing-mode');
        canvas.classList.remove('paint-mode');
        modeIndicator.textContent = '브리지 모드';
        bridgePanel.style.display = 'flex';
        
        // 기존 선택 해제
        deselectAllObjects();
        
        showStatus('브리지 모드: 연결할 객체들을 클릭하여 선택하세요');
    } else {
        bridgeBtn.classList.remove('active');
        canvas.classList.remove('bridge-mode');
        modeIndicator.textContent = '드로잉 모드';
        bridgePanel.style.display = 'none';
        hideStatus();
        
        // 브리지 모드 종료 시 선택 해제
        clearBridgeSelections();
    }
    
    document.getElementById('cameraControlsInfo').style.display = 'none';
    hideCtrlShapesPanel();
}

function toggleBridgePanel() {
    const panel = document.getElementById('bridge-panel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    
    // 다른 패널 닫기
    document.getElementById('pen-panel').style.display = 'none';
    document.getElementById('map-panel').style.display = 'none';
    document.getElementById('shapes-panel').style.display = 'none';
    document.getElementById('text-panel').style.display = 'none';
    document.getElementById('image-panel').style.display = 'none';
    document.getElementById('paint-panel').style.display = 'none';
    document.getElementById('ctrl-shapes-panel').style.display = 'none';
    closeObjectInfo();
}

function applyBridgeSelectionEffect(object) {
    // 원본 머티리얼 저장
    if (!object.userData.originalMaterial) {
        object.userData.originalMaterial = object.material;
    }
    
    // 브리지 선택 효과 적용
    const bridgeMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x8b5cf6),
        emissive: new THREE.Color(0x8b5cf6),
        emissiveIntensity: 0.3,
        transparent: false
    });
    
    object.material = bridgeMaterial;
}

function removeBridgeSelectionEffect(object) {
    // 원래 머티리얼 복원
    if (object.userData.originalMaterial) {
        object.material = object.userData.originalMaterial;
    }
}

function clearBridgeSelections() {
    // 모든 브리지 선택 해제
    bridgeObjects.forEach(object => {
        removeBridgeSelectionEffect(object);
    });
    bridgeObjects = [];
}

function createBridge() {
    if (bridgeObjects.length < 2) {
        showStatus('브리지를 생성하려면 최소 2개의 객체를 선택해야 합니다.');
        return;
    }
    
    // 브리지 생성
    let bridgeMesh;
    
    switch(bridgeType) {
        case 'line':
            bridgeMesh = createLineBridge();
            break;
        case 'curve':
            bridgeMesh = createCurveBridge();
            break;
        case 'plane':
            bridgeMesh = createPlaneBridge();
            break;
        case 'cylinder':
            bridgeMesh = createCylinderBridge();
            break;
        case 'sphere':
            bridgeMesh = createSphereBridge();
            break;
    }
    
    if (bridgeMesh) {
        bridgeMesh.name = `bridge_${bridgeIdCounter++}`;
        drawingGroup.add(bridgeMesh);
        
        // 브리지 선택 해제
        clearBridgeSelections();
        
        // 브리지 패널을 계속 표시
        document.getElementById('bridge-panel').style.display = 'flex';
        showStatus('브리지가 생성되었습니다.');
        saveState(); // 상태 저장
    }
}

function createLineBridge() {
    // 두 객체 사이의 직선 연결 생성
    if (bridgeObjects.length !== 2) {
        showStatus('직선 연결은 정확히 2개의 객체만 선택해야 합니다.');
        return null;
    }
    
    const obj1 = bridgeObjects[0];
    const obj2 = bridgeObjects[1];
    
    const points = [
        obj1.position.clone(),
        obj2.position.clone()
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: bridgeWidth * 10
    });
    
    return new THREE.Line(geometry, material);
}

function createCurveBridge() {
    // 두 객체 사이의 곡선 연결 생성
    if (bridgeObjects.length !== 2) {
        showStatus('곡선 연결은 정확히 2개의 객체만 선택해야 합니다.');
        return null;
    }
    
    const obj1 = bridgeObjects[0];
    const obj2 = bridgeObjects[1];
    
    // 중간 제어점 계산 (객체 사이의 중간점에서 약간 위로)
    const midPoint = new THREE.Vector3()
        .addVectors(obj1.position, obj2.position)
        .multiplyScalar(0.5);
    midPoint.y += 2; // 곡선 높이
    
    const curve = new THREE.QuadraticBezierCurve3(
        obj1.position.clone(),
        midPoint,
        obj2.position.clone()
    );
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: bridgeWidth * 10
    });
    
    return new THREE.Line(geometry, material);
}

function createPlaneBridge() {
    // 여러 객체를 포함하는 평면 생성
    if (bridgeObjects.length < 3) {
        showStatus('평면 채우기는 최소 3개의 객체를 선택해야 합니다.');
        return null;
    }
    
    // 객체들의 위치를 기반으로 평면 생성
    const positions = bridgeObjects.map(obj => obj.position.clone());
    
    // 중심점 계산
    const center = new THREE.Vector3();
    positions.forEach(pos => center.add(pos));
    center.divideScalar(positions.length);
    
    // 평면 생성 (단순화된 구현)
    const geometry = new THREE.PlaneGeometry(5, 5, 10, 10);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: bridgeOpacity
    });
    
    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(center);
    
    // 평면을 객체들의 평균 높이로 설정
    plane.position.y = center.y;
    
    return plane;
}

function createCylinderBridge() {
    // 두 객체 사이의 실린더 연결 생성
    if (bridgeObjects.length !== 2) {
        showStatus('실린더 연결은 정확히 2개의 객체만 선택해야 합니다.');
        return null;
    }
    
    const obj1 = bridgeObjects[0];
    const obj2 = bridgeObjects[1];
    
    // 두 객체 사이의 거리 계산
    const distance = obj1.position.distanceTo(obj2.position);
    
    // 실린더 생성
    const geometry = new THREE.CylinderGeometry(
        bridgeWidth, 
        bridgeWidth, 
        distance, 
        bridgeSegments
    );
    
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: bridgeOpacity
    });
    
    const cylinder = new THREE.Mesh(geometry, material);
    
    // 실린더 위치와 회전 설정
    const center = new THREE.Vector3()
        .addVectors(obj1.position, obj2.position)
        .multiplyScalar(0.5);
    
    cylinder.position.copy(center);
    
    // 실린더를 두 객체를 연결하는 방향으로 회전
    const direction = new THREE.Vector3()
        .subVectors(obj2.position, obj1.position)
        .normalize();
    
    cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
    );
    
    return cylinder;
}

function createSphereBridge() {
    // 여러 객체를 포함하는 구체 생성
    if (bridgeObjects.length < 2) {
        showStatus('구체 연결은 최소 2개의 객체를 선택해야 합니다.');
        return null;
    }
    
    // 객체들의 위치를 기반으로 구체 생성
    const positions = bridgeObjects.map(obj => obj.position.clone());
    
    // 중심점과 반경 계산
    const center = new THREE.Vector3();
    positions.forEach(pos => center.add(pos));
    center.divideScalar(positions.length);
    
    let maxDistance = 0;
    positions.forEach(pos => {
        const distance = pos.distanceTo(center);
        if (distance > maxDistance) maxDistance = distance;
    });
    
    // 최소 반경 보장
    const radius = Math.max(maxDistance, 1);
    
    // 구체 생성
    const geometry = new THREE.SphereGeometry(
        radius, 
        bridgeSegments, 
        bridgeSegments
    );
    
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: bridgeOpacity,
        wireframe: false
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(center);
    
    return sphere;
}

// 포인터 모드 관련 개선된 함수들

// 클릭으로 객체 선택
function selectObjectOnClick(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // 모든 그려진 객체와 충돌 검사
    const intersects = raycaster.intersectObjects(drawingGroup.children, true);
    
    if (intersects.length > 0) {
        const selected = intersects[0].object;
        
        // 부모 객체 찾기
        let parentObject = selected;
        if (selected.parent && selected.parent !== drawingGroup) {
            parentObject = selected.parent;
        }
        
        return parentObject;
    }
    return null;
}

// 호버링 시 객체 하이라이트
function highlightObjectOnHover(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(drawingGroup.children, true);
    
    // 모든 객체의 하이라이트 제거
    drawingGroup.children.forEach(child => {
        if (child.userData.originalMaterial && 
            !selectedObjects.includes(child) && 
            child !== selectedObject &&
            !bridgeObjects.includes(child)) {
            child.material = child.userData.originalMaterial;
        }
    });
    
    // 호버링된 객체 하이라이트
    if (intersects.length > 0) {
        const hovered = intersects[0].object;
        let parentObject = hovered;
        if (hovered.parent && hovered.parent !== drawingGroup) {
            parentObject = hovered.parent;
        }
        
        // 이미 선택된 객체가 아니면 하이라이트
        if (!selectedObjects.includes(parentObject) && 
            parentObject !== selectedObject &&
            !bridgeObjects.includes(parentObject)) {
            if (!parentObject.userData.originalMaterial) {
                parentObject.userData.originalMaterial = parentObject.material;
            }
            
            // 이미지 객체는 하이라이트 효과를 다르게 적용
            if (parentObject.name.startsWith('image_')) {
                const highlightMaterial = new THREE.MeshBasicMaterial({
                    map: parentObject.userData.originalMaterial.map,
                    side: THREE.DoubleSide,
                    transparent: false,
                    color: new THREE.Color(0x60a5fa)
                });
                parentObject.material = highlightMaterial;
            } else {
                const highlightMaterial = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0x60a5fa),
                    emissive: new THREE.Color(0x60a5fa),
                    emissiveIntensity: 0.2,
                    transparent: false
                });
                parentObject.material = highlightMaterial;
            }
        }
    }
}

// 객체 선택 효과 적용
function applySelectionEffect(object) {
    // 원본 머티리얼 저장
    if (!object.userData.originalMaterial) {
        object.userData.originalMaterial = object.material;
    }
    
    // 이미지 객체는 선택 효과를 다르게 적용
    if (object.name.startsWith('image_')) {
        const outlineMaterial = new THREE.MeshBasicMaterial({
            map: object.userData.originalMaterial.map,
            side: THREE.DoubleSide,
            transparent: false,
            color: new THREE.Color(0x3b82f6)
        });
        
        object.material = outlineMaterial;
    } else {
        // 일반 객체는 기존 방식 유지
        const outlineMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x3b82f6),
            emissive: new THREE.Color(0x3b82f6),
            emissiveIntensity: 0.3,
            transparent: false
        });
        
        object.material = outlineMaterial;
    }
}

// 다중 선택을 위한 객체 선택
function selectObjectForMultiSelection(object) {
    // 이미 선택된 객체인지 확인
    if (selectedObjects.includes(object)) {
        return;
    }
    
    // 객체 선택
    selectedObjects.push(object);
    
    // 선택 효과 적용
    applySelectionEffect(object);
}

// 다중 선택에서 객체 제거
function deselectObjectFromMultiSelection(object) {
    const index = selectedObjects.indexOf(object);
    if (index !== -1) {
        // 원래 머티리얼 복원
        if (object.userData.originalMaterial) {
            object.material = object.userData.originalMaterial;
        }
        
        selectedObjects.splice(index, 1);
    }
}

// 모든 객체 선택 해제
function deselectAllObjects() {
    // 단일 선택 객체 해제
    if (selectedObject) {
        if (selectedObject.userData.originalMaterial) {
            selectedObject.material = selectedObject.userData.originalMaterial;
        }
        selectedObject = null;
    }
    
    // 다중 선택 객체들 해제
    selectedObjects.forEach(object => {
        if (object.userData.originalMaterial) {
            object.material = object.userData.originalMaterial;
        }
    });
    
    selectedObjects = [];
    isMultiSelectMode = false;
    
    closeObjectInfo();
    closeMultiObjectInfo();
}

// 객체 이동 - 수정된 부분
function moveObjects(event) {
    const point = getIntersectionPoint(event);
    if (point && moveStartPoint) {
        const delta = new THREE.Vector3();
        delta.subVectors(point, moveStartPoint);
        
        // 현재 평면에 따라 이동 방향 결정
        let moveDelta;
        if (currentPlane === 'horizontal') {
            // XZ 평면: X와 Z만 이동
            moveDelta = new THREE.Vector3(delta.x, 0, delta.z);
        } else if (currentPlane === 'vertical-x') {
            // YZ 평면: Y와 Z만 이동
            moveDelta = new THREE.Vector3(0, delta.y, delta.z);
        } else if (currentPlane === 'vertical-z') {
            // XY 평면: X와 Y만 이동
            moveDelta = new THREE.Vector3(delta.x, delta.y, 0);
        }
        
        // 다중 객체 이동 - 수정된 부분
        if (isMultiSelectMode && selectedObjects.length > 0) {
            selectedObjects.forEach((object, index) => {
                if (originalObjectPositions[index]) {
                    // 각 객체의 원래 위치에 이동 벡터를 더함
                    const newPosition = new THREE.Vector3().copy(originalObjectPositions[index]).add(moveDelta);
                    object.position.copy(newPosition);
                }
            });
        } 
        // 단일 객체 이동
        else if (selectedObject && originalObjectPositions[0]) {
            const newPosition = new THREE.Vector3().copy(originalObjectPositions[0]).add(moveDelta);
            selectedObject.position.copy(newPosition);
        }
    }
}

// 객체 이동 종료
function endObjectMove() {
    isMovingObjects = false;
    moveStartPoint = null;
    originalObjectPositions = [];
    
    showStatus(isMultiSelectMode ? 
        `${selectedObjects.length}개 객체 이동 완료` : 
        '객체 이동 완료');
}

// 객체 이동 취소
function cancelObjectMove() {
    if (isMovingObjects) {
        // 객체들을 원래 위치로 되돌림
        if (isMultiSelectMode) {
            selectedObjects.forEach((object, index) => {
                if (originalObjectPositions[index]) {
                    object.position.copy(originalObjectPositions[index]);
                }
            });
        } else if (selectedObject && originalObjectPositions[0]) {
            selectedObject.position.copy(originalObjectPositions[0]);
        }
        
        isMovingObjects = false;
        moveStartPoint = null;
        originalObjectPositions = [];
        
        showStatus('객체 이동이 취소되었습니다.');
    }
}

// 다중 객체 이동 시작
function startMovingMultiObjects() {
    if (selectedObjects.length === 0) {
        showStatus('이동할 객체를 선택해주세요.');
        return;
    }
    
    isMovingObjects = true;
    isMultiSelectMode = true;
    
    // 현재 마우스 위치를 시작점으로 설정
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((rect.width / 2) / rect.width) * 2 - 1;
    mouse.y = -((rect.height / 2) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(drawingPlane);
    
    if (intersects.length > 0) {
        moveStartPoint = intersects[0].point;
    } else {
        moveStartPoint = new THREE.Vector3(0, 0, 0);
    }
    
    // 모든 선택된 객체의 원래 위치 저장
    originalObjectPositions = selectedObjects.map(obj => obj.position.clone());
    
    showStatus(`${selectedObjects.length}개 객체 이동 모드: 드래그하여 이동`);
}

// 단일 객체 이동 시작
function startMovingObject() {
    if (!selectedObject) {
        showStatus('이동할 객체를 선택해주세요.');
        return;
    }
    
    isMovingObjects = true;
    isMultiSelectMode = false;
    
    // 현재 마우스 위치를 시작점으로 설정
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((rect.width / 2) / rect.width) * 2 - 1;
    mouse.y = -((rect.height / 2) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(drawingPlane);
    
    if (intersects.length > 0) {
        moveStartPoint = intersects[0].point;
    } else {
        moveStartPoint = new THREE.Vector3(0, 0, 0);
    }
    
    // 객체의 원래 위치 저장
    originalObjectPositions = [selectedObject.position.clone()];
    
    showStatus('객체 이동 모드: 드래그하여 이동');
}

// 영역 선택 시작
function startAreaSelection(event) {
    const rect = canvas.getBoundingClientRect();
    areaSelectStart.x = event.clientX - rect.left;
    areaSelectStart.y = event.clientY - rect.top;
    
    isAreaSelecting = true;
    
    // 선택 영역 표시
    const selectionArea = document.getElementById('selection-area');
    selectionArea.style.display = 'block';
    selectionArea.style.left = areaSelectStart.x + 'px';
    selectionArea.style.top = areaSelectStart.y + 'px';
    selectionArea.style.width = '0px';
    selectionArea.style.height = '0px';
    
    // 기존 선택 해제
    deselectAllObjects();
    
    showStatus('영역 선택 중: 드래그하여 여러 객체 선택');
}

// 영역 선택 업데이트
function updateAreaSelection(event) {
    const rect = canvas.getBoundingClientRect();
    areaSelectEnd.x = event.clientX - rect.left;
    areaSelectEnd.y = event.clientY - rect.top;
    
    // 선택 영역 업데이트
    const selectionArea = document.getElementById('selection-area');
    const left = Math.min(areaSelectStart.x, areaSelectEnd.x);
    const top = Math.min(areaSelectStart.y, areaSelectEnd.y);
    const width = Math.abs(areaSelectEnd.x - areaSelectStart.x);
    const height = Math.abs(areaSelectEnd.y - areaSelectStart.y);
    
    selectionArea.style.left = left + 'px';
    selectionArea.style.top = top + 'px';
    selectionArea.style.width = width + 'px';
    selectionArea.style.height = height + 'px';
}

// 영역 선택 종료
function endAreaSelection() {
    isAreaSelecting = false;
    
    // 선택 영역 숨기기
    const selectionArea = document.getElementById('selection-area');
    selectionArea.style.display = 'none';
    
    // 영역 내 객체 선택
    selectObjectsInArea();
    
    // 선택된 객체가 없으면 다중 선택 모드 종료
    if (selectedObjects.length === 0) {
        isMultiSelectMode = false;
        hideStatus();
    } else {
        isMultiSelectMode = true;
        showMultiObjectInfo();
        showStatus(`${selectedObjects.length}개의 객체가 선택되었습니다.`);
    }
}

// 영역 내 객체 선택
function selectObjectsInArea() {
    const rect = canvas.getBoundingClientRect();
    const left = Math.min(areaSelectStart.x, areaSelectEnd.x);
    const top = Math.min(areaSelectStart.y, areaSelectEnd.y);
    const right = Math.max(areaSelectStart.x, areaSelectEnd.x);
    const bottom = Math.max(areaSelectStart.y, areaSelectEnd.y);
    
    // 모든 객체 검사
    drawingGroup.children.forEach(object => {
        if (isObjectInSelectionArea(object, left, top, right, bottom, rect)) {
            selectObjectForMultiSelection(object);
        }
    });
}

// 객체가 선택 영역 내에 있는지 확인
function isObjectInSelectionArea(object, left, top, right, bottom, canvasRect) {
    // 객체의 3D 위치를 2D 화면 좌표로 변환
    const vector = new THREE.Vector3();
    object.getWorldPosition(vector);
    vector.project(camera);
    
    // 화면 좌표 계산
    const x = (vector.x * 0.5 + 0.5) * canvasRect.width;
    const y = (-vector.y * 0.5 + 0.5) * canvasRect.height;
    
    // 영역 내에 있는지 확인
    return x >= left && x <= right && y >= top && y <= bottom;
}

// 다중 선택 정보 표시
function showMultiObjectInfo() {
    const infoPanel = document.getElementById('multi-object-info');
    document.getElementById('multiInfoCount').textContent = `${selectedObjects.length}개`;
    document.getElementById('multiInfoMode').textContent = '드래그 선택';
    
    infoPanel.style.display = 'flex';
}

// 다중 선택 정보 닫기
function closeMultiObjectInfo() {
    document.getElementById('multi-object-info').style.display = 'none';
}

// 객체 정보 표시
function showObjectInfo(object) {
    const infoPanel = document.getElementById('object-info');
    const objectType = object.name.split('_')[0];
    const objectName = object.name;
    const position = object.position;
    const color = object.userData.originalMaterial ? 
        (object.userData.originalMaterial.color ? 
         object.userData.originalMaterial.color.getStyle() : '#ffffff') : '#ffffff';
    
    document.getElementById('infoType').textContent = objectType;
    document.getElementById('infoName').textContent = objectName;
    document.getElementById('infoPosition').textContent = 
        `X: ${position.x.toFixed(2)}, Y: ${position.y.toFixed(2)}, Z: ${position.z.toFixed(2)}`;
    document.getElementById('infoColor').textContent = color;
    
    infoPanel.style.display = 'flex';
}

// 객체 정보 닫기
function closeObjectInfo() {
    document.getElementById('object-info').style.display = 'none';
}

// 포인터 모드 토글 - 개선된 버전
function togglePointer() {
    isPointerMode = !isPointerMode;
    isEraserMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isPaintMode = false;
    isBridgeMode = false;
    
    const pointerBtn = document.getElementById('pointerBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const shapeDrawBtn = document.getElementById('shapeDrawBtn');
    const paintBtn = document.getElementById('paintBtn');
    const bridgeBtn = document.getElementById('bridgeBtn');
    const canvas = document.getElementById('canvas');
    const modeIndicator = document.getElementById('modeIndicator');
    
    if (isPointerMode) {
        pointerBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        cameraBtn.classList.remove('active');
        shapeDrawBtn.classList.remove('active');
        paintBtn.classList.remove('active');
        bridgeBtn.classList.remove('active');
        canvas.classList.add('pointer-mode');
        canvas.classList.remove('eraser-mode');
        canvas.classList.remove('moving-mode');
        canvas.classList.remove('camera-mode');
        canvas.classList.remove('shape-drawing-mode');
        canvas.classList.remove('paint-mode');
        canvas.classList.remove('bridge-mode');
        modeIndicator.textContent = '포인터 모드';
        showStatus('포인터 모드: 클릭으로 객체 선택, 드래그로 다중 선택 및 이동');
    } else {
        pointerBtn.classList.remove('active');
        canvas.classList.remove('pointer-mode');
        modeIndicator.textContent = '드로잉 모드';
        hideStatus();
        deselectAllObjects();
    }
    
    document.getElementById('cameraControlsInfo').style.display = 'none';
    hideCtrlShapesPanel();
}

// 나머지 함수들은 기존 코드 유지
// 펜 타입별 그리기 함수들
function createNormalPen() {
    const curve = new THREE.CatmullRomCurve3(currentPoints);
    const points = curve.getPoints(currentPoints.length * 10);
    const geometry = new THREE.TubeGeometry(curve, points.length, brushSize * 0.01, 8, false);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.2
    });
    
    const line = new THREE.Mesh(geometry, material);
    line.name = `pen_${penIdCounter++}`;
    drawingGroup.add(line);
    currentLines.push(line);
}

function createDoublePen() {
    const curve = new THREE.CatmullRomCurve3(currentPoints);
    const points = curve.getPoints(currentPoints.length * 10);
    
    // 첫 번째 선
    const geometry1 = new THREE.TubeGeometry(curve, points.length, brushSize * 0.005, 8, false);
    const material1 = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    const line1 = new THREE.Mesh(geometry1, material1);
    line1.name = `pen_${penIdCounter++}`;
    
    // 두 번째 선 (오프셋 적용)
    const offsetCurve = new THREE.CatmullRomCurve3(
        currentPoints.map(p => {
            const offset = new THREE.Vector3();
            offset.crossVectors(p, new THREE.Vector3(0, 1, 0)).normalize();
            return p.clone().add(offset.multiplyScalar(brushSize * 0.02));
        })
    );
    
    const geometry2 = new THREE.TubeGeometry(offsetCurve, points.length, brushSize * 0.005, 8, false);
    const material2 = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    const line2 = new THREE.Mesh(geometry2, material2);
    line2.name = `pen_${penIdCounter++}`;
    
    drawingGroup.add(line1);
    drawingGroup.add(line2);
    currentLines.push(line1, line2);
}

function createDottedPen() {
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    // 점선 생성 - 일정 간격으로 점(구) 배치
    const dotSpacing = brushSize * 0.05;
    let accumulatedDistance = 0;
    
    for (let i = 1; i < currentPoints.length; i++) {
        const start = currentPoints[i-1];
        const end = currentPoints[i];
        const segmentLength = start.distanceTo(end);
        
        while (accumulatedDistance < segmentLength) {
            const t = accumulatedDistance / segmentLength;
            const dotPosition = new THREE.Vector3().lerpVectors(start, end, t);
            
            const dotGeometry = new THREE.SphereGeometry(brushSize * 0.01, 8, 8);
            const dot = new THREE.Mesh(dotGeometry, material);
            dot.position.copy(dotPosition);
            dot.name = `pen_${penIdCounter++}`;
            
            drawingGroup.add(dot);
            currentLines.push(dot);
            
            accumulatedDistance += dotSpacing;
        }
        
        accumulatedDistance -= segmentLength;
    }
}

function createDashedPen() {
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    // 파선 생성 - 짧은 선분들로 구성
    const dashLength = brushSize * 0.03;
    const gapLength = brushSize * 0.02;
    let accumulatedDistance = 0;
    let isDash = true;
    
    for (let i = 1; i < currentPoints.length; i++) {
        const start = currentPoints[i-1];
        const end = currentPoints[i];
        const segmentLength = start.distanceTo(end);
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        
        while (accumulatedDistance < segmentLength) {
            if (isDash) {
                const dashStart = start.clone().add(direction.clone().multiplyScalar(accumulatedDistance));
                const dashEnd = start.clone().add(direction.clone().multiplyScalar(Math.min(accumulatedDistance + dashLength, segmentLength)));
                
                if (dashStart.distanceTo(dashEnd) > 0.01) {
                    const dashCurve = new THREE.CatmullRomCurve3([dashStart, dashEnd]);
                    const dashGeometry = new THREE.TubeGeometry(dashCurve, 2, brushSize * 0.005, 8, false);
                    const dash = new THREE.Mesh(dashGeometry, material);
                    dash.name = `pen_${penIdCounter++}`;
                    
                    drawingGroup.add(dash);
                    currentLines.push(dash);
                }
                
                accumulatedDistance += dashLength;
            } else {
                accumulatedDistance += gapLength;
            }
            
            isDash = !isDash;
        }
        
        accumulatedDistance -= segmentLength;
    }
}

function createVariablePen() {
    const curve = new THREE.CatmullRomCurve3(currentPoints);
    const points = curve.getPoints(currentPoints.length * 10);
    
    // 속도에 따라 굵기 변화 - 마지막 점들 간의 거리를 기준으로
    let variableBrushSize = brushSize;
    if (currentPoints.length > 5) {
        const recentDistance = currentPoints[currentPoints.length-1].distanceTo(currentPoints[currentPoints.length-5]);
        // 거리가 짧을수록(느릴수록) 굵게, 길수록(빠를수록) 가늘게
        variableBrushSize = Math.max(1, Math.min(15, brushSize * (2 - recentDistance * 5)));
    }
    
    const geometry = new THREE.TubeGeometry(curve, points.length, variableBrushSize * 0.01, 8, false);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    const line = new THREE.Mesh(geometry, material);
    line.name = `pen_${penIdCounter++}`;
    drawingGroup.add(line);
    currentLines.push(line);
}

function createWavePen() {
    const curve = new THREE.CatmullRomCurve3(currentPoints);
    const basePoints = curve.getPoints(currentPoints.length * 10);
    
    // 파도 모양으로 변형된 점들 생성
    const wavePoints = basePoints.map((point, index) => {
        const waveOffset = new THREE.Vector3(
            Math.sin(index * 0.5) * brushSize * 0.02,
            0,
            Math.cos(index * 0.5) * brushSize * 0.02
        );
        return point.clone().add(waveOffset);
    });
    
    const waveCurve = new THREE.CatmullRomCurve3(wavePoints);
    const geometry = new THREE.TubeGeometry(waveCurve, wavePoints.length, brushSize * 0.008, 8, false);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    const line = new THREE.Mesh(geometry, material);
    line.name = `pen_${penIdCounter++}`;
    drawingGroup.add(line);
    currentLines.push(line);
}

function createZigzagPen() {
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    // 지그재그 패턴 생성
    for (let i = 1; i < currentPoints.length; i++) {
        const start = currentPoints[i-1];
        const end = currentPoints[i];
        
        // 선분을 여러 개의 작은 지그재그로 분할
        const segments = 3;
        for (let j = 0; j < segments; j++) {
            const t1 = j / segments;
            const t2 = (j + 1) / segments;
            
            const segStart = new THREE.Vector3().lerpVectors(start, end, t1);
            const segEnd = new THREE.Vector3().lerpVectors(start, end, t2);
            
            // 지그재그 중간점 생성
            const midT = (t1 + t2) / 2;
            const midPoint = new THREE.Vector3().lerpVectors(start, end, midT);
            
            // 수직 방향 오프셋 적용
            const perpendicular = new THREE.Vector3();
            perpendicular.crossVectors(
                new THREE.Vector3().subVectors(segEnd, segStart), 
                new THREE.Vector3(0, 1, 0)
            ).normalize();
            
            const zigzagAmount = (j % 2 === 0 ? 1 : -1) * brushSize * 0.02;
            midPoint.add(perpendicular.multiplyScalar(zigzagAmount));
            
            // 두 개의 선분으로 지그재그 생성
            const zigzagCurve1 = new THREE.CatmullRomCurve3([segStart, midPoint]);
            const zigzagGeometry1 = new THREE.TubeGeometry(zigzagCurve1, 2, brushSize * 0.005, 8, false);
            const zigzag1 = new THREE.Mesh(zigzagGeometry1, material);
            zigzag1.name = `pen_${penIdCounter++}`;
            
            const zigzagCurve2 = new THREE.CatmullRomCurve3([midPoint, segEnd]);
            const zigzagGeometry2 = new THREE.TubeGeometry(zigzagCurve2, 2, brushSize * 0.005, 8, false);
            const zigzag2 = new THREE.Mesh(zigzagGeometry2, material);
            zigzag2.name = `pen_${penIdCounter++}`;
            
            drawingGroup.add(zigzag1);
            drawingGroup.add(zigzag2);
            currentLines.push(zigzag1, zigzag2);
        }
    }
}

function createSpiralPen() {
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    // 나선 패턴 생성
    for (let i = 1; i < currentPoints.length; i++) {
        const start = currentPoints[i-1];
        const end = currentPoints[i];
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const perpendicular = new THREE.Vector3();
        perpendicular.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
        
        // 선분을 따라 나선 패턴 생성
        const spiralSegments = 5;
        const segmentLength = start.distanceTo(end) / spiralSegments;
        
        for (let j = 0; j < spiralSegments; j++) {
            const t1 = j / spiralSegments;
            const t2 = (j + 1) / spiralSegments;
            
            const segStart = new THREE.Vector3().lerpVectors(start, end, t1);
            const segEnd = new THREE.Vector3().lerpVectors(start, end, t2);
            
            // 나선형 중간점들 생성
            const spiralPoints = [];
            const spiralSteps = 8;
            
            for (let k = 0; k <= spiralSteps; k++) {
                const spiralT = k / spiralSteps;
                const spiralPoint = new THREE.Vector3().lerpVectors(segStart, segEnd, spiralT);
                
                // 나선형 오프셋 적용
                const angle = spiralT * Math.PI * 2;
                const spiralOffset = perpendicular.clone().multiplyScalar(Math.sin(angle) * brushSize * 0.01)
                    .add(new THREE.Vector3(0, Math.cos(angle) * brushSize * 0.01, 0));
                
                spiralPoint.add(spiralOffset);
                spiralPoints.push(spiralPoint);
            }
            
            const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
            const spiralGeometry = new THREE.TubeGeometry(spiralCurve, spiralPoints.length, brushSize * 0.003, 8, false);
            const spiral = new THREE.Mesh(spiralGeometry, material);
            spiral.name = `pen_${penIdCounter++}`;
            
            drawingGroup.add(spiral);
            currentLines.push(spiral);
        }
    }
}

// 펜 패널 관련 함수
function togglePenPanel() {
    const panel = document.getElementById('pen-panel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    
    // 다른 패널 닫기
    document.getElementById('map-panel').style.display = 'none';
    document.getElementById('shapes-panel').style.display = 'none';
    document.getElementById('text-panel').style.display = 'none';
    document.getElementById('image-panel').style.display = 'none';
    document.getElementById('paint-panel').style.display = 'none';
    document.getElementById('bridge-panel').style.display = 'none';
    document.getElementById('ctrl-shapes-panel').style.display = 'none';
    closeObjectInfo();
}

function selectPenType(penType) {
    currentPenType = penType;
    
    // 모든 펜 버튼의 active 클래스 제거
    document.querySelectorAll('.pen-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 펜 버튼에 active 클래스 추가
    event.target.classList.add('active');
    
    // 현재 펜 표시 업데이트
    const penNames = {
        'normal': '일반 펜',
        'double': '이중선 펜',
        'dotted': '점선 펜',
        'dashed': '파선 펜',
        'variable': '굵기 변하는 펜',
        'wave': '파도 펜',
        'zigzag': '지그재그 펜',
        'spiral': '나선 펜'
    };
    
    document.getElementById('currentPenDisplay').textContent = penNames[penType];
    document.getElementById('pen-panel').style.display = 'none';
    
    showStatus(`${penNames[penType]}이(가) 선택되었습니다.`);
    setTimeout(hideStatus, 1500);
}

// 맵 패널 관련 함수
function toggleMapPanel() {
    const panel = document.getElementById('map-panel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    
    // 다른 패널 닫기
    document.getElementById('pen-panel').style.display = 'none';
    document.getElementById('shapes-panel').style.display = 'none';
    document.getElementById('text-panel').style.display = 'none';
    document.getElementById('image-panel').style.display = 'none';
    document.getElementById('paint-panel').style.display = 'none';
    document.getElementById('bridge-panel').style.display = 'none';
    document.getElementById('ctrl-shapes-panel').style.display = 'none';
    closeObjectInfo();
}

// 지형 생성 함수들 - 개선된 버전
function addPlain() {
    // 평지 - 더 넓고 부드러운 평면
    const geometry = new THREE.PlaneGeometry(10, 10, 40, 40);
    const material = new THREE.MeshStandardMaterial({
        color: 0x7c9c6c, // 녹색 계열
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.1
    });
    const plain = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(plain);
    plain.name = `plain_${terrainIdCounter++}`;
    drawingGroup.add(plain);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('평지가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addMountain() {
    // 산 - 더 높고 뾰족한 형태
    const geometry = new THREE.ConeGeometry(2, 8, 12, 1, true);
    const material = new THREE.MeshStandardMaterial({
        color: 0x8a7f6d, // 갈색 계열
        roughness: 0.8,
        metalness: 0.1
    });
    const mountain = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(mountain);
    mountain.name = `mountain_${terrainIdCounter++}`;
    drawingGroup.add(mountain);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('산이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addHill() {
    // 언덕 - 더 부드럽고 자연스러운 형태
    const geometry = new THREE.SphereGeometry(4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({
        color: 0x7c9c6c, // 녹색 계열
        roughness: 0.7,
        metalness: 0.1
    });
    const hill = new THREE.Mesh(geometry, material);
    hill.scale.set(1, 0.3, 1); // 더 낮고 넓은 언덕
    
    positionObjectOnPlane(hill);
    hill.name = `hill_${terrainIdCounter++}`;
    drawingGroup.add(hill);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('언덕이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addValley() {
    // 계곡 - 더 깊고 넓은 계곡
    const geometry = new THREE.PlaneGeometry(10, 10, 40, 40);
    const vertices = geometry.attributes.position.array;
    
    // 계곡 모양 만들기 (중앙이 움푹 패인 형태)
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // 중앙에서 멀어질수록 높이 증가 (계곡 효과)
        const distance = Math.sqrt(x * x + z * z);
        const height = Math.max(0, distance - 2) * 0.8;
        
        vertices[i + 1] = -height; // Y축 값 조정
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x5a8a7c, // 청록색 계열
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.1
    });
    const valley = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(valley);
    valley.name = `valley_${terrainIdCounter++}`;
    drawingGroup.add(valley);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('계곡이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addBasin() {
    // 분지 - 더 깊고 현실적인 분지
    const geometry = new THREE.PlaneGeometry(10, 10, 40, 40);
    const vertices = geometry.attributes.position.array;
    
    // 분지 모양 만들기 (중앙이 낮고 가장자리가 높은 형태)
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // 중앙에서 멀어질수록 높이 증가 (분지 효과)
        const distance = Math.sqrt(x * x + z * z);
        const height = Math.min(2, distance) * 1.2;
        
        vertices[i + 1] = height; // Y축 값 조정
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x5a7a8c, // 청색 계열
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.1
    });
    const basin = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(basin);
    basin.name = `basin_${terrainIdCounter++}`;
    drawingGroup.add(basin);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('분지가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addPlateau() {
    // 고원 - 더 현실적인 고원 형태
    const baseGeometry = new THREE.CylinderGeometry(4, 4, 1, 16);
    const topGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 16);
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x8a7f6d, // 갈색 계열
        roughness: 0.7,
        metalness: 0.1
    });
    
    const base = new THREE.Mesh(baseGeometry, material);
    const top = new THREE.Mesh(topGeometry, material);
    top.position.y = 0.75;
    
    const plateau = new THREE.Group();
    plateau.add(base);
    plateau.add(top);
    
    positionObjectOnPlane(plateau);
    plateau.name = `plateau_${terrainIdCounter++}`;
    drawingGroup.add(plateau);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('고원이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addRidge() {
    // 능선 - 더 현실적인 산등성이
    const geometry = new THREE.BoxGeometry(8, 3, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x7a6d5c, // 갈색 계열
        roughness: 0.8,
        metalness: 0.1
    });
    const ridge = new THREE.Mesh(geometry, material);
    
    // 능선에 약간의 기울기 추가
    ridge.rotation.z = Math.PI / 12;
    
    positionObjectOnPlane(ridge);
    ridge.name = `ridge_${terrainIdCounter++}`;
    drawingGroup.add(ridge);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('능선이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addLake() {
    // 호수 - 물이 고인 호수
    const geometry = new THREE.CircleGeometry(3, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4a7b9d, // 파란색 계열
        side: THREE.DoubleSide,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.7
    });
    const lake = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(lake);
    lake.name = `lake_${terrainIdCounter++}`;
    drawingGroup.add(lake);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('호수가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addDesert() {
    // 사막 - 모래 언덕이 있는 사막
    const geometry = new THREE.PlaneGeometry(10, 10, 40, 40);
    const vertices = geometry.attributes.position.array;
    
    // 모래 언덕 효과 추가
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // 파도 모양의 모래 언덕
        const height = Math.sin(x * 0.5) * Math.cos(z * 0.3) * 0.5;
        
        vertices[i + 1] = height; // Y축 값 조정
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
        color: 0xd4b16a, // 모래색 계열
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.1
    });
    const desert = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(desert);
    desert.name = `desert_${terrainIdCounter++}`;
    drawingGroup.add(desert);
    
    document.getElementById('map-panel').style.display = 'none';
    showStatus('사막이 추가되었습니다.');
    saveState(); // 상태 저장
}

// 유틸리티 함수들
function getIntersectionPoint(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(drawingPlane);
    
    if (intersects.length > 0) {
        return intersects[0].point;
    }
    return null;
}

function updateCameraRotation(deltaX, deltaY) {
    if (!isCameraMode) return;
    
    // 카메라 회전 속도
    const rotationSpeed = 0.01;
    
    // Yaw (수평 회전) 업데이트
    cameraYaw -= deltaX * rotationSpeed;
    
    // Pitch (수직 회전) 업데이트 - 제한 설정
    cameraPitch -= deltaY * rotationSpeed;
    cameraPitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, cameraPitch));
    
    // 카메라 위치를 타겟 주위로 회전
    const radius = camera.position.distanceTo(cameraTarget);
    
    // 새로운 카메라 위치 계산
    camera.position.x = cameraTarget.x + radius * Math.cos(cameraPitch) * Math.sin(cameraYaw);
    camera.position.y = cameraTarget.y + radius * Math.sin(cameraPitch);
    camera.position.z = cameraTarget.z + radius * Math.cos(cameraPitch) * Math.cos(cameraYaw);
    
    // 카메라가 타겟을 바라보도록 설정
    camera.lookAt(cameraTarget);
}

function onResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function onWheel(event) {
    event.preventDefault();
    const step = event.deltaY * -0.01;
    updatePlanePosition(step);
}

function onKeyDown(event) {
    let step = 0.2;
    
    // Ctrl+Z 처리
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        undo();
        return;
    }
    
    // 카메라 모드에서의 키 입력
    if (isCameraMode) {
        keys[event.code] = true;
        return;
    }
    
    switch(event.key) {
        case 'ArrowUp':
            event.preventDefault();
            updatePlanePosition(-step);
            break;
        case 'ArrowDown':
            event.preventDefault();
            updatePlanePosition(step);
            break;
        case 'ArrowLeft':
            event.preventDefault();
            updatePlanePosition(-step);
            break;
        case 'ArrowRight':
            event.preventDefault();
            updatePlanePosition(step);
            break;
        case 'e':
        case 'E':
            event.preventDefault();
            toggleEraser();
            break;
        case 't':
        case 'T':
            event.preventDefault();
            toggleTextPanel();
            break;
        case 'i':
        case 'I':
            event.preventDefault();
            toggleImagePanel();
            break;
        case 'f':
        case 'F':
            event.preventDefault();
            togglePaintPanel();
            break;
        case 'b':
        case 'B':
            event.preventDefault();
            toggleBridgeMode();
            break;
        case 'p':
        case 'P':
            event.preventDefault();
            togglePointer();
            break;
        case 'c':
        case 'C':
            event.preventDefault();
            toggleCameraMode();
            break;
        case 's':
        case 'S':
            if (event.ctrlKey) {
                event.preventDefault();
                toggleShapeDrawingMode();
            }
            break;
        case 'm':
        case 'M':
            event.preventDefault();
            toggleMapPanel();
            break;
        case 'Escape':
            event.preventDefault();
            if (isMovingObjects) {
                cancelObjectMove();
            } else if (isShapeDrawingMode && isDrawingShape) {
                cancelShapeDrawing();
            } else if (isShapeDrawingMode) {
                toggleShapeDrawingMode();
            } else if (isPaintMode) {
                togglePaintMode();
            } else if (isBridgeMode) {
                toggleBridgeMode();
            } else if (isMultiSelectMode) {
                // 다중 선택 모드 해제
                deselectAllObjects();
                closeMultiObjectInfo();
            } else {
                deselectAllObjects();
            }
            break;
    }
}

function onKeyUp(event) {
    keys[event.code] = false;
}

function updatePlaneOrientation() {
    planePosition = { x: 0, y: 0, z: 0 };
    
    if (currentPlane === 'horizontal') {
        // XZ plane (horizontal)
        drawingPlane.rotation.set(-Math.PI / 2, 0, 0);
        heightGrid.rotation.set(-Math.PI / 2, 0, 0);
    } else if (currentPlane === 'vertical-x') {
        // YZ plane (vertical, perpendicular to X axis)
        drawingPlane.rotation.set(0, Math.PI / 2, 0);
        heightGrid.rotation.set(0, Math.PI / 2, 0);
    } else if (currentPlane === 'vertical-z') {
        // XY plane (vertical, perpendicular to Z axis)
        drawingPlane.rotation.set(0, 0, 0);
        heightGrid.rotation.set(0, 0, 0);
    }
    
    drawingPlane.position.set(0, 0, 0);
    heightGrid.position.set(0, 0, 0);
    updatePositionDisplay();
}

function updatePlanePosition(step) {
    if (currentPlane === 'horizontal') {
        planePosition.y += step;
        planePosition.y = Math.max(-5, Math.min(10, planePosition.y));
        drawingPlane.position.y = planePosition.y;
        heightGrid.position.y = planePosition.y;
    } else if (currentPlane === 'vertical-x') {
        planePosition.x += step;
        planePosition.x = Math.max(-10, Math.min(10, planePosition.x));
        drawingPlane.position.x = planePosition.x;
        heightGrid.position.x = planePosition.x;
    } else if (currentPlane === 'vertical-z') {
        planePosition.z += step;
        planePosition.z = Math.max(-10, Math.min(10, planePosition.z));
        drawingPlane.position.z = planePosition.z;
        heightGrid.position.z = planePosition.z;
    }
    
    // Update grid color based on position
    const normalizedPos = Math.abs(
        currentPlane === 'horizontal' ? planePosition.y : 
        currentPlane === 'vertical-x' ? planePosition.x : planePosition.z
    ) / 10;
    heightGrid.material.color.setHSL(normalizedPos * 0.3, 1, 0.5);
    
    updatePositionDisplay();
}

function updatePositionDisplay() {
    let text = '';
    if (currentPlane === 'horizontal') {
        text = `Y: ${planePosition.y.toFixed(1)}`;
    } else if (currentPlane === 'vertical-x') {
        text = `X: ${planePosition.x.toFixed(1)}`;
    } else if (currentPlane === 'vertical-z') {
        text = `Z: ${planePosition.z.toFixed(1)}`;
    }
    document.getElementById('positionValue').textContent = text;
}

function clearDrawings() {
    while (drawingGroup.children.length > 0) {
        const child = drawingGroup.children[0];
        child.geometry.dispose();
        child.material.dispose();
        drawingGroup.remove(child);
    }
    cleanupAudioVisualizations();
    deselectAllObjects();
    saveState(); // 상태 저장
}

function resetCamera() {
    if (isCameraMode) {
        // 카메라 모드일 때는 카메라 위치와 타겟을 초기화
        camera.position.set(0, 5, 10);
        cameraTarget.set(0, 0, 0);
        cameraYaw = 0;
        cameraPitch = 0;
        camera.lookAt(cameraTarget);
    } else {
        // 일반 모드일 때는 원점 중심 회전
        cameraRotation = { theta: 0, phi: Math.PI / 4 };
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
    }
    planePosition = { x: 0, y: 0, z: 0 };
    currentPlane = 'horizontal';
    document.getElementById('planeSelector').value = 'horizontal';
    updatePlaneOrientation();
}

function saveAsOBJ() {
    if (drawingGroup.children.length === 0) {
        alert('저장할 그림이 없습니다.');
        return;
    }
    
    // OBJExporter를 사용하여 OBJ 파일 생성
    const exporter = new THREE.OBJExporter();
    const objData = exporter.parse(drawingGroup);
    
    // 파일 다운로드
    const blob = new Blob([objData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '3d_drawing.obj';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showStatus('OBJ 파일이 저장되었습니다.');
    setTimeout(hideStatus, 2000);
}

// 도형 추가 함수들
function addCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    const cube = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(cube);
    cube.name = `cube_${shapeIdCounter++}`;
    drawingGroup.add(cube);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('큐브가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addSphere() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(sphere);
    sphere.name = `sphere_${shapeIdCounter++}`;
    drawingGroup.add(sphere);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('구가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addCylinder() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    const cylinder = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(cylinder);
    cylinder.name = `cylinder_${shapeIdCounter++}`;
    drawingGroup.add(cylinder);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('실린더가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addCone() {
    const geometry = new THREE.ConeGeometry(0.5, 1, 32);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    const cone = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(cone);
    cone.name = `cone_${shapeIdCounter++}`;
    drawingGroup.add(cone);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('원뿔이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addPyramid() {
    const geometry = new THREE.ConeGeometry(0.5, 1, 4);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    const pyramid = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(pyramid);
    pyramid.name = `pyramid_${shapeIdCounter++}`;
    drawingGroup.add(pyramid);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('피라미드가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addTorus() {
    const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    const torus = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(torus);
    torus.name = `torus_${shapeIdCounter++}`;
    drawingGroup.add(torus);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('토러스가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addPlane() {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide,
        roughness: 0.4,
        metalness: 0.6
    });
    const plane = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(plane);
    plane.name = `plane_${shapeIdCounter++}`;
    drawingGroup.add(plane);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('평면이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addTree() {
    // 나무 만들기 (줄기 + 잎)
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    
    const leavesGeometry = new THREE.ConeGeometry(0.5, 1, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.6
    });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 0.8;
    
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    
    positionObjectOnPlane(tree);
    tree.name = `tree_${shapeIdCounter++}`;
    drawingGroup.add(tree);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('나무가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addStraightLine() {
    const points = [
        new THREE.Vector3(-0.5, 0, 0),
        new THREE.Vector3(0.5, 0, 0)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: 2
    });
    const line = new THREE.Line(geometry, material);
    
    positionObjectOnPlane(line);
    line.name = `line_${shapeIdCounter++}`;
    drawingGroup.add(line);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('직선이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addCurvedLine() {
    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.5, 0, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0.5, 0, 0)
    );
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: 2
    });
    const curvedLine = new THREE.Line(geometry, material);
    
    positionObjectOnPlane(curvedLine);
    curvedLine.name = `curvedLine_${shapeIdCounter++}`;
    drawingGroup.add(curvedLine);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('곡선이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addSpiral() {
    const points = [];
    for (let i = 0; i < 100; i++) {
        const t = i / 20;
        points.push(new THREE.Vector3(
            Math.cos(t) * 0.5,
            t * 0.2,
            Math.sin(t) * 0.5
        ));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: 2
    });
    const spiral = new THREE.Line(geometry, material);
    
    positionObjectOnPlane(spiral);
    spiral.name = `spiral_${shapeIdCounter++}`;
    drawingGroup.add(spiral);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('나선이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addStar() {
    const shape = new THREE.Shape();
    const outerRadius = 0.5;
    const innerRadius = 0.2;
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    shape.closePath();
    
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide
    });
    const star = new THREE.Mesh(geometry, material);
    
    positionObjectOnPlane(star);
    star.name = `star_${shapeIdCounter++}`;
    drawingGroup.add(star);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('별이 추가되었습니다.');
    saveState(); // 상태 저장
}

function addHeart() {
    const curve = new THREE.CubicBezierCurve(
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.5, 0.5),
        new THREE.Vector2(0, 1),
        new THREE.Vector2(0, 0.5)
    );
    const points = curve.getPoints(50);
    const geometry = new THREE.LatheGeometry(points, 12);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide
    });
    const heart = new THREE.Mesh(geometry, material);
    heart.scale.set(0.5, 0.5, 0.5);
    
    positionObjectOnPlane(heart);
    heart.name = `heart_${shapeIdCounter++}`;
    drawingGroup.add(heart);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('하트가 추가되었습니다.');
    saveState(); // 상태 저장
}

function addArrow() {
    const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const headGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.6
    });
    
    const shaft = new THREE.Mesh(shaftGeometry, material);
    shaft.position.y = 0.4;
    
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 0.9;
    
    const arrow = new THREE.Group();
    arrow.add(shaft);
    arrow.add(head);
    
    positionObjectOnPlane(arrow);
    arrow.name = `arrow_${shapeIdCounter++}`;
    drawingGroup.add(arrow);
    
    document.getElementById('shapes-panel').style.display = 'none';
    showStatus('화살표가 추가되었습니다.');
    saveState(); // 상태 저장
}

function positionObjectOnPlane(object) {
    if (currentPlane === 'horizontal') {
        object.position.set(0, planePosition.y, 0);
        object.rotation.x = 0;
    } else if (currentPlane === 'vertical-x') {
        object.position.set(planePosition.x, 0, 0);
        object.rotation.y = Math.PI / 2;
    } else if (currentPlane === 'vertical-z') {
        object.position.set(0, 0, planePosition.z);
        object.rotation.x = Math.PI / 2;
    }
}

// 텍스트 추가 함수
function addText() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();
    
    if (!text) {
        alert('텍스트를 입력해주세요.');
        return;
    }
    
    const selectedFont = document.getElementById('textFont').value;
    const size = parseFloat(document.getElementById('textSize').value);
    const depth = parseFloat(document.getElementById('textDepth').value);
    
    // 한글 텍스트 처리를 위한 캔버스 기반 텍스처 생성
    createTextTexture(text, size, depth, selectedFont);
    
    document.getElementById('text-panel').style.display = 'none';
}

// 캔버스를 사용한 텍스처 생성 함수 (한글 지원)
function createTextTexture(text, size, depth, fontName) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // 캔버스 크기 설정 (텍스트 크기에 따라 동적으로 조정)
    const fontSize = Math.max(32, size * 100); // 기본 폰트 크기
    canvas.width = text.length * fontSize * 0.6;
    canvas.height = fontSize * 1.5;
    
    // 배경 투명
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 텍스트 스타일 설정
    context.font = `bold ${fontSize}px "Malgun Gothic", Arial, sans-serif`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // 텍스트 그리기
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // 텍스처 생성
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    // 3D 텍스트 메쉬 생성
    const textWidth = text.length * size * 0.3;
    const geometry = new THREE.BoxGeometry(textWidth, size, depth);
    const material = [
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // 뒤면
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // 앞면
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // 위쪽
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // 아래쪽
        new THREE.MeshBasicMaterial({ map: texture }), // 오른쪽 (텍스처 적용)
        new THREE.MeshBasicMaterial({ color: 0x000000 })  // 왼쪽
    ];
    
    const textMesh = new THREE.Mesh(geometry, material);
    
    // 텍스트 위치 설정
    positionTextOnPlane(textMesh);
    
    textMesh.name = `text_${shapeIdCounter++}`;
    drawingGroup.add(textMesh);
    
    showStatus('텍스트가 추가되었습니다.');
    setTimeout(hideStatus, 1500);
    saveState(); // 상태 저장
}

function positionTextOnPlane(textMesh) {
    // Position the text on the current drawing plane
    if (currentPlane === 'horizontal') {
        textMesh.position.set(0, planePosition.y, 0);
        textMesh.rotation.x = -Math.PI / 2;
    } else if (currentPlane === 'vertical-x') {
        textMesh.position.set(planePosition.x, 0, 0);
        textMesh.rotation.y = Math.PI / 2;
    } else if (currentPlane === 'vertical-z') {
        textMesh.position.set(0, 0, planePosition.z);
        // No rotation needed for vertical-z plane
    }
}

// 이미지 추가 함수
function addImage() {
    const imageUrl = document.getElementById('imageUrl').value.trim();
    
    if (!imageUrl) {
        alert('이미지 URL을 입력해주세요.');
        return;
    }
    
    const width = parseFloat(document.getElementById('imageWidth').value);
    const height = parseFloat(document.getElementById('imageHeight').value);
    
    // 이미지 로드
    textureLoader.load(
        imageUrl,
        (texture) => {
            // 이미지 흐림 현상 해결을 위한 필터링 설정
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            
            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: false
            });
            
            const imageMesh = new THREE.Mesh(geometry, material);
            
            // Position the image on the current drawing plane
            positionImageOnPlane(imageMesh);
            
            imageMesh.name = `image_${shapeIdCounter++}`;
            drawingGroup.add(imageMesh);
            
            document.getElementById('image-panel').style.display = 'none';
            showStatus('이미지가 추가되었습니다.');
            setTimeout(hideStatus, 1500);
            saveState(); // 상태 저장
        },
        undefined,
        (error) => {
            console.error('이미지 로드 오류:', error);
            alert('이미지를 불러오는 중 오류가 발생했습니다. URL을 확인해주세요.');
        }
    );
}

function positionImageOnPlane(imageMesh) {
    // Position the image on the current drawing plane
    if (currentPlane === 'horizontal') {
        imageMesh.position.set(0, planePosition.y, 0);
        imageMesh.rotation.x = -Math.PI / 2;
    } else if (currentPlane === 'vertical-x') {
        imageMesh.position.set(planePosition.x, 0, 0);
        imageMesh.rotation.y = Math.PI / 2;
    } else if (currentPlane === 'vertical-z') {
        imageMesh.position.set(0, 0, planePosition.z);
        // No rotation needed for vertical-z plane
    }
}

// 도형 그리기 관련 함수들
function hideCtrlShapesPanel() {
    // 도형 그리기 모드가 활성화된 상태에서는 패널을 숨기지 않음
    if (!isShapeDrawingMode) {
        document.getElementById('ctrl-shapes-panel').style.display = 'none';
    }
}

function selectShapeType(shapeType) {
    currentShapeType = shapeType;
    
    // 모든 도형 버튼의 active 클래스 제거
    resetShapeButtons();
    
    // 선택된 도형 버튼에 active 클래스 추가
    const btn = document.getElementById(shapeType + 'Btn');
    if (btn) {
        btn.classList.add('active');
    }
    
    showDrawingInfo(`${getShapeName(shapeType)} 그리기: 시작점을 클릭하고 드래그하여 크기 조절`);
}

function resetShapeButtons() {
    const buttons = document.querySelectorAll('.ctrl-shape-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
}

function getShapeName(shapeType) {
    const names = {
        'rectangle': '사각형',
        'circle': '원',
        'triangle': '삼각형',
        'ellipse': '타원'
    };
    return names[shapeType] || shapeType;
}

function startShapeDrawing(event) {
    const point = getIntersectionPoint(event);
    if (point) {
        isDrawingShape = true;
        shapeStartPoint = point.clone();
        showDrawingInfo(`${getShapeName(currentShapeType)} 그리기: 드래그하여 크기 조절 (ESC로 취소)`);
    }
}

function updateShapeDrawing(event) {
    const point = getIntersectionPoint(event);
    if (point && shapeStartPoint) {
        // 기존 미리보기 제거
        if (currentDrawingShape) {
            drawingGroup.remove(currentDrawingShape);
            currentDrawingShape.geometry.dispose();
            currentDrawingShape.material.dispose();
        }
        
        // 새 도형 생성 (드래그한 영역 크기로)
        currentDrawingShape = createShapeFromArea(currentShapeType, shapeStartPoint, point);
        if (currentDrawingShape) {
            drawingGroup.add(currentDrawingShape);
            
            // 크기 정보 표시
            updateSizeDisplay(shapeStartPoint, point);
        }
    }
}

function createShapeFromArea(shapeType, startPoint, endPoint) {
    const deltaX = endPoint.x - startPoint.x;
    const deltaZ = endPoint.z - startPoint.z;
    
    // 드래그한 영역의 실제 크기 계산
    const width = Math.abs(deltaX);
    const height = Math.abs(deltaZ);
    const radius = Math.max(width, height) / 2;
    
    let geometry, material;
    
    switch(shapeType) {
        case 'rectangle':
            geometry = new THREE.PlaneGeometry(width, height);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            break;
            
        case 'circle':
            geometry = new THREE.CircleGeometry(radius, 32);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            break;
            
        case 'triangle':
            const size = Math.max(width, height);
            geometry = new THREE.ConeGeometry(size / 2, size, 3);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                transparent: true,
                opacity: 0.7
            });
            break;
            
        case 'ellipse':
            // 타원은 원을 스케일링하여 생성
            geometry = new THREE.CircleGeometry(1, 32);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            break;
            
        default:
            return null;
    }
    
    const shape = new THREE.Mesh(geometry, material);
    
    // 위치와 회전 설정
    const centerX = (startPoint.x + endPoint.x) / 2;
    const centerZ = (startPoint.z + endPoint.z) / 2;
    
    if (currentPlane === 'horizontal') {
        shape.position.set(centerX, planePosition.y, centerZ);
        shape.rotation.x = -Math.PI / 2;
        
        // 타원 스케일링
        if (shapeType === 'ellipse') {
            shape.scale.set(width, height, 1);
        }
    } else if (currentPlane === 'vertical-x') {
        shape.position.set(planePosition.x, centerX, centerZ);
        shape.rotation.y = Math.PI / 2;
        
        if (shapeType === 'ellipse') {
            shape.scale.set(height, width, 1);
        }
    } else if (currentPlane === 'vertical-z') {
        shape.position.set(centerX, centerZ, planePosition.z);
        
        if (shapeType === 'ellipse') {
            shape.scale.set(width, height, 1);
        }
    }
    
    return shape;
}

function updateSizeDisplay(startPoint, endPoint) {
    const deltaX = Math.abs(endPoint.x - startPoint.x);
    const deltaZ = Math.abs(endPoint.z - startPoint.z);
    
    const width = deltaX.toFixed(2);
    const height = deltaZ.toFixed(2);
    const diagonal = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ).toFixed(2);
    
    let sizeText = '';
    if (currentShapeType === 'rectangle') {
        sizeText = `크기: ${width} x ${height}`;
    } else if (currentShapeType === 'circle') {
        const radius = (Math.max(deltaX, deltaZ) / 2).toFixed(2);
        sizeText = `반지름: ${radius}`;
    } else if (currentShapeType === 'triangle') {
        const size = Math.max(deltaX, deltaZ).toFixed(2);
        sizeText = `크기: ${size}`;
    } else if (currentShapeType === 'ellipse') {
        sizeText = `크기: ${width} x ${height}`;
    }
    
    // 마우스 위치에 크기 정보 표시
    const rect = canvas.getBoundingClientRect();
    sizeDisplay.textContent = sizeText;
    sizeDisplay.style.left = (event.clientX - rect.left + 10) + 'px';
    sizeDisplay.style.top = (event.clientY - rect.top - 30) + 'px';
    sizeDisplay.style.display = 'block';
}

function hideSizeDisplay() {
    sizeDisplay.style.display = 'none';
}

function endShapeDrawing() {
    if (currentDrawingShape && shapeStartPoint) {
        // 새로운 최종 도형 생성 (미리보기와 별도로)
        const finalShape = createFinalShape(currentShapeType, shapeStartPoint);
        if (finalShape) {
            finalShape.name = `${currentShapeType}_${shapeIdCounter++}`;
            drawingGroup.add(finalShape);
            showStatus(`${getShapeName(currentShapeType)}이(가) 추가되었습니다.`);
        }
        
        // 미리보기 제거
        drawingGroup.remove(currentDrawingShape);
        currentDrawingShape.geometry.dispose();
        currentDrawingShape.material.dispose();
        currentDrawingShape = null;
    }
    
    isDrawingShape = false;
    shapeStartPoint = null;
    hideDrawingInfo();
    hideSizeDisplay();
}

function createFinalShape(shapeType, startPoint) {
    // 최종 도형 생성 (투명도 없이)
    const endPoint = getCurrentEndPoint(); // 현재 마우스 위치 가져오기
    
    if (!endPoint) return null;
    
    const deltaX = endPoint.x - startPoint.x;
    const deltaZ = endPoint.z - startPoint.z;
    
    const width = Math.abs(deltaX);
    const height = Math.abs(deltaZ);
    const radius = Math.max(width, height) / 2;
    
    let geometry, material;
    
    switch(shapeType) {
        case 'rectangle':
            geometry = new THREE.PlaneGeometry(width, height);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                side: THREE.DoubleSide
            });
            break;
            
        case 'circle':
            geometry = new THREE.CircleGeometry(radius, 32);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                side: THREE.DoubleSide
            });
            break;
            
        case 'triangle':
            const size = Math.max(width, height);
            geometry = new THREE.ConeGeometry(size / 2, size, 3);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color)
            });
            break;
            
        case 'ellipse':
            geometry = new THREE.CircleGeometry(1, 32);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                side: THREE.DoubleSide
            });
            break;
            
        default:
            return null;
    }
    
    const shape = new THREE.Mesh(geometry, material);
    
    // 위치와 회전 설정
    const centerX = (startPoint.x + endPoint.x) / 2;
    const centerZ = (startPoint.z + endPoint.z) / 2;
    
    if (currentPlane === 'horizontal') {
        shape.position.set(centerX, planePosition.y, centerZ);
        shape.rotation.x = -Math.PI / 2;
        
        if (shapeType === 'ellipse') {
            shape.scale.set(width, height, 1);
        }
    } else if (currentPlane === 'vertical-x') {
        shape.position.set(planePosition.x, centerX, centerZ);
        shape.rotation.y = Math.PI / 2;
        
        if (shapeType === 'ellipse') {
            shape.scale.set(height, width, 1);
        }
    } else if (currentPlane === 'vertical-z') {
        shape.position.set(centerX, centerZ, planePosition.z);
        
        if (shapeType === 'ellipse') {
            shape.scale.set(width, height, 1);
        }
    }
    
    return shape;
}

function getCurrentEndPoint() {
    // 현재 마우스 위치를 반환하는 함수
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((lastMouse.x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((lastMouse.y - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(drawingPlane);
    
    if (intersects.length > 0) {
        return intersects[0].point;
    }
    return null;
}

function cancelShapeDrawing() {
    if (currentDrawingShape) {
        drawingGroup.remove(currentDrawingShape);
        currentDrawingShape.geometry.dispose();
        currentDrawingShape.material.dispose();
        currentDrawingShape = null;
    }
    
    isDrawingShape = false;
    shapeStartPoint = null;
    hideDrawingInfo();
    hideSizeDisplay();
    showStatus('도형 그리기가 취소되었습니다.');
}

function showDrawingInfo(text) {
    const info = document.getElementById('drawing-info');
    info.textContent = text;
    info.style.display = 'block';
}

function hideDrawingInfo() {
    document.getElementById('drawing-info').style.display = 'none';
}

// 페인트 채우기 관련 함수들
function startPaintMode() {
    isPaintMode = true;
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isBridgeMode = false;
    
    const paintBtn = document.getElementById('paintBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const pointerBtn = document.getElementById('pointerBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const shapeDrawBtn = document.getElementById('shapeDrawBtn');
    const bridgeBtn = document.getElementById('bridgeBtn');
    const canvas = document.getElementById('canvas');
    const modeIndicator = document.getElementById('modeIndicator');
    
    paintBtn.classList.add('active');
    eraserBtn.classList.remove('active');
    pointerBtn.classList.remove('active');
    cameraBtn.classList.remove('active');
    shapeDrawBtn.classList.remove('active');
    bridgeBtn.classList.remove('active');
    canvas.classList.add('paint-mode');
    canvas.classList.remove('eraser-mode');
    canvas.classList.remove('pointer-mode');
    canvas.classList.remove('moving-mode');
    canvas.classList.remove('camera-mode');
    canvas.classList.remove('shape-drawing-mode');
    canvas.classList.remove('bridge-mode');
    modeIndicator.textContent = '페인트 모드';
    
    document.getElementById('paint-panel').style.display = 'none';
    document.getElementById('cameraControlsInfo').style.display = 'none';
    
    showStatus('페인트 모드: 채우기를 원하는 영역을 클릭하세요');
}

function createPaintFill(event) {
    const point = getIntersectionPoint(event);
    if (point) {
        let geometry, material;
        
        if (paintShape === 'square') {
            // 사각형 채우기
            geometry = new THREE.PlaneGeometry(paintSize, paintSize);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                side: THREE.DoubleSide,
                roughness: 0.4,
                metalness: 0.6
            });
        } else {
            // 원형 채우기
            geometry = new THREE.CircleGeometry(paintSize / 2, 32);
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                side: THREE.DoubleSide,
                roughness: 0.4,
                metalness: 0.6
            });
        }
        
        const paintFill = new THREE.Mesh(geometry, material);
        
        // 현재 평면에 따라 위치와 회전 설정
        if (currentPlane === 'horizontal') {
            paintFill.position.set(point.x, planePosition.y, point.z);
            paintFill.rotation.x = -Math.PI / 2;
        } else if (currentPlane === 'vertical-x') {
            paintFill.position.set(planePosition.x, point.y, point.z);
            paintFill.rotation.y = Math.PI / 2;
        } else if (currentPlane === 'vertical-z') {
            paintFill.position.set(point.x, point.y, planePosition.z);
            // 수직 Z 평면에서는 추가 회전이 필요 없음
        }
        
        paintFill.name = `paint_${shapeIdCounter++}`;
        drawingGroup.add(paintFill);
        
        showStatus('페인트 채우기가 추가되었습니다.');
        setTimeout(hideStatus, 1500);
        saveState(); // 상태 저장
    }
}

function eraseObject(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // 모든 그려진 객체와 충돌 검사
    const intersects = raycaster.intersectObjects(drawingGroup.children, true);
    
    if (intersects.length > 0) {
        const objectToRemove = intersects[0].object;
        
        // 부모 객체 찾기
        let parentObject = objectToRemove;
        if (objectToRemove.parent && objectToRemove.parent !== drawingGroup) {
            parentObject = objectToRemove.parent;
        }
        
        // 선택된 객체인지 확인
        if (selectedObject === parentObject || selectedObjects.includes(parentObject)) {
            deselectAllObjects();
        }
        
        // 객체 제거
        drawingGroup.remove(parentObject);
        parentObject.geometry.dispose();
        parentObject.material.dispose();
        
        showStatus('객체가 삭제되었습니다.');
        setTimeout(hideStatus, 1500);
        
        saveState(); // 상태 저장
    }
}

function toggleCameraMode() {
    isCameraMode = !isCameraMode;
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isShapeDrawingMode = false;
    isPaintMode = false;
    isBridgeMode = false;
    
    const cameraBtn = document.getElementById('cameraBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const pointerBtn = document.getElementById('pointerBtn');
    const shapeDrawBtn = document.getElementById('shapeDrawBtn');
    const paintBtn = document.getElementById('paintBtn');
    const bridgeBtn = document.getElementById('bridgeBtn');
    const canvas = document.getElementById('canvas');
    const modeIndicator = document.getElementById('modeIndicator');
    const cameraControls = document.getElementById('cameraControlsInfo');
    
    if (isCameraMode) {
        cameraBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        pointerBtn.classList.remove('active');
        shapeDrawBtn.classList.remove('active');
        paintBtn.classList.remove('active');
        bridgeBtn.classList.remove('active');
        canvas.classList.add('camera-mode');
        canvas.classList.remove('eraser-mode');
        canvas.classList.remove('pointer-mode');
        canvas.classList.remove('moving-mode');
        canvas.classList.remove('shape-drawing-mode');
        canvas.classList.remove('paint-mode');
        canvas.classList.remove('bridge-mode');
        modeIndicator.textContent = '카메라 모드';
        cameraControls.style.display = 'flex';
        
        // 카메라 모드 진입 시 현재 카메라 위치와 방향을 기반으로 타겟 설정
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        cameraTarget.copy(camera.position).add(direction.multiplyScalar(10));
        
        // 현재 카메라 방향을 기반으로 초기 yaw와 pitch 설정
        const relativePosition = new THREE.Vector3().subVectors(camera.position, cameraTarget);
        const radius = relativePosition.length();
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(relativePosition);
        
        cameraYaw = spherical.theta;
        cameraPitch = Math.PI/2 - spherical.phi;
        
        camera.lookAt(cameraTarget);
        showStatus('카메라 모드: WASD/QE 키로 이동, 마우스 드래그로 회전');
    } else {
        cameraBtn.classList.remove('active');
        canvas.classList.remove('camera-mode');
        modeIndicator.textContent = '드로잉 모드';
        cameraControls.style.display = 'none';
        hideStatus();
        deselectAllObjects();
    }
    
    hideCtrlShapesPanel();
}

function toggleShapeDrawingMode() {
    isShapeDrawingMode = !isShapeDrawingMode;
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isPaintMode = false;
    isBridgeMode = false;
    
    const shapeDrawBtn = document.getElementById('shapeDrawBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const pointerBtn = document.getElementById('pointerBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const paintBtn = document.getElementById('paintBtn');
    const bridgeBtn = document.getElementById('bridgeBtn');
    const canvas = document.getElementById('canvas');
    const modeIndicator = document.getElementById('modeIndicator');
    const ctrlShapesPanel = document.getElementById('ctrl-shapes-panel');
    
    if (isShapeDrawingMode) {
        shapeDrawBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        pointerBtn.classList.remove('active');
        cameraBtn.classList.remove('active');
        paintBtn.classList.remove('active');
        bridgeBtn.classList.remove('active');
        canvas.classList.add('shape-drawing-mode');
        canvas.classList.remove('eraser-mode');
        canvas.classList.remove('pointer-mode');
        canvas.classList.remove('moving-mode');
        canvas.classList.remove('camera-mode');
        canvas.classList.remove('paint-mode');
        canvas.classList.remove('bridge-mode');
        modeIndicator.textContent = '도형 그리기 모드';
        ctrlShapesPanel.style.display = 'flex';
        showStatus('도형 그리기 모드: 도형을 선택하고 캔버스에서 드래그하여 그리세요');
    } else {
        shapeDrawBtn.classList.remove('active');
        canvas.classList.remove('shape-drawing-mode');
        modeIndicator.textContent = '드로잉 모드';
        ctrlShapesPanel.style.display = 'none';
        hideStatus();
        deselectAllObjects();
        resetShapeButtons();
    }
    
    document.getElementById('cameraControlsInfo').style.display = 'none';
}

function togglePaintMode() {
    isPaintMode = !isPaintMode;
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isBridgeMode = false;
    
    const paintBtn = document.getElementById('paintBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const pointerBtn = document.getElementById('pointerBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const shapeDrawBtn = document.getElementById('shapeDrawBtn');
    const bridgeBtn = document.getElementById('bridgeBtn');
    const canvas = document.getElementById('canvas');
    const modeIndicator = document.getElementById('modeIndicator');
    
    if (isPaintMode) {
        paintBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        pointerBtn.classList.remove('active');
        cameraBtn.classList.remove('active');
        shapeDrawBtn.classList.remove('active');
        bridgeBtn.classList.remove('active');
        canvas.classList.add('paint-mode');
        canvas.classList.remove('eraser-mode');
        canvas.classList.remove('pointer-mode');
        canvas.classList.remove('moving-mode');
        canvas.classList.remove('camera-mode');
        canvas.classList.remove('shape-drawing-mode');
        canvas.classList.remove('bridge-mode');
        modeIndicator.textContent = '페인트 모드';
        showStatus('페인트 모드: 채우기를 원하는 영역을 클릭하세요');
    } else {
        paintBtn.classList.remove('active');
        canvas.classList.remove('paint-mode');
        modeIndicator.textContent = '드로잉 모드';
        hideStatus();
    }
    
    document.getElementById('cameraControlsInfo').style.display = 'none';
}

// 패널 토글 함수들
function toggleShapesPanel() {
    const panel = document.getElementById('shapes-panel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    
    // 다른 패널 닫기
    document.getElementById('pen-panel').style.display = 'none';
    document.getElementById('map-panel').style.display = 'none';
    document.getElementById('text-panel').style.display = 'none';
    document.getElementById('image-panel').style.display = 'none';
    document.getElementById('paint-panel').style.display = 'none';
    document.getElementById('bridge-panel').style.display = 'none';
    document.getElementById('ctrl-shapes-panel').style.display = 'none';
    closeObjectInfo();
}

function toggleTextPanel() {
    const panel = document.getElementById('text-panel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    
    // 다른 패널 닫기
    document.getElementById('pen-panel').style.display = 'none';
    document.getElementById('map-panel').style.display = 'none';
    document.getElementById('shapes-panel').style.display = 'none';
    document.getElementById('image-panel').style.display = 'none';
    document.getElementById('paint-panel').style.display = 'none';
    document.getElementById('bridge-panel').style.display = 'none';
    document.getElementById('ctrl-shapes-panel').style.display = 'none';
    closeObjectInfo();
}

function toggleImagePanel() {
    const panel = document.getElementById('image-panel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    
    // 다른 패널 닫기
    document.getElementById('pen-panel').style.display = 'none';
    document.getElementById('map-panel').style.display = 'none';
    document.getElementById('shapes-panel').style.display = 'none';
    document.getElementById('text-panel').style.display = 'none';
    document.getElementById('paint-panel').style.display = 'none';
    document.getElementById('bridge-panel').style.display = 'none';
    document.getElementById('ctrl-shapes-panel').style.display = 'none';
    closeObjectInfo();
}

function togglePaintPanel() {
    const panel = document.getElementById('paint-panel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    
    // 다른 패널 닫기
    document.getElementById('pen-panel').style.display = 'none';
    document.getElementById('map-panel').style.display = 'none';
    document.getElementById('shapes-panel').style.display = 'none';
    document.getElementById('text-panel').style.display = 'none';
    document.getElementById('image-panel').style.display = 'none';
    document.getElementById('bridge-panel').style.display = 'none';
    document.getElementById('ctrl-shapes-panel').style.display = 'none';
    closeObjectInfo();
}

function toggleEraser() {
    isEraserMode = !isEraserMode;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isPaintMode = false;
    isBridgeMode = false;
    
    const eraserBtn = document.getElementById('eraserBtn');
    const pointerBtn = document.getElementById('pointerBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const shapeDrawBtn = document.getElementById('shapeDrawBtn');
    const paintBtn = document.getElementById('paintBtn');
    const bridgeBtn = document.getElementById('bridgeBtn');
    const canvas = document.getElementById('canvas');
    const modeIndicator = document.getElementById('modeIndicator');
    
    if (isEraserMode) {
        eraserBtn.classList.add('active');
        pointerBtn.classList.remove('active');
        cameraBtn.classList.remove('active');
        shapeDrawBtn.classList.remove('active');
        paintBtn.classList.remove('active');
        bridgeBtn.classList.remove('active');
        canvas.classList.add('eraser-mode');
        canvas.classList.remove('pointer-mode');
        canvas.classList.remove('moving-mode');
        canvas.classList.remove('camera-mode');
        canvas.classList.remove('shape-drawing-mode');
        canvas.classList.remove('paint-mode');
        canvas.classList.remove('bridge-mode');
        modeIndicator.textContent = '지우개 모드';
        showStatus('지우개 모드: 객체를 클릭하여 삭제');
    } else {
        eraserBtn.classList.remove('active');
        canvas.classList.remove('eraser-mode');
        modeIndicator.textContent = '드로잉 모드';
        hideStatus();
    }
    
    deselectAllObjects();
    document.getElementById('cameraControlsInfo').style.display = 'none';
    hideCtrlShapesPanel();
}

// 상태 표시 함수들
function showStatus(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.style.display = 'block';
}

function hideStatus() {
    document.getElementById('status').style.display = 'none';
}

// 오디오 패널 토글
function toggleAudioPanel() {
    const panel = document.getElementById('audio-panel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    
    // 다른 패널 닫기
    document.getElementById('pen-panel').style.display = 'none';
    document.getElementById('map-panel').style.display = 'none';
    document.getElementById('shapes-panel').style.display = 'none';
    document.getElementById('text-panel').style.display = 'none';
    document.getElementById('image-panel').style.display = 'none';
    document.getElementById('paint-panel').style.display = 'none';
    document.getElementById('bridge-panel').style.display = 'none';
    document.getElementById('ctrl-shapes-panel').style.display = 'none';
    closeObjectInfo();
}

// 오디오 컨텍스트 초기화
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 2048;
        const bufferLength = audioAnalyser.frequencyBinCount;
        audioDataArray = new Uint8Array(bufferLength);
    }
}

// 마이크 토글
async function toggleMicrophone() {
    if (!audioContext) {
        initAudioContext();
    }
    
    const micBtn = document.getElementById('micToggle');
    
    if (!isMicrophoneActive) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStream = stream;
            
            if (audioSource) {
                audioSource.disconnect();
            }
            
            audioSource = audioContext.createMediaStreamSource(stream);
            audioSource.connect(audioAnalyser);
            
            isMicrophoneActive = true;
            micBtn.textContent = '🎤 마이크 끄기';
            micBtn.classList.add('active');
            
            showStatus('마이크가 활성화되었습니다.');
        } catch (error) {
            console.error('마이크 접근 오류:', error);
            showStatus('마이크 접근에 실패했습니다.');
        }
    } else {
        if (microphoneStream) {
            microphoneStream.getTracks().forEach(track => track.stop());
            microphoneStream = null;
        }
        
        if (audioSource) {
            audioSource.disconnect();
            audioSource = null;
        }
        
        isMicrophoneActive = false;
        micBtn.textContent = '🎤 마이크 켜기';
        micBtn.classList.remove('active');
        
        showStatus('마이크가 비활성화되었습니다.');
    }
}

// 오디오 파일 처리
function handleAudioFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        audioFile = e.target.result;
        setupAudioPlayback();
    };
    reader.readAsArrayBuffer(file);
}

// 오디오 재생 설정
function setupAudioPlayback() {
    if (!audioContext) {
        initAudioContext();
    }
    
    if (audioSource) {
        audioSource.disconnect();
    }
    
    audioContext.decodeAudioData(audioFile, function(buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioAnalyser);
        source.connect(audioContext.destination);
        
        audioSource = source;
        
        // 재생 버튼 활성화
        const playBtn = document.getElementById('playPause');
        playBtn.disabled = false;
        playBtn.textContent = '▶️ 재생';
        
        showStatus('오디오 파일이 로드되었습니다.');
    }, function(error) {
        console.error('오디오 디코딩 오류:', error);
        showStatus('오디오 파일 로드에 실패했습니다.');
    });
}

// 오디오 재생/일시정지 토글
function toggleAudioPlayback() {
    if (!audioSource) return;
    
    const playBtn = document.getElementById('playPause');
    
    if (!isAudioPlaying) {
        if (audioSource.start) {
            audioSource.start(0);
        } else if (audioSource.noteOn) {
            audioSource.noteOn(0);
        }
        
        isAudioPlaying = true;
        playBtn.textContent = '⏸️ 일시정지';
        playBtn.classList.add('playing');
        
        showStatus('오디오 재생 중...');
    } else {
        if (audioContext.state === 'running') {
            audioContext.suspend().then(() => {
                isAudioPlaying = false;
                playBtn.textContent = '▶️ 재생';
                playBtn.classList.remove('playing');
                showStatus('오디오 일시정지');
            });
        } else if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                isAudioPlaying = true;
                playBtn.textContent = '⏸️ 일시정지';
                playBtn.classList.add('playing');
                showStatus('오디오 재생 중...');
            });
        }
    }
}

// 오디오 시각화 추가
function addAudioVisualization() {
    if (!audioContext || (!isMicrophoneActive && !audioSource)) {
        showStatus('먼저 오디오 소스를 활성화해주세요 (마이크 또는 파일)');
        return;
    }
    
    // 오디오 데이터 가져오기
    audioAnalyser.getByteFrequencyData(audioDataArray);
    
    let visualization;
    
    switch(audioType) {
        case 'wave':
            visualization = createWaveVisualization();
            break;
        case 'frequency':
            visualization = createFrequencyVisualization();
            break;
        case 'circle':
            visualization = createCircleVisualization();
            break;
        case 'sphere':
            visualization = createSphereVisualization();
            break;
        case 'particles':
            visualization = createParticleVisualization();
            break;
    }
    
    if (visualization) {
        visualization.name = `audio_${audioVisualizationIdCounter++}`;
        visualization.userData.isAudioVisualization = true;
        visualization.userData.audioType = audioType;
        drawingGroup.add(visualization);
        audioVisualizations.push(visualization);
        
        document.getElementById('audio-panel').style.display = 'none';
        showStatus('오디오 시각화가 추가되었습니다.');
        saveState();
    }
}

// 파형 시각화 생성
function createWaveVisualization() {
    const segments = 64;
    const points = [];
    
    for (let i = 0; i < segments; i++) {
        const x = (i - segments/2) * 0.1;
        const y = 0;
        const z = 0;
        points.push(new THREE.Vector3(x, y, z));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: getAudioColor(0),
        linewidth: 2
    });
    
    const line = new THREE.Line(geometry, material);
    line.userData.basePoints = points;
    line.userData.segments = segments;
    
    return line;
}

// 주파수 스펙트럼 시각화 생성
function createFrequencyVisualization() {
    const bars = 32;
    const geometry = new THREE.BoxGeometry(0.05, 1, 0.05);
    
    const group = new THREE.Group();
    
    for (let i = 0; i < bars; i++) {
        const material = new THREE.MeshStandardMaterial({
            color: getAudioColor(i / bars),
            emissive: getAudioColor(i / bars),
            emissiveIntensity: 0.3
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.x = (i - bars/2) * 0.1;
        bar.position.y = 0.5;
        bar.userData.index = i;
        bar.userData.maxHeight = 2;
        
        group.add(bar);
    }
    
    group.userData.bars = bars;
    
    return group;
}

// 원형 시각화 생성
function createCircleVisualization() {
    const segments = 64;
    const radius = 1;
    const points = [];
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, 0, y));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: getAudioColor(0),
        linewidth: 3
    });
    
    const circle = new THREE.Line(geometry, material);
    circle.userData.baseRadius = radius;
    circle.userData.segments = segments;
    
    return circle;
}

// 구체 시각화 생성
function createSphereVisualization() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: getAudioColor(0),
        emissive: getAudioColor(0),
        emissiveIntensity: 0.2,
        wireframe: true
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.userData.baseRadius = 0.5;
    
    return sphere;
}

// 입자 시스템 시각화 생성
function createParticleVisualization() {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 2;
        positions[i3 + 1] = (Math.random() - 0.5) * 2;
        positions[i3 + 2] = (Math.random() - 0.5) * 2;
        
        const color = getAudioColor(Math.random());
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true
    });
    
    const particles = new THREE.Points(geometry, material);
    particles.userData.particleCount = particleCount;
    particles.userData.basePositions = positions.slice();
    
    return particles;
}

// 오디오 색상 얻기
function getAudioColor(position) {
    switch(audioColorMode) {
        case 'spectrum':
            // 주파수 스펙트럼 색상 (빨간색에서 보라색까지)
            const hue = position * 300; // 0-300도 (빨간색에서 보라색)
            return new THREE.Color().setHSL(hue / 360, 1, 0.5);
            
        case 'mono':
            // 단색 (현재 선택된 색상)
            return new THREE.Color(color);
            
        case 'rainbow':
            // 레인보우 색상
            const rainbowHue = position * 360;
            return new THREE.Color().setHSL(rainbowHue / 360, 1, 0.5);
            
        default:
            return new THREE.Color(color);
    }
}

// 오디오 데이터에 따른 시각화 업데이트
function updateAudioVisualizations() {
    if (!audioAnalyser || !audioDataArray || audioVisualizations.length === 0) {
        return;
    }
    
    // 오디오 데이터 갱신
    audioAnalyser.getByteFrequencyData(audioDataArray);
    
    // 평균 볼륨 계산
    let sum = 0;
    for (let i = 0; i < audioDataArray.length; i++) {
        sum += audioDataArray[i];
    }
    const averageVolume = sum / audioDataArray.length;
    const normalizedVolume = averageVolume / 255;
    
    // 각 시각화 업데이트
    audioVisualizations.forEach(viz => {
        switch(viz.userData.audioType) {
            case 'wave':
                updateWaveVisualization(viz, normalizedVolume);
                break;
            case 'frequency':
                updateFrequencyVisualization(viz);
                break;
            case 'circle':
                updateCircleVisualization(viz, normalizedVolume);
                break;
            case 'sphere':
                updateSphereVisualization(viz, normalizedVolume);
                break;
            case 'particles':
                updateParticleVisualization(viz, normalizedVolume);
                break;
        }
    });
}

// 파형 시각화 업데이트
function updateWaveVisualization(viz, volume) {
    const positions = viz.geometry.attributes.position.array;
    const basePoints = viz.userData.basePoints;
    const segments = viz.userData.segments;
    
    for (let i = 0; i < segments; i++) {
        const i3 = i * 3;
        const audioIndex = Math.floor((i / segments) * audioDataArray.length);
        const audioValue = audioDataArray[audioIndex] / 255;
        
        positions[i3] = basePoints[i].x;
        positions[i3 + 1] = Math.sin(i * 0.3 + Date.now() * 0.005) * audioValue * audioScale * (audioSensitivity / 50);
        positions[i3 + 2] = basePoints[i].z;
    }
    
    viz.geometry.attributes.position.needsUpdate = true;
    
    // 색상 업데이트
    if (viz.material.color) {
        viz.material.color.copy(getAudioColor(volume));
    }
}

// 주파수 스펙트럼 업데이트
function updateFrequencyVisualization(viz) {
    const bars = viz.userData.bars;
    
    viz.children.forEach((bar, index) => {
        const audioIndex = Math.floor((index / bars) * audioDataArray.length);
        const audioValue = audioDataArray[audioIndex] / 255;
        
        // 높이 조정
        const targetHeight = audioValue * audioScale * (audioSensitivity / 50);
        bar.scale.y = targetHeight;
        bar.position.y = targetHeight / 2;
        
        // 색상 업데이트
        if (bar.material.color) {
            bar.material.color.copy(getAudioColor(index / bars));
            if (bar.material.emissive) {
                bar.material.emissive.copy(getAudioColor(index / bars));
                bar.material.emissiveIntensity = audioValue * 0.5;
            }
        }
    });
}

// 원형 시각화 업데이트
function updateCircleVisualization(viz, volume) {
    const positions = viz.geometry.attributes.position.array;
    const segments = viz.userData.segments;
    const baseRadius = viz.userData.baseRadius;
    
    for (let i = 0; i <= segments; i++) {
        const i3 = i * 3;
        const angle = (i / segments) * Math.PI * 2;
        const audioIndex = Math.floor((i / segments) * audioDataArray.length);
        const audioValue = audioDataArray[audioIndex] / 255;
        
        const radius = baseRadius + audioValue * audioScale * 0.5 * (audioSensitivity / 50);
        const waveOffset = Math.sin(angle * 5 + Date.now() * 0.005) * volume * 0.2;
        
        positions[i3] = Math.cos(angle) * (radius + waveOffset);
        positions[i3 + 1] = Math.sin(Date.now() * 0.002 + i * 0.1) * volume * 0.3;
        positions[i3 + 2] = Math.sin(angle) * (radius + waveOffset);
    }
    
    viz.geometry.attributes.position.needsUpdate = true;
    
    // 색상 업데이트
    if (viz.material.color) {
        viz.material.color.copy(getAudioColor(volume));
    }
}

// 구체 시각화 업데이트
function updateSphereVisualization(viz, volume) {
    // 크기 변화
    const pulse = 1 + Math.sin(Date.now() * 0.003) * volume * 0.2;
    viz.scale.setScalar(pulse);
    
    // 회전
    viz.rotation.x += 0.005;
    viz.rotation.y += 0.003;
    
    // 색상 및 발광 업데이트
    if (viz.material.color) {
        viz.material.color.copy(getAudioColor(volume));
        if (viz.material.emissive) {
            viz.material.emissive.copy(getAudioColor(volume));
            viz.material.emissiveIntensity = volume * 0.3;
        }
    }
}

// 입자 시스템 업데이트
function updateParticleVisualization(viz, volume) {
    const positions = viz.geometry.attributes.position.array;
    const basePositions = viz.userData.basePositions;
    const particleCount = viz.userData.particleCount;
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const audioIndex = Math.floor((i / particleCount) * audioDataArray.length);
        const audioValue = audioDataArray[audioIndex] / 255;
        
        // 기본 위치에서 오디오에 따라 변위
        const displacement = audioValue * audioScale * 0.1 * (audioSensitivity / 50);
        
        positions[i3] = basePositions[i3] + Math.sin(Date.now() * 0.001 + i) * displacement;
        positions[i3 + 1] = basePositions[i3 + 1] + Math.cos(Date.now() * 0.001 + i) * displacement;
        positions[i3 + 2] = basePositions[i3 + 2] + Math.sin(Date.now() * 0.002 + i * 0.5) * displacement;
    }
    
    viz.geometry.attributes.position.needsUpdate = true;
    
    // 색상 업데이트
    const colors = viz.geometry.attributes.color.array;
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const audioIndex = Math.floor((i / particleCount) * audioDataArray.length);
        const audioValue = audioDataArray[audioIndex] / 255;
        
        const particleColor = getAudioColor(audioValue);
        colors[i3] = particleColor.r;
        colors[i3 + 1] = particleColor.g;
        colors[i3 + 2] = particleColor.b;
    }
    
    viz.geometry.attributes.color.needsUpdate = true;
}

// 오디오 시각화 정리
function cleanupAudioVisualizations() {
    audioVisualizations.forEach(viz => {
        drawingGroup.remove(viz);
        viz.geometry.dispose();
        viz.material.dispose();
    });
    audioVisualizations = [];
}

// --- 회전 패널 및 기능 구현 시작 ---

function toggleRotatePanel() {
    const panel = document.getElementById('rotate-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    panel.style.display = isHidden ? 'flex' : 'none';
    
    if (isHidden) {
        // 다른 패널 닫기
        document.getElementById('pen-panel').style.display = 'none';
        document.getElementById('map-panel').style.display = 'none';
        document.getElementById('shapes-panel').style.display = 'none';
        document.getElementById('text-panel').style.display = 'none';
        document.getElementById('image-panel').style.display = 'none';
        document.getElementById('paint-panel').style.display = 'none';
        document.getElementById('bridge-panel').style.display = 'none';
        document.getElementById('ctrl-shapes-panel').style.display = 'none';
        document.getElementById('audio-panel').style.display = 'none';
        closeObjectInfo();
    }
}

function startRotation() {
    if (!selectedObject) {
        showStatus('회전할 객체를 먼저 선택해주세요 (포인터 모드)');
        return;
    }
    isObjectRotating = true;
    showStatus('회전 시작');
}

function stopRotation() {
    isObjectRotating = false;
    showStatus('회전 정지');
}

function resetRotation() {
    if (!selectedObject) {
        showStatus('객체를 선택해주세요.');
        return;
    }
    
    selectedObject.rotation.set(0, 0, 0);
    
    // 객체가 평면에 붙어있는 경우 기본 방향 보정
    if (selectedObject.name.startsWith('text_') || selectedObject.name.startsWith('image_') || selectedObject.name.startsWith('plane_')) {
        if (currentPlane === 'horizontal') selectedObject.rotation.x = -Math.PI / 2;
        else if (currentPlane === 'vertical-x') selectedObject.rotation.y = Math.PI / 2;
        // vertical-z는 0,0,0
    }
    
    isObjectRotating = false;
    showStatus('회전 초기화 완료');
    saveState();
}

function rotateSelectedObject(axis, angleDeg) {
    if (!selectedObject) {
        showStatus('회전할 객체를 선택해주세요.');
        return;
    }
    
    // 각도를 라디안으로 변환
    const radian = angleDeg * (Math.PI / 180);
    
    if (axis === 'x') selectedObject.rotation.x += radian;
    else if (axis === 'y') selectedObject.rotation.y += radian;
    else if (axis === 'z') selectedObject.rotation.z += radian;
    
    showStatus(`${axis.toUpperCase()}축으로 ${angleDeg}도 회전`);
    saveState();
}

// 자동 회전 체크박스 이벤트 리스너 (HTML에서 직접 호출되지 않는 경우를 대비)
document.getElementById('autoRotate').addEventListener('change', (e) => {
    if (e.target.checked) {
        startRotation();
    } else {
        stopRotation();
    }
});

// --- 애니메이션 기능 구현 ---

function toggleAnimationPanel() {
    const panel = document.getElementById('animation-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    panel.style.display = isHidden ? 'flex' : 'none';
    
    // 다른 패널 닫기 (기존 패널들)
    if (isHidden) {
        document.getElementById('pen-panel').style.display = 'none';
        document.getElementById('map-panel').style.display = 'none';
        document.getElementById('shapes-panel').style.display = 'none';
        document.getElementById('text-panel').style.display = 'none';
        document.getElementById('image-panel').style.display = 'none';
        document.getElementById('paint-panel').style.display = 'none';
        document.getElementById('bridge-panel').style.display = 'none';
        document.getElementById('rotate-panel').style.display = 'none';
        document.getElementById('audio-panel').style.display = 'none';
        closeObjectInfo();
    }
}

// 현재 장면의 모든 객체 상태를 캡처 (키프레임 저장)
function captureKeyframe() {
    const frameData = [];
    
    drawingGroup.children.forEach(child => {
        frameData.push({
            uuid: child.uuid, // 객체 고유 ID로 식별
            position: child.position.clone(),
            rotation: child.rotation.clone(),
            scale: child.scale.clone()
        });
    });

    if (frameData.length === 0) {
        showStatus('캡처할 객체가 없습니다.');
        return;
    }

    animationFrames.push(frameData);
    document.getElementById('frameCount').textContent = animationFrames.length;
    
    // 시각적 피드백
    showStatus(`프레임 ${animationFrames.length} 캡처됨`);
}

function toggleAnimation() {
    if (animationFrames.length < 2) {
        showStatus('애니메이션을 재생하려면 최소 2개의 프레임이 필요합니다.');
        return;
    }

    isAnimPlaying = !isAnimPlaying;
    const btn = document.getElementById('btnAnimPlay');
    
    if (isAnimPlaying) {
        btn.textContent = '⏸️ 일시정지';
        document.getElementById('animation-panel').classList.add('anim-playing');
        showStatus('애니메이션 재생 중...');
        
        // 재생 시작 시 초기화
        if (animProgress >= 1) {
            currentFrameIdx = 0;
            animProgress = 0;
        }
    } else {
        btn.textContent = '▶️ 재생';
        document.getElementById('animation-panel').classList.remove('anim-playing');
        showStatus('애니메이션 일시정지');
    }
}

function stopAnimation() {
    isAnimPlaying = false;
    currentFrameIdx = 0;
    animProgress = 0;
    
    document.getElementById('btnAnimPlay').textContent = '▶️ 재생';
    document.getElementById('animation-panel').classList.remove('anim-playing');
    
    // 첫 번째 프레임으로 복귀
    if (animationFrames.length > 0) {
        restoreFrame(0);
    }
    showStatus('애니메이션 정지');
}

function clearAnimation() {
    stopAnimation();
    animationFrames = [];
    document.getElementById('frameCount').textContent = '0';
    showStatus('모든 프레임이 삭제되었습니다.');
}

// 특정 프레임 상태로 즉시 복구
function restoreFrame(index) {
    if (!animationFrames[index]) return;
    
    const frameData = animationFrames[index];
    frameData.forEach(data => {
        const object = drawingGroup.children.find(child => child.uuid === data.uuid);
        if (object) {
            object.position.copy(data.position);
            object.rotation.copy(data.rotation);
            object.scale.copy(data.scale);
        }
    });
}

// 애니메이션 업데이트 루프 (프레임 간 보간)
function updateAnimation() {
    const speed = parseInt(document.getElementById('animSpeed').value);
    const speedFactor = speed * 0.0005; // 속도 조절 계수
    
    animProgress += speedFactor;
    
    // 다음 프레임으로 넘어감
    if (animProgress >= 1) {
        animProgress = 0;
        currentFrameIdx++;
        
        // 마지막 프레임 도달 시
        if (currentFrameIdx >= animationFrames.length - 1) {
            const isLoop = document.getElementById('animLoop').checked;
            if (isLoop) {
                currentFrameIdx = 0; // 처음으로 루프
            } else {
                stopAnimation(); // 정지
                return;
            }
        }
    }
    
    // 현재 프레임과 다음 프레임 사이를 보간(Interpolation)
    const currentFrame = animationFrames[currentFrameIdx];
    const nextFrame = animationFrames[currentFrameIdx + 1];
    
    if (!currentFrame || !nextFrame) return;

    // 각 객체별로 보간 적용
    nextFrame.forEach(nextData => {
        const object = drawingGroup.children.find(child => child.uuid === nextData.uuid);
        const currData = currentFrame.find(data => data.uuid === nextData.uuid);
        
        if (object && currData) {
            // 위치 보간 (Lerp)
            object.position.lerpVectors(currData.position, nextData.position, animProgress);
            
            // 크기 보간 (Lerp)
            object.scale.lerpVectors(currData.scale, nextData.scale, animProgress);
            
            // 회전 보간 (단순 Euler 보간)
            object.rotation.x = currData.rotation.x + (nextData.rotation.x - currData.rotation.x) * animProgress;
            object.rotation.y = currData.rotation.y + (nextData.rotation.y - currData.rotation.y) * animProgress;
            object.rotation.z = currData.rotation.z + (nextData.rotation.z - currData.rotation.z) * animProgress;
        }
    });
}

// [script.js] 파일 맨 끝에 추가

// --- 폴리곤 모델링 기능 구현 ---

function togglePolygonPanel() {
    const panel = document.getElementById('polygon-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    
    if (isHidden) {
        // 폴리곤 모드 활성화
        startPolygonMode();
        panel.style.display = 'flex';
    } else {
        // 패널 닫기 -> 모드 종료
        panel.style.display = 'none';
        isPolygonMode = false;
        document.getElementById('polygonBtn').classList.remove('active');
        document.getElementById('canvas').classList.remove('polygon-mode');
        resetPolygonVertices(); // 작업 중이던 점 초기화
        hideStatus();
    }
}

function startPolygonMode() {
    // 다른 모드들 끄기
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isPaintMode = false;
    isBridgeMode = false;
    isDrawing = false;
    
    // UI 업데이트
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('polygonBtn').classList.add('active');
    
    const canvas = document.getElementById('canvas');
    canvas.className = ''; // 기존 클래스 초기화
    canvas.classList.add('polygon-mode');
    
    isPolygonMode = true;
    showStatus('폴리곤 모드: 클릭하여 점을 찍으세요. (완료: 첫 점 클릭 or 완료 버튼)');
    
    // 다른 패널들 닫기
    const panels = ['pen-panel', 'map-panel', 'shapes-panel', 'text-panel', 'image-panel', 'paint-panel', 'bridge-panel', 'rotate-panel', 'animation-panel', 'audio-panel'];
    panels.forEach(id => {
        const p = document.getElementById(id);
        if(p) p.style.display = 'none';
    });
    closeObjectInfo();
}

// 클릭하여 점 추가
function handlePolygonClick(event) {
    const point = getIntersectionPoint(event);
    if (!point) return;

    // 첫 번째 점을 클릭했는지 확인 (닫기/완료 로직)
    if (polygonPoints.length > 2) {
        const firstPoint = polygonPoints[0];
        const dist = point.distanceTo(firstPoint);
        // 첫 점과 가까우면(클릭 오차 허용) 도형 닫기
        if (dist < 0.5) {
            finishPolygon();
            return;
        }
    }

    // 점 저장
    polygonPoints.push(point);

    // 1. 점(마커) 시각화
    const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(point);
    scene.add(marker);
    polygonMarkers.push(marker);

    // 2. 선(라인) 시각화
    if (polygonPoints.length > 1) {
        const prevPoint = polygonPoints[polygonPoints.length - 2];
        const geometry = new THREE.BufferGeometry().setFromPoints([prevPoint, point]);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        polygonLines.push(line);
    }
}

// 마우스 이동 시 가이드 라인 업데이트
function updatePolygonGuide(event) {
    const point = getIntersectionPoint(event);
    if (!point) return;

    const lastPoint = polygonPoints[polygonPoints.length - 1];

    // 기존 가이드 라인 제거
    if (polygonGuideLine) {
        scene.remove(polygonGuideLine);
        polygonGuideLine.geometry.dispose();
        polygonGuideLine.material.dispose();
    }

    // 새 가이드 라인 생성
    const geometry = new THREE.BufferGeometry().setFromPoints([lastPoint, point]);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5, dashSize: 0.2, gapSize: 0.1 });
    polygonGuideLine = new THREE.Line(geometry, material);
    scene.add(polygonGuideLine);
}

// 점 초기화 (취소)
function resetPolygonVertices() {
    // 마커 제거
    polygonMarkers.forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
    polygonMarkers = [];
    
    // 선 제거
    polygonLines.forEach(l => { scene.remove(l); l.geometry.dispose(); l.material.dispose(); });
    polygonLines = [];
    
    // 가이드 라인 제거
    if (polygonGuideLine) {
        scene.remove(polygonGuideLine);
        polygonGuideLine.geometry.dispose();
        polygonGuideLine.material.dispose();
        polygonGuideLine = null;
    }
    
    polygonPoints = [];
    showStatus('폴리곤 점이 초기화되었습니다.');
}

// 폴리곤 완성 및 3D 생성
function finishPolygon() {
    if (polygonPoints.length < 3) {
        showStatus('최소 3개의 점이 필요합니다.');
        return;
    }

    // 1. 3D 좌표를 2D Shape 좌표로 변환
    // 현재 평면(currentPlane)에 따라 투영 축이 달라짐
    const shape = new THREE.Shape();
    
    // 첫 점 이동
    if (currentPlane === 'horizontal') { // XZ 평면 -> x, z 사용
        shape.moveTo(polygonPoints[0].x, polygonPoints[0].z);
        for (let i = 1; i < polygonPoints.length; i++) {
            shape.lineTo(polygonPoints[i].x, polygonPoints[i].z);
        }
    } else if (currentPlane === 'vertical-x') { // YZ 평면 -> z, y 사용 (회전 고려)
        shape.moveTo(polygonPoints[0].z, polygonPoints[0].y);
        for (let i = 1; i < polygonPoints.length; i++) {
            shape.lineTo(polygonPoints[i].z, polygonPoints[i].y);
        }
    } else if (currentPlane === 'vertical-z') { // XY 평면 -> x, y 사용
        shape.moveTo(polygonPoints[0].x, polygonPoints[0].y);
        for (let i = 1; i < polygonPoints.length; i++) {
            shape.lineTo(polygonPoints[i].x, polygonPoints[i].y);
        }
    }
    
    shape.closePath();

    // 2. Extrude 설정 가져오기
    const depth = parseFloat(document.getElementById('polyDepth').value);
    const bevel = document.getElementById('polyBevel').checked;

    const extrudeSettings = {
        steps: 1,
        depth: depth,
        bevelEnabled: bevel,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2
    };

    // 3. 지오메트리 생성
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // 4. 중심점 맞추기 (Center Geometry)
    geometry.center();

    // 5. 메쉬 생성
    const material = new THREE.MeshStandardMaterial({ 
        color: color, 
        roughness: 0.5, 
        metalness: 0.5,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);

    // 6. 위치 및 회전 복구
    // geometry.center()로 인해 원점으로 이동했으므로, 원래 점들의 중심 위치로 이동시켜야 함
    const center = new THREE.Vector3();
    const box = new THREE.Box3().setFromPoints(polygonPoints);
    box.getCenter(center);

    // 회전 및 위치 적용
    if (currentPlane === 'horizontal') {
        mesh.rotation.x = Math.PI / 2; // Extrude는 기본적으로 Z축으로 솟음 -> 눕혀야 함
        mesh.position.set(center.x, center.y, center.z);
    } else if (currentPlane === 'vertical-x') {
        mesh.rotation.y = Math.PI / 2;
        mesh.position.set(center.x, center.y, center.z);
    } else if (currentPlane === 'vertical-z') {
        // 기본 방향이 XY평면이므로 회전 불필요 (단, Extrude 방향 고려)
        mesh.position.set(center.x, center.y, center.z);
    }

    mesh.name = `polygon_${shapeIdCounter++}`;
    drawingGroup.add(mesh);

    // 7. 정리
    resetPolygonVertices();
    showStatus('폴리곤 모델이 생성되었습니다!');
    saveState();
}

// input range 값 표시 업데이트 리스너
document.getElementById('polyDepth').addEventListener('input', (e) => {
    document.getElementById('polyDepthValue').textContent = e.target.value;
});

// --- 객체 복제 기능 구현 ---

function duplicateSelectedObjects() {
    // 1. 선택된 객체가 있는지 확인
    if (!selectedObject && selectedObjects.length === 0) {
        showStatus('복제할 객체를 선택해주세요. (포인터 모드)');
        return;
    }

    // 복제된 새 객체들을 담을 배열
    let newClones = [];
    
    // 이동 오프셋 (원본과 겹치지 않게 약간 옆으로 이동)
    // 현재 평면 설정에 따라 이동 방향을 다르게 설정
    let offset;
    if (currentPlane === 'horizontal') {
        offset = new THREE.Vector3(1, 0, 1);
    } else if (currentPlane === 'vertical-x') {
        offset = new THREE.Vector3(0, 1, 1);
    } else {
        offset = new THREE.Vector3(1, 1, 0);
    }

    // 복제 처리 내부 함수
    const processClone = (original) => {
        // 기존의 cloneObject 함수 재사용 (깊은 복사)
        const cloned = cloneObject(original);
        
        if (cloned) {
            // 1. 위치 오프셋 적용
            cloned.position.add(offset);
            
            // 2. 새로운 고유 이름 부여 (충돌 방지)
            // 예: "cube_1" -> "cube_1_copy_123"
            const typeName = original.name.split('_')[0] || 'object';
            cloned.name = `${typeName}_copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            
            // 3. 씬에 추가
            drawingGroup.add(cloned);
            
            // 4. 오디오 시각화 객체인 경우 처리
            if (original.userData.isAudioVisualization) {
                cloned.userData = JSON.parse(JSON.stringify(original.userData));
                audioVisualizations.push(cloned);
            }

            return cloned;
        }
        return null;
    };

    // 2. 다중 선택 복제
    if (selectedObjects.length > 0) {
        // 기존 선택된 객체들을 순회하며 복제
        selectedObjects.forEach(obj => {
            const cloned = processClone(obj);
            if (cloned) newClones.push(cloned);
        });

        // 기존 선택 해제 후 새 객체들 선택
        deselectAllObjects();
        
        // 다중 선택 모드 활성화 및 새 객체들 선택
        isMultiSelectMode = true;
        selectedObjects = newClones;
        selectedObjects.forEach(obj => applySelectionEffect(obj));
        
        showStatus(`${newClones.length}개의 객체가 복제되었습니다.`);
        showMultiObjectInfo(); // 정보 패널 갱신
    } 
    // 3. 단일 선택 복제
    else if (selectedObject) {
        const cloned = processClone(selectedObject);
        
        if (cloned) {
            // 기존 선택 해제 후 새 객체 선택
            deselectAllObjects();
            
            selectedObject = cloned;
            applySelectionEffect(cloned);
            
            showStatus('객체가 복제되었습니다.');
            showObjectInfo(cloned); // 정보 패널 갱신
        }
    }

    // 4. 상태 저장 (Undo를 위해)
    saveState();
}

// --- 스컬프팅 기능 구현 ---

function toggleSculptPanel() {
    const panel = document.getElementById('sculpt-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    
    if (isHidden) {
        startSculptMode();
        panel.style.display = 'flex';
    } else {
        panel.style.display = 'none';
        isSculptMode = false;
        document.getElementById('sculptBtn').classList.remove('active');
        document.getElementById('canvas').classList.remove('sculpt-mode');
        
        // 브러시 가이드 제거
        if (sculptBrushMesh) {
            scene.remove(sculptBrushMesh);
            sculptBrushMesh = null;
        }
        hideStatus();
    }
}

function startSculptMode() {
    // 다른 모드들 끄기
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isPaintMode = false;
    isBridgeMode = false;
    isPolygonMode = false;
    isDrawing = false;
    
    // UI 업데이트
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('sculptBtn').classList.add('active');
    
    const canvas = document.getElementById('canvas');
    canvas.className = '';
    canvas.classList.add('sculpt-mode');
    
    isSculptMode = true;
    showStatus('스컬프팅 모드: 객체를 드래그하여 형태를 변형하세요.');
    
    // 다른 패널들 닫기
    const panels = ['pen-panel', 'map-panel', 'shapes-panel', 'text-panel', 'image-panel', 'paint-panel', 'bridge-panel', 'rotate-panel', 'animation-panel', 'audio-panel', 'polygon-panel'];
    panels.forEach(id => {
        const p = document.getElementById(id);
        if(p) p.style.display = 'none';
    });
    closeObjectInfo();

    // 브러시 가이드 생성
    const geometry = new THREE.RingGeometry(0.4, 0.5, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    sculptBrushMesh = new THREE.Mesh(geometry, material);
    sculptBrushMesh.rotation.x = -Math.PI / 2;
    sculptBrushMesh.visible = false;
    scene.add(sculptBrushMesh);
}

function setSculptMode(mode, btnElement) {
    sculptTool = mode;
    
    // 버튼 스타일 업데이트
    document.querySelectorAll('.sculpt-mode-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    
    showStatus(mode === 'pull' ? '모드: 융기 (당기기)' : '모드: 침식 (밀어넣기)');
}

function updateSculptBrush(event) {
    if (!sculptBrushMesh) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(drawingGroup.children, true);
    
    if (intersects.length > 0) {
        const hit = intersects[0];
        sculptBrushMesh.visible = true;
        sculptBrushMesh.position.copy(hit.point);
        // 표면의 법선(Normal) 방향에 맞춰 브러시 회전
        if (hit.face) {
            sculptBrushMesh.lookAt(hit.point.clone().add(hit.face.normal));
        }
        
        // 브러시 크기 반영
        const radius = parseFloat(document.getElementById('sculptRadius').value);
        const scale = radius * 2; // 링 크기 조절
        sculptBrushMesh.scale.set(scale, scale, scale);
    } else {
        sculptBrushMesh.visible = false;
    }
}

function sculptMesh(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(drawingGroup.children, true);
    
    if (intersects.length > 0) {
        const intersect = intersects[0];
        const mesh = intersect.object;
        
        // Mesh가 아니거나 position 속성이 없으면 패스
        if (!mesh.isMesh || !mesh.geometry.attributes.position) return;

        const point = intersect.point; // 월드 좌표계의 충돌 지점
        const geometry = mesh.geometry;
        const positions = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        
        // 설정값 가져오기
        const radius = parseFloat(document.getElementById('sculptRadius').value);
        const intensity = parseFloat(document.getElementById('sculptIntensity').value) * 0.1;
        const direction = sculptTool === 'pull' ? 1 : -1;

        // 월드 좌표 -> 로컬 좌표 변환 (Geometry 처리를 위해)
        const localPoint = mesh.worldToLocal(point.clone());
        
        let modified = false;

        // 모든 버텍스를 순회하며 범위 내에 있는지 확인
        // (성능 최적화를 위해 BVH 등을 쓸 수 있지만 여기선 단순 거리 계산 사용)
        const v = new THREE.Vector3();
        
        for (let i = 0; i < positions.count; i++) {
            v.fromBufferAttribute(positions, i);
            
            const dist = v.distanceTo(localPoint);
            
            if (dist < radius) {
                // 거리에 따른 영향력 계산 (중심일수록 강하게)
                const falloff = Math.pow(1 - dist / radius, 2); // 부드러운 곡선
                const moveAmount = intensity * falloff * direction;
                
                // 해당 버텍스의 법선 벡터 가져오기
                let normal = new THREE.Vector3();
                if (normals) {
                    normal.fromBufferAttribute(normals, i);
                } else {
                    // 법선이 없으면 중심에서 밖으로 향하는 방향 사용
                    normal.copy(v).normalize();
                }

                // 버텍스 이동
                v.addScaledVector(normal, moveAmount);
                
                // 변경된 위치 적용
                positions.setXYZ(i, v.x, v.y, v.z);
                modified = true;
            }
        }

        if (modified) {
            positions.needsUpdate = true;
            geometry.computeVertexNormals(); // 조명 효과 업데이트를 위해 법선 재계산
        }
    }
}

// --- 세부 조각(Vertex Editing) 기능 구현 ---

function toggleDetailPanel() {
    const panel = document.getElementById('detail-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    
    if (isHidden) {
        if (!selectedObject || !selectedObject.isMesh) {
            showStatus('편집할 객체(Mesh)를 먼저 선택해주세요. (포인터 모드)');
            return;
        }
        startDetailMode();
        panel.style.display = 'flex';
    } else {
        endDetailMode();
        panel.style.display = 'none';
    }
}

function startDetailMode() {
    // 다른 모드 끄기
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isPaintMode = false;
    isBridgeMode = false;
    isPolygonMode = false;
    isSculptMode = false;
    isDrawing = false;

    // UI 업데이트
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('detailBtn').classList.add('active');
    
    const canvas = document.getElementById('canvas');
    canvas.className = '';
    canvas.classList.add('detail-mode');

    isDetailMode = true;
    detailTargetMesh = selectedObject; // 현재 선택된 객체를 타겟으로 설정

    // 다른 패널 닫기
    const panels = ['pen-panel', 'map-panel', 'shapes-panel', 'text-panel', 'image-panel', 'paint-panel', 'bridge-panel', 'rotate-panel', 'animation-panel', 'audio-panel', 'polygon-panel', 'sculpt-panel'];
    panels.forEach(id => {
        const p = document.getElementById(id);
        if(p) p.style.display = 'none';
    });
    closeObjectInfo();

    showStatus('세부 조각 모드: 점을 드래그하여 형태를 수정하세요.');

    // 시각적 가이드(점, 선) 생성
    createDetailVisuals();
}

function endDetailMode() {
    isDetailMode = false;
    detailTargetMesh = null;
    selectedDetailVertex = null;
    detailVertexIndex = -1;

    // 가이드 제거
    if (detailHelperGroup) {
        scene.remove(detailHelperGroup);
        // 메모리 정리
        detailHelperGroup.children.forEach(child => {
            if(child.geometry) child.geometry.dispose();
            if(child.material) child.material.dispose();
        });
        detailHelperGroup = null;
    }

    document.getElementById('detailBtn').classList.remove('active');
    document.getElementById('canvas').classList.remove('detail-mode');
    hideStatus();
}

function createDetailVisuals() {
    if (!detailTargetMesh) return;

    if (detailHelperGroup) {
        scene.remove(detailHelperGroup);
    }

    detailHelperGroup = new THREE.Group();
    scene.add(detailHelperGroup);

    // 1. 와이어프레임 (격자 선) 생성
    if (document.getElementById('showWireframe').checked) {
        const wireframeGeo = new THREE.WireframeGeometry(detailTargetMesh.geometry);
        const wireframeMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.5 });
        const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
        
        // 타겟 메쉬의 위치/회전/크기 따라가기
        wireframe.position.copy(detailTargetMesh.position);
        wireframe.rotation.copy(detailTargetMesh.rotation);
        wireframe.scale.copy(detailTargetMesh.scale);
        
        detailHelperGroup.add(wireframe);
    }

    // 2. 버텍스 포인트 (점) 생성
    if (document.getElementById('showPoints').checked) {
        const positionAttribute = detailTargetMesh.geometry.attributes.position;
        const vertexCount = positionAttribute.count;
        
        // 점 생성 (성능을 위해 구체가 아닌 Points나 Sprite를 쓸 수도 있지만, 드래그 편의상 작은 구체 사용)
        // 버텍스 수가 너무 많으면 성능 저하가 올 수 있음 -> 단순 도형에 적합
        const sphereGeo = new THREE.SphereGeometry(0.1, 8, 8); // 작은 점
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        for (let i = 0; i < vertexCount; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // 로컬 좌표 -> 월드 좌표 변환 (메쉬의 변형 적용)
            vertex.applyMatrix4(detailTargetMesh.matrixWorld);

            const point = new THREE.Mesh(sphereGeo, sphereMat.clone());
            point.position.copy(vertex);
            point.userData.vertexIndex = i; // 인덱스 저장
            point.userData.isHelper = true;
            
            detailHelperGroup.add(point);
        }
    }
}

function updateDetailVisuals() {
    // 체크박스 변경 시 재생성
    if (isDetailMode && detailTargetMesh) {
        createDetailVisuals();
    }
}

function handleDetailVertexClick(event) {
    if (!detailHelperGroup) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // 헬퍼 그룹 내의 점들과 충돌 검사
    const intersects = raycaster.intersectObjects(detailHelperGroup.children);
    
    for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        if (object.userData.isHelper) {
            selectedDetailVertex = object;
            detailVertexIndex = object.userData.vertexIndex;
            
            // 선택된 점 색상 변경
            object.material.color.set(0xff0000); 
            showStatus('점 선택됨: 드래그하여 이동');
            return;
        }
    }
}

function moveDetailVertex(event) {
    if (!selectedDetailVertex || !detailTargetMesh) return;

    // 마우스 위치로 점 이동 (DrawingPlane 이용)
    const point = getIntersectionPoint(event);
    if (point) {
        // 1. 헬퍼 점 이동 (시각적)
        // 현재 평면 설정에 따라 이동 제한 (편의상)
        if (currentPlane === 'horizontal') {
            selectedDetailVertex.position.set(point.x, selectedDetailVertex.position.y, point.z); // Y축 고정? 아니면 자유? -> 스컬프팅이므로 보통 자유가 좋지만 DrawingPlane을 따름
            // *자유 이동을 원하면 DrawingPlane 높이(Y)를 마우스 휠로 조절하며 쓰면 됨
             selectedDetailVertex.position.copy(point); // 완전 자유 이동
        } else {
             selectedDetailVertex.position.copy(point);
        }

        // 2. 실제 메쉬의 버텍스 업데이트
        // 월드 좌표(헬퍼 위치) -> 로컬 좌표(메쉬 기준) 변환
        const localPoint = selectedDetailVertex.position.clone();
        detailTargetMesh.worldToLocal(localPoint);

        const positionAttribute = detailTargetMesh.geometry.attributes.position;
        positionAttribute.setXYZ(detailVertexIndex, localPoint.x, localPoint.y, localPoint.z);
        positionAttribute.needsUpdate = true;
        
        // 법선 재계산 (조명 효과)
        detailTargetMesh.geometry.computeVertexNormals();

        // 3. 와이어프레임 가이드도 같이 업데이트 (매 프레임 재생성은 무거우니 위치만 이동하거나, 여기선 생략하고 드래그 끝나면 갱신)
        // 즉각적인 피드백을 위해 와이어프레임은 잠시 숨기거나, 놔두는게 좋음.
        // 여기서는 점만 움직이고, 선은 드래그 끝나고 갱신하는게 성능상 좋음.
    }
}

function highlightDetailVertex(event) {
    if (!detailHelperGroup) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(detailHelperGroup.children);
    
    // 모든 점 색상 초기화
    detailHelperGroup.children.forEach(child => {
        if (child.userData.isHelper) {
            if (child === selectedDetailVertex) child.material.color.set(0xff0000); // 드래그 중인건 빨강 유지
            else child.material.color.set(0xffff00); // 기본 노랑
        }
    });

    // 호버된 점 하이라이트
    for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        if (object.userData.isHelper && object !== selectedDetailVertex) {
            object.material.color.set(0xffa500); // 주황색
            break;
        }
    }
}

// --- 면 분할 기능 (평면 중간에 점 추가) ---

function subdivideTargetMesh() {
    if (!detailTargetMesh || !detailTargetMesh.isMesh) {
        showStatus('분할할 객체가 없습니다.');
        return;
    }
    
    let geometry = detailTargetMesh.geometry;
    
    // 1. 인덱스가 있는 형상이면 Non-Indexed로 변환 (계산 단순화)
    if (geometry.index) {
        geometry = geometry.toNonIndexed();
        detailTargetMesh.geometry = geometry;
    }
    
    const posAttr = geometry.attributes.position;
    const newPositions = [];
    
    // 2. 기존의 모든 삼각형 면을 순회
    for (let i = 0; i < posAttr.count; i += 3) {
        // 삼각형의 세 꼭짓점 가져오기
        const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i);
        const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
        const v3 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);
        
        // 3. 면의 중심점(Center) 계산 -> 여기가 새로운 '평면 점'이 됩니다.
        const center = new THREE.Vector3().addVectors(v1, v2).add(v3).divideScalar(3);
        
        // 4. 하나의 삼각형을 중심점을 기준으로 3개의 작은 삼각형으로 분할
        // Triangle 1: v1 -> v2 -> center
        newPositions.push(v1.x, v1.y, v1.z);
        newPositions.push(v2.x, v2.y, v2.z);
        newPositions.push(center.x, center.y, center.z);
        
        // Triangle 2: v2 -> v3 -> center
        newPositions.push(v2.x, v2.y, v2.z);
        newPositions.push(v3.x, v3.y, v3.z);
        newPositions.push(center.x, center.y, center.z);
        
        // Triangle 3: v3 -> v1 -> center
        newPositions.push(v3.x, v3.y, v3.z);
        newPositions.push(v1.x, v1.y, v1.z);
        newPositions.push(center.x, center.y, center.z);
    }
    
    // 5. 새로운 위치 데이터로 지오메트리 업데이트
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    
    // 법선(Normal) 재계산 (빛 반사 업데이트)
    geometry.computeVertexNormals();
    
    // 6. 시각적 가이드(노란 점) 즉시 갱신
    createDetailVisuals();
    
    showStatus('면이 분할되었습니다. 이제 평면 가운데 점을 드래그해보세요!');
    saveState();
}

// --- 동영상 추가 기능 구현 ---

function toggleVideoPanel() {
    const panel = document.getElementById('video-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    
    panel.style.display = isHidden ? 'flex' : 'none';
    
    if (isHidden) {
        // 다른 패널 닫기
        const panels = ['pen-panel', 'map-panel', 'shapes-panel', 'text-panel', 'image-panel', 'paint-panel', 'bridge-panel', 'rotate-panel', 'animation-panel', 'audio-panel', 'polygon-panel', 'sculpt-panel', 'detail-panel'];
        panels.forEach(id => {
            const p = document.getElementById(id);
            if(p) p.style.display = 'none';
        });
        closeObjectInfo();
    }
}

function addVideo() {
    const fileInput = document.getElementById('videoFile');
    const urlInput = document.getElementById('videoUrl');
    const width = parseFloat(document.getElementById('videoWidth').value);
    const height = parseFloat(document.getElementById('videoHeight').value);
    
    let videoSrc = '';
    
    // 1. 파일이 선택되었는지 확인
    if (fileInput.files && fileInput.files[0]) {
        videoSrc = URL.createObjectURL(fileInput.files[0]);
    } 
    // 2. URL이 입력되었는지 확인
    else if (urlInput.value.trim() !== '') {
        videoSrc = urlInput.value.trim();
    } else {
        alert('동영상 파일이나 URL을 입력해주세요.');
        return;
    }
    
    // 3. HTML Video Element 생성
    const video = document.createElement('video');
    
    // [중요] 속성 설정 순서 및 CORS 설정
    video.crossOrigin = "anonymous"; // 다른 서버의 영상을 3D에 입히기 위해 필수
    video.loop = true;
    video.muted = true; // 브라우저 자동 재생 정책상 필수
    video.playsInline = true;
    
    // [추가된 부분] 에러 핸들링 (검은 화면 원인 파악용)
    video.onerror = function() {
        console.error("비디오 로드 에러:", video.error);
        alert("동영상을 로드할 수 없습니다.\n\n[원인 가능성]\n1. 유튜브 URL은 지원되지 않습니다. (.mp4 등 직접 파일 주소만 가능)\n2. 해당 서버가 외부 사이트에서의 접근(CORS)을 차단했습니다.\n3. 유효하지 않은 URL입니다.");
    };

    video.src = videoSrc;
    video.load(); // 명시적 로드 호출

    // 4. 비디오 재생 시도
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // 재생 성공
            console.log("비디오 재생 시작됨");
        })
        .catch(error => {
            console.warn("비디오 자동 재생 차단됨 (사용자 클릭 필요할 수 있음):", error);
        });
    }
    
    // 5. 비디오 텍스처 생성
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    
    // 6. 평면 메쉬 생성
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // 7. 위치 설정
    if (currentPlane === 'horizontal') {
        mesh.position.set(0, planePosition.y + height/2, 0); 
    } else if (currentPlane === 'vertical-x') {
        mesh.position.set(planePosition.x, 0, 0);
        mesh.rotation.y = Math.PI / 2;
    } else if (currentPlane === 'vertical-z') {
        mesh.position.set(0, 0, planePosition.z);
    }
    
    mesh.name = `video_${videoIdCounter++}`;
    
    // 8. 데이터 저장
    mesh.userData = {
        videoElement: video,
        isVideo: true
    };
    
    drawingGroup.add(mesh);
    videoElements.push(video); 
    
    // 9. 정리
    fileInput.value = ''; 
    urlInput.value = ''; // URL 입력창도 초기화
    toggleVideoPanel();
    
    // 파일인 경우 바로 로드되지만, URL인 경우 시간이 걸릴 수 있어 안내 메시지 수정
    showStatus('동영상 객체가 생성되었습니다. (검은 화면이면 URL 보안 정책 문제입니다)');
    saveState();
}


// --- MOUSE 시뮬레이션 기능 구현 ---

function toggleMousePanel() {
    const panel = document.getElementById('mouse-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    
    if (isHidden) {
        startMouseMode();
        panel.style.display = 'flex';
    } else {
        endMouseMode();
        panel.style.display = 'none';
    }
}

function startMouseMode() {
    // 다른 모드 끄기
    isEraserMode = false;
    isPointerMode = false;
    isMovingObjects = false;
    isCameraMode = false;
    isShapeDrawingMode = false;
    isPaintMode = false;
    isBridgeMode = false;
    isPolygonMode = false;
    isSculptMode = false;
    isDetailMode = false;
    isDrawing = false;
    
    // UI 업데이트
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('mouseBtn').classList.add('active');
    
    const canvas = document.getElementById('canvas');
    canvas.className = '';
    canvas.classList.add('mouse-mode');
    
    isMouseMode = true;
    
    // 기본 도구 선택 (쥐)
    if (!currentMouseTool) {
        const firstBtn = document.querySelector('.mouse-tool-btn');
        if (firstBtn) setMouseTool('mouse', firstBtn);
    }
    
    // 다른 패널 닫기
    const panels = ['pen-panel', 'map-panel', 'shapes-panel', 'text-panel', 'image-panel', 'paint-panel', 'bridge-panel', 'rotate-panel', 'animation-panel', 'audio-panel', 'polygon-panel', 'sculpt-panel', 'detail-panel', 'video-panel'];
    panels.forEach(id => {
        const p = document.getElementById(id);
        if(p) p.style.display = 'none';
    });
    closeObjectInfo();
    
    showStatus('MOUSE 모드: 원하는 위치에 클릭하여 배치하세요.');
}

function endMouseMode() {
    isMouseMode = false;
    document.getElementById('mouseBtn').classList.remove('active');
    document.getElementById('canvas').classList.remove('mouse-mode');
    hideStatus();
}

function setMouseTool(tool, btnElement) {
    currentMouseTool = tool;
    
    // 버튼 스타일 업데이트
    document.querySelectorAll('.mouse-tool-btn').forEach(b => b.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    
    let msg = '';
    if (tool === 'mouse') msg = '도구: 🐭 쥐 (클릭하여 소환)';
    else if (tool === 'cheese') msg = '도구: 🧀 치즈 (쥐를 유인)';
    else if (tool === 'trap') msg = '도구: 🪤 덫 (쥐를 잡음)';
    
    showStatus(msg);
}

function spawnMouseItem(event) {
    const point = getIntersectionPoint(event);
    if (!point) return;
    
    if (currentMouseTool === 'mouse') {
        createMouseAgent(point);
    } else if (currentMouseTool === 'cheese') {
        createCheeseItem(point);
    } else if (currentMouseTool === 'trap') {
        createTrapItem(point);
    }
}

function createMouseAgent(position) {
    const group = new THREE.Group();
    
    // 몸통
    const bodyGeo = new THREE.ConeGeometry(0.2, 0.5, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x808080 }); // 회색 쥐
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2; // 눕힘
    body.position.z = -0.1;
    
    // 귀
    const earGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const earMat = new THREE.MeshStandardMaterial({ color: 0xffaaaa }); // 분홍 귀
    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(0.1, 0.1, 0.1);
    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(-0.1, 0.1, 0.1);
    
    group.add(body);
    group.add(earL);
    group.add(earR);
    
    // 위치 설정 (바닥 위)
    if (currentPlane === 'horizontal') {
        group.position.set(position.x, position.y + 0.15, position.z);
    } else {
        group.position.copy(position);
    }
    
    group.userData = {
        isMouseAgent: true,
        velocity: new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize(), // 초기 랜덤 방향
        state: 'wander', // wander, seek, dead
        target: null
    };
    
    group.name = `mouse_${Date.now()}`;
    drawingGroup.add(group);
    mouseAgents.push(group);
}

function createCheeseItem(position) {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xfbbf24 }); // 노란색
    const cheese = new THREE.Mesh(geometry, material);
    
    if (currentPlane === 'horizontal') {
        cheese.position.set(position.x, position.y + 0.05, position.z);
    } else {
        cheese.position.copy(position);
    }
    
    cheese.name = `cheese_${Date.now()}`;
    cheese.userData = { isCheese: true };
    
    drawingGroup.add(cheese);
    cheeseItems.push(cheese);
}

function createTrapItem(position) {
    const geometry = new THREE.BoxGeometry(0.6, 0.05, 0.6);
    const material = new THREE.MeshStandardMaterial({ color: 0x374151 }); // 검은색
    const trap = new THREE.Mesh(geometry, material);
    
    // 미끼 부분 (빨간 점)
    const baitGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const baitMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bait = new THREE.Mesh(baitGeo, baitMat);
    bait.position.y = 0.05;
    trap.add(bait);
    
    if (currentPlane === 'horizontal') {
        trap.position.set(position.x, position.y + 0.025, position.z);
    } else {
        trap.position.copy(position);
    }
    
    trap.name = `trap_${Date.now()}`;
    trap.userData = { isTrap: true };
    
    drawingGroup.add(trap);
    trapItems.push(trap);
}

function clearMouseItems() {
    // 쥐, 치즈, 덫 모두 제거
    const toRemove = [];
    drawingGroup.children.forEach(child => {
        if (child.userData.isMouseAgent || child.userData.isCheese || child.userData.isTrap) {
            toRemove.push(child);
        }
    });
    
    toRemove.forEach(obj => {
        drawingGroup.remove(obj);
        // 메모리 해제 등은 생략
    });
    
    mouseAgents = [];
    cheeseItems = [];
    trapItems = [];
    
    showStatus('시뮬레이션이 초기화되었습니다.');
}

//함수를 아래 코드로 완전히 교체하세요.

function updateMouseSimulation() {
    const speedVal = parseFloat(document.getElementById('mouseSpeed').value);
    const moveSpeed = speedVal * 0.03; // 속도 계수
    
    // 설정값
    const detectRadius = 15.0; // 치즈 감지 거리 (넓게)
    const eatRadius = 0.8;     // 치즈 먹는 거리
    const trapRadius = 0.5;    // 덫 걸리는 거리
    const wallCheckDist = 1.0; // 벽 감지 거리
    const mapLimit = 9.5;      // 맵 밖으로 나가지 못하게 하는 한계선

    const raycaster = new THREE.Raycaster();
    
    mouseAgents.forEach(mouse => {
        // --- 0. 덫에 걸린 상태 처리 (3초 대기) ---
        if (mouse.userData.state === 'trapped') {
            if (Date.now() - mouse.userData.trapTime > 3000) {
                // 3초 지남: 덫 제거 및 해방
                const trap = mouse.userData.trappedBy;
                if (trap) {
                    drawingGroup.remove(trap);
                    const idx = trapItems.indexOf(trap);
                    if (idx > -1) trapItems.splice(idx, 1);
                }
                mouse.userData.state = 'wander'; // 다시 움직임
                mouse.userData.trappedBy = null;
            }
            return; // 덫에 걸려있으면 아래 이동 로직 실행 안 함 (멈춤)
        }

        // --- 1. 평면 고정 (절대 날아다니지 않게 함) ---
        // 현재 평면에 딱 붙여버립니다. 시선도 수평으로만 돌리게 됩니다.
        if (currentPlane === 'horizontal') {
            mouse.position.y = planePosition.y + 0.15; // 바닥 높이 고정
            mouse.rotation.x = 0; 
            mouse.rotation.z = 0;
        } else if (currentPlane === 'vertical-x') {
            mouse.position.x = planePosition.x + 0.15;
            mouse.rotation.y = 0;
            mouse.rotation.z = 0;
        } else if (currentPlane === 'vertical-z') {
            mouse.position.z = planePosition.z + 0.15;
            mouse.rotation.x = 0;
            mouse.rotation.y = 0;
        }

        // --- 2. 덫 충돌 체크 ---
        for (let i = 0; i < trapItems.length; i++) {
            if (mouse.position.distanceTo(trapItems[i].position) < trapRadius) {
                // 덫에 걸림!
                mouse.userData.state = 'trapped';
                mouse.userData.trapTime = Date.now(); // 걸린 시간 기록
                mouse.userData.trappedBy = trapItems[i]; // 어떤 덫인지 기록
                return; // 즉시 정지
            }
        }

        // --- 3. 벽/객체 감지 (레이캐스트) ---
        let isBlocked = false;
        
        // 쥐의 정면 방향
        const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(mouse.quaternion);
        raycaster.set(mouse.position, direction);
        
        // 충돌 검사 (자기 자신, 바닥, 치즈, 덫 제외한 모든 객체)
        const intersects = raycaster.intersectObjects(drawingGroup.children, true).filter(hit => {
            let obj = hit.object;
            while(obj.parent && obj.parent !== drawingGroup) obj = obj.parent;
            
            return obj !== mouse && 
                   !obj.userData.isMouseAgent && 
                   !obj.userData.isCheese && 
                   !obj.userData.isTrap &&
                   !hit.object.name.startsWith('plain_') &&
                   !hit.object.name.startsWith('paint_') &&
                   !hit.object.name.startsWith('video_');
        });

        // 벽이 앞에 있는가?
        if (intersects.length > 0 && intersects[0].distance < wallCheckDist) {
            isBlocked = true;
            // 벽이 있으면 랜덤하게 회전 (뚫고 가지 않음)
            mouse.rotateY((Math.random() > 0.5 ? 1 : -1) * 0.2);
        }

        // --- 4. 맵 경계(Frame) 체크 ---
        // 맵 끝에 다다르면 강제로 중앙을 보게 함
        if (!isBlocked) { // 벽에 막혀있지 않을 때만 체크
            if (Math.abs(mouse.position.x) > mapLimit || Math.abs(mouse.position.z) > mapLimit) {
                const center = new THREE.Vector3(0, mouse.position.y, 0); // 높이는 유지
                mouse.lookAt(center);
                mouse.translateZ(moveSpeed); // 안쪽으로 이동
                return; // 이번 프레임 이동 끝
            }
        }

        // --- 5. 행동 결정 (치즈 찾기 vs 배회) ---
        if (!isBlocked) {
            let targetCheese = null;
            let minDist = Infinity;

            // 치즈 탐색
            cheeseItems.forEach(cheese => {
                const d = mouse.position.distanceTo(cheese.position);
                if (d < detectRadius && d < minDist) {
                    minDist = d;
                    targetCheese = cheese;
                }
            });

            if (targetCheese) {
                // [치즈 발견]
                const d = mouse.position.distanceTo(targetCheese.position);
                
                // 먹기
                if (d < eatRadius) {
                    drawingGroup.remove(targetCheese);
                    const idx = cheeseItems.indexOf(targetCheese);
                    if (idx > -1) cheeseItems.splice(idx, 1);
                    mouse.scale.multiplyScalar(1.1); // 살찜 효과
                } else {
                    // 치즈 바라보기 (높이 무시하고 수평 회전만)
                    const targetPos = targetCheese.position.clone();
                    
                    // 쥐와 같은 높이로 타겟 좌표 보정 -> 고개를 위아래로 꺾지 않음
                    if (currentPlane === 'horizontal') targetPos.y = mouse.position.y;
                    else if (currentPlane === 'vertical-x') targetPos.x = mouse.position.x;
                    else targetPos.z = mouse.position.z;

                    mouse.lookAt(targetPos);
                    mouse.translateZ(moveSpeed); // 치즈 향해 전진
                }
            } else {
                // [배회 모드]
                // 가끔 랜덤하게 방향 전환
                if (Math.random() < 0.05) {
                    mouse.rotateY((Math.random() - 0.5) * 1.0);
                }
                mouse.translateZ(moveSpeed); // 그냥 전진
            }
        }
    });
}

// --- 배경(Background) 변경 기능 구현 ---

function toggleBgPanel() {
    const panel = document.getElementById('bg-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    
    panel.style.display = isHidden ? 'flex' : 'none';
    
    if (isHidden) {
        // 다른 패널 닫기
        const panels = ['pen-panel', 'map-panel', 'shapes-panel', 'text-panel', 'image-panel', 'paint-panel', 'bridge-panel', 'rotate-panel', 'animation-panel', 'audio-panel', 'polygon-panel', 'sculpt-panel', 'detail-panel', 'video-panel', 'mouse-panel'];
        panels.forEach(id => {
            const p = document.getElementById(id);
            if(p) p.style.display = 'none';
        });
        closeObjectInfo();
    }
}

// 1. 이미지 파일로 배경 설정
function handleBackgroundImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 카메라가 켜져있다면 끄기
    stopCameraBackground();

    const reader = new FileReader();
    reader.onload = function(e) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(e.target.result, function(texture) {
            scene.background = texture; // 씬 배경 교체
            showStatus('배경 이미지가 적용되었습니다.');
        });
    };
    reader.readAsDataURL(file);
}

// 2. 카메라(웹캠)로 배경 설정 (AR 모드)
async function toggleCameraBackground() {
    const btn = document.getElementById('btnBgCamera');
    
    // 이미 켜져있으면 끄기
    if (bgCameraStream) {
        stopCameraBackground();
        return;
    }

    try {
        // 카메라 접근 요청
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // 후면 카메라 우선 (모바일)
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }, 
            audio: false 
        });
        
        bgCameraStream = stream;
        
        // 비디오 엘리먼트 생성
        bgVideoElement = document.createElement('video');
        bgVideoElement.srcObject = stream;
        bgVideoElement.play();
        bgVideoElement.playsInline = true; // 모바일 호환

        // 비디오 텍스처 생성 및 배경 설정
        const texture = new THREE.VideoTexture(bgVideoElement);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        
        scene.background = texture;
        
        // 버튼 상태 변경
        btn.innerHTML = '<span>🚫</span> 카메라 끄기';
        btn.classList.add('active');
        
        showStatus('카메라 배경이 적용되었습니다. (AR 모드)');

    } catch (err) {
        console.error('카메라 접근 실패:', err);
        alert('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
        stopCameraBackground();
    }
}

// 카메라 스트림 정지
function stopCameraBackground() {
    if (bgCameraStream) {
        bgCameraStream.getTracks().forEach(track => track.stop());
        bgCameraStream = null;
    }
    
    if (bgVideoElement) {
        bgVideoElement.srcObject = null;
        bgVideoElement = null;
    }

    // 버튼 상태 복구
    const btn = document.getElementById('btnBgCamera');
    if (btn) {
        btn.innerHTML = '<span>📷</span> 카메라 켜기';
        btn.classList.remove('active');
    }
}

// 3. 배경 초기화 (기본색)
function resetBackground() {
    stopCameraBackground(); // 카메라 끄기
    document.getElementById('bgImageFile').value = ''; // 파일 입력 초기화
    
    // 기본 배경색으로 복구
    scene.background = new THREE.Color(0x1a1a2e); // init()함수의 초기 색상과 동일하게
    showStatus('배경이 초기화되었습니다.');
}

// --- Math(수학 시각화) 기능 구현 ---

function toggleMathPanel() {
    const panel = document.getElementById('math-panel');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    
    panel.style.display = isHidden ? 'flex' : 'none';
    
    if (isHidden) {
        // 다른 패널 닫기
        const panels = ['pen-panel', 'map-panel', 'shapes-panel', 'text-panel', 'image-panel', 'paint-panel', 'bridge-panel', 'rotate-panel', 'animation-panel', 'audio-panel', 'polygon-panel', 'sculpt-panel', 'detail-panel', 'video-panel', 'mouse-panel', 'bg-panel'];
        panels.forEach(id => {
            const p = document.getElementById(id);
            if(p) p.style.display = 'none';
        });
        closeObjectInfo();
    }
}

function generateMathSurface() {
    const formulaInput = document.getElementById('mathFormula').value;
    const range = parseFloat(document.getElementById('mathRange').value) || 10;
    const segments = parseInt(document.getElementById('mathSegments').value) || 50;
    const isWireframe = document.getElementById('mathWireframe').checked;

    try {
        // 1. 수식 파싱 함수 생성 (Math 객체의 함수들을 직접 쓸 수 있게 with 사용)
        // 예: "sin(x)" -> Math.sin(x) 로 인식되도록 함
        const mathFunc = new Function('x', 'z', `
            with (Math) {
                try {
                    return ${formulaInput};
                } catch (e) {
                    return 0;
                }
            }
        `);

        // 테스트 실행 (에러 체크)
        mathFunc(0, 0);

        // 2. 지오메트리 생성 (PlaneGeometry 활용)
        // x, z 평면을 기준으로 생성하므로 PlaneGeometry(width, height) 사용
        const geometry = new THREE.PlaneGeometry(range, range, segments, segments);
        
        // 3. 버텍스 높이(Y) 조절
        const posAttribute = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < posAttribute.count; i++) {
            // PlaneGeometry는 기본적으로 XY 평면에 생성되므로,
            // 여기서는 시각적으로 XZ 평면인 것처럼 계산하기 위해 좌표를 해석합니다.
            // Plane의 x좌표 -> 우리의 x
            // Plane의 y좌표 -> 우리의 z (3D 공간상)
            
            const x = posAttribute.getX(i);
            const z = posAttribute.getY(i); // Plane의 Y를 우리의 Z로 사용
            
            // 수식 계산
            const y = mathFunc(x, z);
            
            // 계산된 Y값을 Z축(Plane기준)에 할당 -> 나중에 메쉬를 회전시켜서 맞춤
            posAttribute.setZ(i, y);
        }

        geometry.computeVertexNormals();

        // 4. 머티리얼 설정
        const material = new THREE.MeshStandardMaterial({
            color: color, // 현재 선택된 색상 사용
            side: THREE.DoubleSide,
            roughness: 0.3,
            metalness: 0.2,
            wireframe: isWireframe
        });

        const mesh = new THREE.Mesh(geometry, material);

        // 5. 위치 및 회전 설정
        // PlaneGeometry는 XY 평면에 서 있으므로, XZ 평면(바닥)과 맞추기 위해 -90도 회전
        mesh.rotation.x = -Math.PI / 2;
        
        if (currentPlane === 'horizontal') {
            mesh.position.set(0, planePosition.y, 0);
        } else if (currentPlane === 'vertical-x') {
            mesh.rotation.x = 0;
            mesh.rotation.y = -Math.PI / 2;
            mesh.position.set(planePosition.x, 0, 0);
        } else if (currentPlane === 'vertical-z') {
            mesh.rotation.x = 0;
            mesh.position.set(0, 0, planePosition.z);
        }

        mesh.name = `math_${mathMeshCounter++}`;
        drawingGroup.add(mesh);

        showStatus(`그래프 y = ${formulaInput} 생성 완료`);
        saveState();
        toggleMathPanel(); // 패널 닫기

    } catch (error) {
        console.error(error);
        alert("수식에 오류가 있습니다.\n올바른 자바스크립트 Math 문법인지 확인해주세요.\n(예: sin(x) * x)");
    }
}

function selectMathExample() {
    const select = document.getElementById('mathExamples');
    const input = document.getElementById('mathFormula');
    
    // 선택된 값이 있으면 수식 입력창에 적용
    if (select.value) {
        input.value = select.value;
        
        // 예제에 따라 범위나 정밀도를 조금씩 조정해주면 더 예쁘게 나옵니다 (선택사항)
        // 여기서는 기본값 유지하거나, 필요시 로직 추가 가능
        // showStatus('예제 수식이 입력되었습니다. [그래프 생성]을 눌러보세요.');
    }
}

// --- 음성 명령(Voice Command) 기능 구현 ---
// --- 음성 명령(Voice Command) 확장 기능 구현 ---

// 1. 명령어 데이터베이스 정의 (확장성 용이)
const voiceCommandDB = [
    {
        category: "시스템",
        desc: "명령어 목록 보기",
        keywords: ["명령어", "도움말", "알려줘", "리스트"],
        action: showVoiceHelp
    },
    {
        category: "시스템",
        desc: "음성 인식 종료",
        keywords: ["그만", "종료", "꺼줘"],
        action: toggleVoiceControl
    },
    {
        category: "시스템",
        desc: "전체 삭제 (초기화)",
        keywords: ["전체삭제", "다지워", "초기화", "깨끗하게"],
        action: () => { if(confirm("모든 그림을 삭제할까요?")) clearDrawings(); }
    },
    {
        category: "시스템",
        desc: "작업 취소 (되돌리기)",
        keywords: ["취소", "되돌리기", "실수", "빽"],
        action: undo
    },
    {
        category: "시스템",
        desc: "파일 저장",
        keywords: ["저장", "다운로드"],
        action: saveAsOBJ
    },
    {
        category: "시스템",
        desc: "카메라 리셋",
        keywords: ["카메라리셋", "원위치", "시점초기화"],
        action: resetCamera
    },
    
    // --- 도형 추가 ---
    { category: "도형", desc: "큐브(상자) 추가", keywords: ["큐브", "상자", "네모", "박스"], action: addCube },
    { category: "도형", desc: "구(공) 추가", keywords: ["구", "공", "원형", "볼"], action: addSphere },
    { category: "도형", desc: "원기둥 추가", keywords: ["원기둥", "실린더", "기둥"], action: addCylinder },
    { category: "도형", desc: "원뿔 추가", keywords: ["원뿔", "꼬깔", "콘"], action: addCone },
    { category: "도형", desc: "피라미드 추가", keywords: ["피라미드"], action: addPyramid },
    { category: "도형", desc: "토러스(도넛) 추가", keywords: ["토러스", "도넛", "링"], action: addTorus },
    { category: "도형", desc: "평면(판) 추가", keywords: ["평면", "판", "플레이트"], action: addPlane },
    { category: "도형", desc: "나무 추가", keywords: ["나무", "트리"], action: addTree },
    { category: "도형", desc: "별 추가", keywords: ["별", "스타"], action: addStar },
    { category: "도형", desc: "하트 추가", keywords: ["하트", "사랑"], action: addHeart },
    { category: "도형", desc: "화살표 추가", keywords: ["화살표"], action: addArrow },

    // --- 지형(맵) ---
    { category: "지형", desc: "평지(땅) 생성", keywords: ["평지", "땅", "바닥"], action: addPlain },
    { category: "지형", desc: "산 생성", keywords: ["산", "마운틴"], action: addMountain },
    { category: "지형", desc: "언덕 생성", keywords: ["언덕"], action: addHill },
    { category: "지형", desc: "계곡 생성", keywords: ["계곡"], action: addValley },
    { category: "지형", desc: "호수(물) 생성", keywords: ["호수", "물", "연못"], action: addLake },
    { category: "지형", desc: "사막 생성", keywords: ["사막", "모래"], action: addDesert },

    // --- 모드 변경 ---
    { category: "모드", desc: "기본 그리기 모드", keywords: ["그리기", "드로잉", "펜모드"], action: () => {
        isEraserMode = false; isPointerMode = false; isCameraMode = false; 
        document.getElementById('modeIndicator').textContent = '드로잉 모드';
        showStatus('드로잉 모드');
    }},
    { category: "모드", desc: "지우개 모드", keywords: ["지우개", "삭제모드"], action: toggleEraser },
    { category: "모드", desc: "포인터(선택) 모드", keywords: ["포인터", "선택", "마우스"], action: togglePointer },
    { category: "모드", desc: "카메라 이동 모드", keywords: ["카메라모드", "이동모드"], action: toggleCameraMode },
    { category: "모드", desc: "브리지(연결) 모드", keywords: ["브리지", "연결"], action: toggleBridgeMode },
    { category: "모드", desc: "도형 그리기 모드", keywords: ["도형그리기", "쉐이프"], action: toggleShapeDrawingMode },
    { category: "모드", desc: "페인트 모드", keywords: ["페인트", "색칠"], action: togglePaintMode },
    { category: "모드", desc: "폴리곤 모드", keywords: ["폴리곤", "다각형"], action: togglePolygonPanel }, // 패널 열면서 시작
    { category: "모드", desc: "스컬프팅 모드", keywords: ["스컬프팅", "조각"], action: toggleSculptPanel },
    { category: "모드", desc: "세부조각(점) 모드", keywords: ["세부조각", "점편집", "버텍스"], action: toggleDetailPanel },

    // --- 패널 열기/닫기 ---
    { category: "패널", desc: "펜 패널 열기", keywords: ["펜설정", "펜메뉴"], action: togglePenPanel },
    { category: "패널", desc: "맵 패널 열기", keywords: ["맵설정", "지형메뉴"], action: toggleMapPanel },
    { category: "패널", desc: "텍스트 패널 열기", keywords: ["글자", "텍스트"], action: toggleTextPanel },
    { category: "패널", desc: "이미지 패널 열기", keywords: ["이미지", "사진"], action: toggleImagePanel },
    { category: "패널", desc: "회전 패널 열기", keywords: ["회전"], action: toggleRotatePanel },
    { category: "패널", desc: "애니메이션 패널", keywords: ["애니메이션"], action: toggleAnimationPanel },
    { category: "패널", desc: "오디오 패널", keywords: ["오디오", "음악"], action: toggleAudioPanel },
    { category: "패널", desc: "배경 패널", keywords: ["배경", "바탕화면"], action: toggleBgPanel },
    { category: "패널", desc: "Math(수학) 패널", keywords: ["수학", "함수", "그래프"], action: toggleMathPanel },

    // --- MOUSE 시뮬레이션 ---
    { category: "MOUSE", desc: "MOUSE 모드 시작", keywords: ["마우스모드", "쥐모드", "쥐시뮬레이션"], action: startMouseMode },
    { category: "MOUSE", desc: "쥐 소환", keywords: ["쥐소환", "쥐추가", "마우스추가"], action: () => {
        if(!isMouseMode) startMouseMode();
        createMouseAgent(new THREE.Vector3(0, planePosition.y, 0));
        showStatus('쥐가 소환되었습니다');
    }},
    { category: "MOUSE", desc: "치즈 추가", keywords: ["치즈", "먹이"], action: () => {
        if(!isMouseMode) startMouseMode();
        createCheeseItem(new THREE.Vector3(Math.random()*2, planePosition.y, Math.random()*2));
        showStatus('치즈가 추가되었습니다');
    }},
    { category: "MOUSE", desc: "덫 추가", keywords: ["덫", "함정"], action: () => {
        if(!isMouseMode) startMouseMode();
        createTrapItem(new THREE.Vector3(Math.random()*2, planePosition.y, Math.random()*2));
        showStatus('덫이 추가되었습니다');
    }},
    { category: "MOUSE", desc: "시뮬레이션 초기화", keywords: ["쥐삭제", "시뮬레이션초기화"], action: clearMouseItems },

    // --- 동영상 ---
    { category: "동영상", desc: "동영상 패널", keywords: ["동영상", "비디오"], action: toggleVideoPanel },
];

function initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
        return null;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'ko-KR';
    rec.continuous = true;
    rec.interimResults = false;

    rec.onstart = function() {
        isVoiceListening = true;
        document.getElementById('voiceBtn').classList.add('listening');
        showVoiceStatus("듣고 있습니다... ('명령어 알려줘'라고 말해보세요)");
    };

    rec.onend = function() {
        if (isVoiceListening) {
            rec.start();
        } else {
            document.getElementById('voiceBtn').classList.remove('listening');
            hideVoiceStatus();
        }
    };

    rec.onresult = function(event) {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim();
        showVoiceStatus(`인식됨: "${transcript}"`);
        processVoiceCommand(transcript);
    };

    rec.onerror = function(event) {
        if (event.error === 'not-allowed') {
            alert("마이크 권한이 필요합니다.");
            toggleVoiceControl();
        }
    };

    return rec;
}

function toggleVoiceControl() {
    if (!recognition) {
        recognition = initVoiceRecognition();
        if (!recognition) return;
    }

    if (isVoiceListening) {
        isVoiceListening = false;
        recognition.stop();
        showStatus("음성 인식이 종료되었습니다.");
    } else {
        isVoiceListening = true;
        recognition.start();
        showStatus("음성 제어가 시작되었습니다.");
    }
}

function showVoiceStatus(msg) {
    const el = document.getElementById('voice-status');
    el.textContent = msg;
    el.style.display = 'block';
}

function hideVoiceStatus() {
    document.getElementById('voice-status').style.display = 'none';
}

function processVoiceCommand(command) {
    // 공백 제거하여 매칭 확률 높임
    const cleanCmd = command.replace(/\s+/g, '');
    let matched = false;

    // DB 순회하며 매칭 확인
    for (const item of voiceCommandDB) {
        for (const keyword of item.keywords) {
            if (cleanCmd.includes(keyword)) {
                console.log(`명령 실행: ${item.desc} (키워드: ${keyword})`);
                item.action();
                matched = true;
                break;
            }
        }
        if (matched) break;
    }

    if (!matched) {
        showVoiceStatus(`알 수 없는 명령입니다: "${command}"`);
    }
}

// --- 도움말 패널 기능 ---

function showVoiceHelp() {
    const panel = document.getElementById('voice-help-panel');
    const list = document.getElementById('voice-command-list');
    
    // 리스트 초기화
    list.innerHTML = '';
    
    // 카테고리별로 그룹화
    const groups = {};
    voiceCommandDB.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
    });

    // HTML 생성
    for (const [category, items] of Object.entries(groups)) {
        const catDiv = document.createElement('div');
        catDiv.className = 'voice-category';
        catDiv.textContent = category;
        list.appendChild(catDiv);

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'voice-item';
            
            // 대표 키워드 2개만 표시
            const keywordsText = item.keywords.slice(0, 2).join(', ');
            
            itemDiv.innerHTML = `
                <span>${item.desc}</span>
                <span class="keywords">"${keywordsText}"</span>
            `;
            list.appendChild(itemDiv);
        });
    }

    panel.style.display = 'flex';
}

function closeVoiceHelp() {
    document.getElementById('voice-help-panel').style.display = 'none';
}

// 애플리케이션 시작
init();