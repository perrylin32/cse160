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
	const far = 1000;
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
	light.position.set(-1, 2, 4);
	//light.target.position.set(5, 5, 0);
	scene.add(light);
	//scene.add(light.target);

	const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.25);
	scene.add(hemiLight);

	const ambientLight = new THREE.AmbientLight(0x808080);
	scene.add(ambientLight);

	// scene.background = new THREE.Color('skyblue');


	// Cube Constants
	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
	const grassGeometry = new THREE.BoxGeometry(90, 0.1, 90);
	const dirtGeometry = new THREE.BoxGeometry(90, 1, 90);
	const loader = new THREE.TextureLoader();

	const texture = loader.load(
		'../resources/space_panorama/space-panorama.jpg',
		() => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			texture.colorSpace = THREE.SRGBColorSpace;
			scene.background = texture;
		});

	const cubes = [
		// makeInstance(geometry, 0x44aa88, -5, 0, true),
		// makeInstance(geometry, 0x8844aa, 5, 0, true),
		// makeInstance(geometry, 0xaa8844, -7, 0, true),
		makeInstance(grassGeometry, 0x00ff00, 0, 0, false),
		makeInstance(dirtGeometry, 0x8B4513, 0, -0.55, false),
	];

	// Make a cylinder
	// const radiusTop = 1;
	// const radiusBottom = 1;
	// const height = 5;
	// const radialSegments = 32;
	// const cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
	// const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
	// const cylinder = new THREE.Mesh(cylinderGeometry, material);
	// cylinder.position.set(0, -3.5, 0)
	// scene.add(cylinder);

	// Make a pyramid
	// const pyramidGeometry = new THREE.ConeGeometry(1, 2, 4);  // radius, height, radial segments
	// const pyramidMaterial = new THREE.MeshPhongMaterial({ color: 0xff5533, flatShading: true });
	// const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
	// pyramid.position.set(0, 25, 0);
	// pyramid.scale.set(2, 2, 2);
	// scene.add(pyramid);

	// Make a sphere
	// const sphereRadius = 3;
	// const sphereWidthDivisions = 32;
	// const sphereHeightDivisions = 16;
	// const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
	// const sphereMat = new THREE.MeshPhongMaterial();
	// sphereMat.color.set(0x0000FF); // Set color to blue
	// const mesh = new THREE.Mesh(sphereGeo, sphereMat);
	// mesh.position.set(10, sphereRadius + 2, 5); // Position the sphere
	// scene.add(mesh);


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

	function createTree(x, y, z) {
        const trunkGeometry = new THREE.CylinderGeometry(1, 1, 6, 32);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 3, 0);

        const foliageGeometry = new THREE.ConeGeometry(4, 8, 4);
        const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(0, 9, 0);

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(foliage);
        tree.scale.set(1.5, 1.5, 1.5);
        tree.position.set(x, y, z);

        return tree;
    }
	scene.add(createTree(-25, 0, 25));
    scene.add(createTree(-15, 0, 28));
    scene.add(createTree(-25, 0, 38));
    scene.add(createTree(-12, 0, 38));
    // scene.add(createTree(0, 0, 25));
	scene.add(createTree(-5, 0, 30));
	scene.add(createTree(5, 0, 28));
	scene.add(createTree(5, 0, 35));
	scene.add(createTree(15, 0, 35));
	scene.add(createTree(20, 0, 23));
	scene.add(createTree(25, 0, 30));

	// // Tree trunk (cylinder)
	// const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
	// const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
	// const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
	// trunk.position.set(0, 1.5, 0);

	// // Tree foliage (cone/pyramid)
	// const foliageGeometry = new THREE.ConeGeometry(2, 4, 4);
	// const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
	// const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
	// foliage.position.set(0, 4, 0);

	// // Group trunk and foliage
	// const tree = new THREE.Group();
	// tree.add(trunk);
	// tree.add(foliage);
	// tree.scale.set(3.5, 3.5, 3.5);
	// tree.position.set(-25, 0, -25);
	// scene.add(tree);

	// Load .obj <== Duck

	const mtlLoaderDuck = new MTLLoader();
	const objLoaderDuck = new OBJLoader();

	mtlLoaderDuck.load('../resources/duck/RubberDuck.mtl', (mtl) => {
		mtl.preload();

		objLoaderDuck.setMaterials(mtl);
		objLoaderDuck.load('../resources/duck/RubberDuck.obj', (root) => {
			root.position.set(...[5, 8, 0]);
			root.scale.set(1.25, 1.25, 1.25);
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

	const mtlLoaderEarth = new MTLLoader();
	const objLoaderEarth = new OBJLoader();

	mtlLoaderEarth.load('../resources/Earth/CHAHIN_EARTH.mtl', (mtl) => {
		mtl.preload();

		objLoaderEarth.setMaterials(mtl);
		objLoaderEarth.load('../resources/Earth/CHAHIN_EARTH.obj', (root) => {
			root.position.set(...[-45, 35, -150]);
			// root.scale.set(3.25, 3.25, 3.25);
			scene.add(root);
		});
	});

	const mtlLoaderSS = new MTLLoader();
	const objLoaderSS = new OBJLoader();

	mtlLoaderSS.load('../resources/International_Space_Station/InternationalSpaceStation.mtl', (mtl) => {
		mtl.preload();

		objLoaderSS.setMaterials(mtl);
		objLoaderSS.load('../resources/International_Space_Station/InternationalSpaceStation.obj', (root) => {
			root.position.set(...[75, 45, 25]);
			root.scale.set(0.5, 0.5, 0.5);
			scene.add(root);
		});
	});

	const mtlLoaderSun = new MTLLoader();
	const objLoaderSun = new OBJLoader();

	mtlLoaderSun.load('../resources/Sun/Sun_483.mtl', (mtl) => {
		mtl.preload();

		objLoaderSun.setMaterials(mtl);
		objLoaderSun.load('../resources/Sun/Sun_483.obj', (root) => {
			root.position.set(...[-45, 40, 0]);
			root.scale.set(0.5, 0.5, 0.5);
			scene.add(root);

		});
	});

	const mtlLoaderTurtle = new MTLLoader();
	const objLoaderTurtle = new OBJLoader();

	mtlLoaderTurtle.load('../resources/Turtle/turtle.mtl', (mtl) => {
		mtl.preload();

		objLoaderTurtle.setMaterials(mtl);
		objLoaderTurtle.load('../resources/Turtle/turtle.obj', (root) => {
			root.position.set(...[-25, 2, 0]);
			scene.add(root);
		});
	});

	const mtlLoaderWaterfall = new MTLLoader();
	const objLoaderWaterfall = new OBJLoader();

	mtlLoaderWaterfall.load('../resources/Waterfall/Waterfall.mtl', (mtl) => {
		mtl.preload();

		objLoaderWaterfall.setMaterials(mtl);
		objLoaderWaterfall.load('../resources/Waterfall/Waterfall.obj', (root) => {
			root.position.set(...[10, 0, 0]);
			root.scale.set(1.1, 1.1, 1.1);
			scene.add(root);
		});
	});




	// const mtlLoaderPond = new MTLLoader();
	// const objLoaderPond = new OBJLoader();

	// mtlLoaderPond.load('../resources/pond/PUSHILIN_pond.mtl', (mtl) => {
	// 	mtl.preload();

	// 	objLoaderPond.setMaterials(mtl);
	// 	objLoaderPond.load('../resources/pond/PUSHILIN_pond.obj', (root) => {
	// 		root.position.set(...[45, 2, 0]);
	// 		root.scale.set(20, 20, 20);
	// 		scene.add(root);
	// 	});
	// });

	// function loadModel(mtlPath, objPath, position) {
	// 	mtlLoader.load(mtlPath, (mtl) => {
	// 		mtl.preload();
	// 		objLoader.setMaterials(mtl);
	// 		objLoader.load(objPath, (root) => {
	// 			root.position.set(...position); // Spread the position array [x, y, z]
	// 			scene.add(root);
	// 		});
	// 	});
	// }

	// loadModel('../resources/duck/RubberDuck.mtl', '../resources/duck/RubberDuck.obj', [0, 0, 0]);
	// loadModel('../resources/pond/PUSHILIN_pond.mtl', '../resources/pond/PUSHILIN_pond.obj', [5, 0, 0]);


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
