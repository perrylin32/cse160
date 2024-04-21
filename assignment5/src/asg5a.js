import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

function main() {

	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

	renderer.setPixelRatio(window.devicePixelRatio * 2);

	// Camera 
	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 5, 10);

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

	scene.background = new THREE.Color('skyblue');


	// Cube Constants
	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
	const loader = new THREE.TextureLoader();

	const cubes = [
		makeInstance(geometry, 0x44aa88, -5),
		makeInstance(geometry, 0x8844aa, 5),
		makeInstance(geometry, 0xaa8844, -7),
	];

	// Make a cylinder
	const radiusTop = 1;
	const radiusBottom = 1;
	const height = 5;
	const radialSegments = 32;
	const cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
	const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

	const cylinder = new THREE.Mesh(cylinderGeometry, material);
	cylinder.position.set(0, -2.5, 0)
	scene.add(cylinder);

	function makeInstance(geometry, color, x) {

		const materials = [
			new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-1.jpg') }),
			new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-2.jpg') }),
			new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-3.jpg') }),
			new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-4.jpg') }),
			new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-5.jpg') }),
			new THREE.MeshBasicMaterial({ map: loadColorTexture('../resources/images/flower-6.jpg') }),
		];

		const cube = new THREE.Mesh(geometry, materials);
		scene.add(cube);

		cube.position.x = x;

		return cube;

	}


	function loadColorTexture(path) {
		const texture = loader.load(path);
		texture.colorSpace = THREE.SRGBColorSpace;
		return texture;
	}

	// Sphere
	const sphereRadius = 3;
	const sphereWidthDivisions = 32;
	const sphereHeightDivisions = 16;
	const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
	const sphereMat = new THREE.MeshPhongMaterial();
	sphereMat.color.set(0x0000FF); // Set color to blue
	const mesh = new THREE.Mesh(sphereGeo, sphereMat);
	mesh.position.set(10, sphereRadius + 2, 5); // Position the sphere
	scene.add(mesh);

	// Load .obj <== Duck

	const mtlLoader = new MTLLoader();
	const objLoader = new OBJLoader();

	mtlLoader.load('../resources/duck/RubberDuck.mtl', (mtl) => {
		mtl.preload();

		objLoader.setMaterials(mtl);
		objLoader.load('../resources/duck/RubberDuck.obj', (root) => {
			scene.add(root);
		});
	});


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

		cubes.forEach((cube, ndx) => {

			const speed = 1 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;

		});

		renderer.render(scene, camera);

		requestAnimationFrame(render);

	}

	requestAnimationFrame(render);

}

main();
