import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

function main() {

	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

	renderer.setPixelRatio(window.devicePixelRatio * 2);

	// Camera 
	const fov = 95;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 10000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 8, 75);

	const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 5, 0);
	controls.update();

	// Scene
	const scene = new THREE.Scene();

	const color = 0xffffff;
	const intensity = 3;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-1, 25, 4);
	//light.target.position.set(5, 5, 0);
	scene.add(light);
	//scene.add(light.target);

	const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
	scene.add(hemiLight);

	const ambientLight = new THREE.AmbientLight(0x808080);
	ambientLight.intensity = 1.5;
	scene.add(ambientLight);

	// scene.background = new THREE.Color('skyblue');


	// Cube Constants
	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
	const grassGeometry = new THREE.BoxGeometry(1000, 10, 1000);
	const dirtGeometry = new THREE.BoxGeometry(1000, 50, 1000);
	const loader = new THREE.TextureLoader();

	const texture = loader.load(
		'../resources/space_panorama/space-panorama.jpg',
		() => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			texture.colorSpace = THREE.SRGBColorSpace;
			scene.background = texture;
		});
	
	// 0x00ff00
	const cubes = [
		// makeInstance(geometry, 0x44aa88, -5, 0, true),
		// makeInstance(geometry, 0x8844aa, 5, 0, true),
		// makeInstance(geometry, 0xaa8844, -7, 0, true),
		makeInstance(grassGeometry, 0x55ff55, 0, 0, false),
		makeInstance(dirtGeometry, 0x8B4513, 0, -30, false),
	];


	function makeInstance(geometry, color, x, y, useTextures = false) {

		// const materials = [
		// 	new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-1.jpg') }),
		// 	new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-2.jpg') }),
		// 	new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-3.jpg') }),
		// 	new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-4.jpg') }),
		// 	new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-5.jpg') }),
		// 	new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-6.jpg') }),
		// ];

		let material;

		if (useTextures) {
			material = [
				new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-1.jpg') }),
				new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-2.jpg') }),
				new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-3.jpg') }),
				new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-4.jpg') }),
				new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-5.jpg') }),
				new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-6.jpg') }),
			];
		} else {
			material = new THREE.MeshPhongMaterial({ color: color });
		}

		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		// cube.position.x = x;
		cube.position.set(x, y, 8);

		return cube;

	}


	function loadColorTexture(path) {
		const texture = loader.load(path);
		texture.colorSpace = THREE.SRGBColorSpace;
		return texture;
	}

	const mtlLoaderDuck = new MTLLoader();
	const objLoaderDuck = new OBJLoader();

	mtlLoaderDuck.load('../resources/duck/RubberDuck.mtl', (mtl) => {
		mtl.preload();

		objLoaderDuck.setMaterials(mtl);
		objLoaderDuck.load('../resources/duck/RubberDuck.obj', (root) => {
			root.position.set(...[-65, 10, 115]);
			root.scale.set(10, 10, 10);
			root.rotation.y = Math.PI / -2;
			scene.add(root);
		});
	});

	const mtlLoaderAstronaut = new MTLLoader();
	const objLoaderAstronaut = new OBJLoader();

	mtlLoaderAstronaut.load('../resources/Astronaut/Astronaut.mtl', (mtl) => {
		mtl.preload();

		objLoaderAstronaut.setMaterials(mtl);
		objLoaderAstronaut.load('../resources/Astronaut/Astronaut.obj', (root) => {
			root.position.set(...[0, 7, -4]);
			root.scale.set(3.25, 3.25, 3.25);
			scene.add(root);
		});
	});


	const mtlLoaderSun = new MTLLoader();
	const objLoaderSun = new OBJLoader();

	mtlLoaderSun.load('../resources/Sun/Sun_483.mtl', (mtl) => {
		mtl.preload();

		objLoaderSun.setMaterials(mtl);
		objLoaderSun.load('../resources/Sun/Sun_483.obj', (root) => {
			root.position.set(...[-750, 500, -400]);
			root.scale.set(5, 5, 5);
			scene.add(root);

		});
	});

	const mtlLoaderTurtle = new MTLLoader();
	const objLoaderTurtle = new OBJLoader();

	mtlLoaderTurtle.load('../resources/Turtle/turtle.mtl', (mtl) => {
		mtl.preload();

		objLoaderTurtle.setMaterials(mtl);
		objLoaderTurtle.load('../resources/Turtle/turtle.obj', (root) => {
			root.position.set(...[150, 7, 300]);
			root.scale.set(1.5, 1.5, 1.5);
			scene.add(root);
		});
	});

	const mtlLoaderWaterfall = new MTLLoader();
	const objLoaderWaterfall = new OBJLoader();

	mtlLoaderWaterfall.load('../resources/Waterfall/Waterfall.mtl', (mtl) => {
		mtl.preload();

		objLoaderWaterfall.setMaterials(mtl);
		objLoaderWaterfall.load('../resources/Waterfall/Waterfall.obj', (root) => {
			root.position.set(...[-80, 0, 95]);
			root.scale.set(3.5, 3.5, 3.5);
			root.rotation.y = Math.PI / 2;
			scene.add(root);
		});
	});

	const mtlLoaderBear = new MTLLoader();
	const objLoaderBear = new OBJLoader();

	mtlLoaderBear.load('../resources/Black_bear/BlackBear.mtl', (mtl) => {
		mtl.preload();

		objLoaderBear.setMaterials(mtl);
		objLoaderBear.load('../resources/Black_bear/BlackBear.obj', (root) => {
			root.position.set(...[-310, 5, 210]);
			root.scale.set(3.5, 3.5, 3.5);
			root.rotation.y = Math.PI / 2.25;
			scene.add(root);
		});
	});

	const mtlLoaderMew = new MTLLoader();
	const objLoaderMew = new OBJLoader();

	mtlLoaderMew.load('../resources/Mew/materials.mtl', (mtl) => {
		mtl.preload();

		objLoaderMew.setMaterials(mtl);
		objLoaderMew.load('../resources/Mew/model.obj', (root) => {
			root.position.set(...[-50, 55, 125]);
			root.scale.set(50, 50, 50);
			root.rotation.x = Math.PI;
			root.rotation.y = Math.PI / -3;
			root.rotation.z = Math.PI;
			scene.add(root);
		});
	});

	function addEevee(position, scale, rotation = {x: 0, y: 0, z: 0}) {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Eevee/materials.mtl', (mtl) => {
			mtl.preload();
	
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Eevee/model.obj', (root) => {
				root.position.set(...position);
				root.scale.set(...scale);
				root.rotation.x = rotation.x;
				root.rotation.y = rotation.y;
				root.rotation.z = rotation.z;
				scene.add(root);
			});
		});
	}

	addEevee([225, 15, 55], [25, 25, 25], {x: 0, y: 0, z: 0});
	addEevee([250, 15, 65], [25, 25, 25], {x: 0, y: Math.PI / 2.95, z: 0});
	addEevee([205, 15, 65], [25, 25, 25], {x: 0, y: Math.PI / -1.5, z: 0});

	function addPikachu(position, scale, rotation = {x: 0, y: 0, z: 0}) {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Pikachu/materials.mtl', (mtl) => {
			mtl.preload();
	
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Pikachu/model.obj', (root) => {
				root.position.set(...position);
				root.scale.set(...scale);
				root.rotation.x = rotation.x;
				root.rotation.y = rotation.y;
				root.rotation.z = rotation.z;
				scene.add(root);
			});
		});
	}

	addPikachu([225, 23, 35], [25, 25, 25], {x: 0, y: Math.PI, z: 0});
	addPikachu([250, 23, 25], [25, 25, 25], {x: 0, y: Math.PI / -0.75, z: 0});
	addPikachu([275, 23, 45], [25, 25, 25], {x: 0, y: Math.PI / 1.25, z: 0});
	addPikachu([300, 23, 75], [25, 25, 25], {x: 0, y: Math.PI / 1.5, z: 0});

	function addSnorlax(position, scale, rotation = {x: 0, y: 0, z: 0}) {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Snorlax/materials.mtl', (mtl) => {
			mtl.preload();
	
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Snorlax/model.obj', (root) => {
				root.position.set(...position);
				root.scale.set(...scale);
				root.rotation.x = rotation.x;
				root.rotation.y = rotation.y;
				root.rotation.z = rotation.z;
				scene.add(root);
			});
		});
	}

	addSnorlax([75, 40, 215], [150, 150, 150], {x: Math.PI / -2.5, y: Math.PI, z: 0});
	addSnorlax([135, 35, 145], [115, 115, 115], {x: Math.PI / -2.5, y: Math.PI, z: Math.PI / -2});

	function addMagikarp(position, scale, rotation = {x: 0, y: 0, z: 0}) {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Magikarp/materials.mtl', (mtl) => {
			mtl.preload();
	
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Magikarp/model.obj', (root) => {
				root.position.set(...position);
				root.scale.set(...scale);
				root.rotation.x = rotation.x;
				root.rotation.y = rotation.y;
				root.rotation.z = rotation.z;
				scene.add(root);
			});
		});
	}

	addMagikarp([-110, 30, 125], [35, 35, 35], {x: Math.PI / -2, y: 0, z: Math.PI / 2});
	addMagikarp([-110, 75, 115], [35, 35, 35], {x: Math.PI / -2.25, y: Math.PI / -2.5, z: Math.PI / 2});
	addMagikarp([-85, 100, 105], [35, 35, 35], {x: Math.PI / -3, y: 0, z: Math.PI / 2});

	function addGrass(position, scale, rotationY = 0) {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Grass_Patch/materials.mtl', (mtl) => {
			mtl.preload();
	
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Grass_Patch/model.obj', (root) => {
				root.position.set(...position);
				root.scale.set(...scale);
				root.rotation.y = rotationY;
				scene.add(root);
			});
		});
	}

	// Grass near the bottom left group of rabbits
	addGrass([-100, 15, 350], [50, 50, 50]);
	addGrass([-150, 15, 325], [50, 50, 50]);
	addGrass([-50, 15, 350], [25, 25, 25]);

	function addRabbit(position, scale, rotationY = 0) {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Rabbit/NOVELO_RABBIT.mtl', (mtl) => {
			mtl.preload();
	
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Rabbit/NOVELO_RABBIT.obj', (root) => {
				root.position.set(...position);
				root.scale.set(...scale);
				root.rotation.y = rotationY;
				scene.add(root);
			});
		});
	}
	
	// Group of rabbits near the bottom left
	addRabbit([-150, 25, 350], [0.05, 0.05, 0.05], Math.PI);
	addRabbit([-100, 25, 325], [0.05, 0.05, 0.05], Math.PI * 1.25);
	addRabbit([-105, 25, 375], [0.05, 0.05, 0.05], Math.PI / 2.05);
	addRabbit([-105, 25, 400], [0.05, 0.05, 0.05], Math.PI / -2);

	// Group of rabbits near the top right
	addRabbit([250, 25, -200], [0.05, 0.05, 0.05], Math.PI);
	addRabbit([275, 25, -175], [0.05, 0.05, 0.05], Math.PI * 1.25);
	addRabbit([300, 25, -150], [0.05, 0.05, 0.05], Math.PI / 1.5);

	// Group of rabbits near top left
	addRabbit([-400, 25, -350], [0.05, 0.05, 0.05], Math.PI);
	addRabbit([-375, 25, -375], [0.05, 0.05, 0.05], Math.PI * 2.5);
	addRabbit([-375, 25, -400], [0.05, 0.05, 0.05], Math.PI * 2.25);
	addRabbit([-350, 25, -350], [0.05, 0.05, 0.05], Math.PI * -2.25);
	addRabbit([-315, 25, -325], [0.05, 0.05, 0.05], Math.PI * -1.25);

	function addVolcano(position, scale, rotationY = 0) {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Volcano/PUSHILIN_volcano.mtl', (mtl) => {
			mtl.preload();
	
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Volcano/PUSHILIN_volcano.obj', (root) => {
				root.position.set(...position);
				root.scale.set(...scale);
				root.rotation.y = rotationY;
				scene.add(root);
			});
		});
	}

	addVolcano([-175, 30, 455], [70, 70, 70]);
	addVolcano([440, 30, 205], [70, 70, 70], Math.PI / 2);

	function addCow(position, scale, rotationY = 0) {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Cow/Cow.mtl', (mtl) => {
			mtl.preload();
	
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Cow/Cow.obj', (root) => {
				root.position.set(...position);
				root.scale.set(...scale);
				root.rotation.y = rotationY;
				scene.add(root);
			});
		});
	}

	addCow([250, 5, 475], [5, 5, 5]);
	addCow([310, 5, 455], [5, 5, 5], Math.PI / 1.75);
	addCow([335, 5, 405], [5, 5, 5]);
	addCow([355, 5, 485], [5, 5, 5], Math.PI / -2.25);
	addCow([370, 5, 425], [5, 5, 5]);

	function loadRockModel() {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		fetch('rockPosition.json')
			.then(response => response.json())
			.then(rockPositions => {
				mtlLoader.load('../resources/Rock/PUSHILIN_rock.mtl', (mtl) => {
					mtl.preload();
					objLoader.setMaterials(mtl);
					objLoader.load('../resources/Rock/PUSHILIN_rock.obj', (object) => {
						createRockInstances(object, rockPositions);
					});
				});
			})
			.catch(error => console.error('Failed to load rock positions:', error));
	}
	
	function createRockInstances(originalObject, positions) {
		const geometry = originalObject.children[0].geometry;
		const material = originalObject.children[0].material;
		const numInstances = positions.length; 
		const rockInstances = new THREE.InstancedMesh(geometry, material, numInstances);
	
		const scaleX = 12.0;
		const scaleY = 12.0;
		const scaleZ = 12.0;
	
		positions.forEach((pos, index) => {
			const x = pos.x;
			const y = pos.y;
			const z = pos.z;
	
			const matrix = new THREE.Matrix4()
				.makeScale(scaleX, scaleY, scaleZ)
				.setPosition(x, y, z);
	
			rockInstances.setMatrixAt(index, matrix);
		});
	
		rockInstances.instanceMatrix.needsUpdate = true;
		scene.add(rockInstances);
	}
	
	loadRockModel();


	function loadTreeModelAndPositions() {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();
	
		mtlLoader.load('../resources/Tree/tree03.mtl', (mtl) => {
			mtl.preload();
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/Tree/tree03.obj', (object) => {
				fetch('treePosition.json')
					.then(response => response.json())
					.then(treePositions => {
						createTreeInstances(object, treePositions);
					})
					.catch(error => console.error('Failed to load tree positions:', error));
			});
		});
	}

	function createTreeInstances(originalObject, positions) {
		const geometry = originalObject.children[0].geometry;
		const material = originalObject.children[0].material;
		const numTrees = positions.length;
		const treeInstances = new THREE.InstancedMesh(geometry, material, numTrees);
	
		const scaleX = 0.35;
		const scaleY = 0.35;
		const scaleZ = 0.35;
	
		positions.forEach((pos, index) => {
			const matrix = new THREE.Matrix4();
			matrix.makeScale(scaleX, scaleY, scaleZ);
			matrix.setPosition(pos.x, pos.y, pos.z);
			treeInstances.setMatrixAt(index, matrix);
		});
	
		treeInstances.instanceMatrix.needsUpdate = true;
		scene.add(treeInstances);
	}

	function loadShrubModelandPositions() {
		fetch('shrubPosition.json')
			.then(response => response.json())
			.then(shrubPositions => {
				const mtlLoader = new MTLLoader();
				const objLoader = new OBJLoader();
	
				mtlLoader.load('../resources/Shrub/Shrub.mtl', (mtl) => {
					mtl.preload();
					objLoader.setMaterials(mtl);
					objLoader.load('../resources/Shrub/Shrub.obj', (object) => {
						createShrubInstances(object, shrubPositions);
					});
				});
			})
			.catch(error => console.error('Failed to load shrub positions:', error));
	}
	

	function createShrubInstances(originalObject, positions) {
		const geometry = originalObject.children[0].geometry;
		const material = originalObject.children[0].material;
		const numInstances = positions.length;
		const shrubInstances = new THREE.InstancedMesh(geometry, material, numInstances);
	
		const scaleX = 3.5; 
		const scaleY = 3.5; 
		const scaleZ = 3.5; 
	
		positions.forEach((pos, index) => {
			const matrix = new THREE.Matrix4();
			matrix.makeScale(scaleX, scaleY, scaleZ);
			matrix.setPosition(pos.x, pos.y, pos.z);
	
			shrubInstances.setMatrixAt(index, matrix);
		});
	
		shrubInstances.instanceMatrix.needsUpdate = true;
		scene.add(shrubInstances);
	}

	loadTreeModelAndPositions();
	loadShrubModelandPositions();
    

	function resizeRendererToDisplaySize(renderer) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {

			renderer.setSize(width, height, false);

		}
		return needResize;

	}


	function render(time) {

		time *= 0.001; // convert time to seconds

		if (resizeRendererToDisplaySize(renderer)) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		// cubes.forEach((cube, ndx) => {

		// 	const speed = 1 + ndx * .1;
		// 	const rot = time * speed;
		// 	cube.rotation.x = rot;
		// 	cube.rotation.y = rot;

		// });

		renderer.render(scene, camera);

		requestAnimationFrame(render);

	}

	requestAnimationFrame(render);

}

main();
