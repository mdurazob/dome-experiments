/* This is my attempt to recreate Spherible - Purp Cycle in code.
 * The original video is here:
 *
 *    https://vimeo.com/97887646
 */
function setupScene(scene) {
    
    const ringSeparation = 100;
    const animationSpeed = 0.2;

    // The scene lighting.
    var light = new THREE.AmbientLight( 0x555555 );
    scene.add(light);
    
    var light = new THREE.PointLight( 0xffffff, 1 );
    light.position.set( 10, 15, 20 );
    scene.add(light);
    
    /* The lens flare. We attach the flare to the camera,
     * the camera to the scene, so that the flare moves
     * with the camera. */
    var flare = new LensFlare(0, 0, -2);
    RendererConfig.camera.add( flare.obj );
    scene.add(RendererConfig.camera);

    /* The floor. */
    var floor = new GridFloor(0, 0, 0);
    scene.add(floor.obj);
    
    /* The rings. I position the rings at eye level so the flare
     * (which is closer to the camera) lines up with the rings */
    for(var i = -5; i < 5; i++) {
        var ring = new TronRing(0, RendererConfig.eyeHeight, i * ringSeparation);
        scene.add(ring.obj);
    }

    /* The light pillars */
    var pillar;
    for(var i = -5; i < 5; i++) {
        pillar = new LightPillar(15, 0, (-i + 0.5) * ringSeparation);
        scene.add(pillar.obj);
    }

    RendererConfig.animationCallback = function(t) {
        RendererConfig.camera.position.z = -((t * animationSpeed) % 2) * ringSeparation;
        TronRing.animate(t);
    }
}

function LensFlare(x, y, z) {
    if(!LensFlare.staticData) {
        LensFlare.staticData = {
            geometry: new THREE.CircleBufferGeometry( 0.6, 25 ),
            material: new THREE.ShaderMaterial( {
                vertexShader:   flareVertexShader,
                fragmentShader: flareFragmentShader,
                depthTest: false,
                blending: THREE.AdditiveBlending,
                transparent: true
            } )
        }
    }

    var flare = new THREE.Mesh(LensFlare.staticData.geometry, LensFlare.staticData.material);
    flare.position.set(x, y, z);
    this.obj = flare;
}

function GridFloor(x, y, z) {
    if(!GridFloor.staticData) {
        GridFloor.staticData = {
            geometry: new THREE.PlaneBufferGeometry(500, 500),
            material: new THREE.ShaderMaterial( {
                vertexShader:   gridVertexShader,
                fragmentShader: gridFragmentShader
            } )
        }
    }
    var mesh = new THREE.Mesh(GridFloor.staticData.geometry, GridFloor.staticData.material);
    mesh.rotation.x = -Math.PI/2;
    mesh.position.set(x, y, z);
    this.obj = mesh;
}

function TronRing(x, y, z) {
    if(!TronRing.staticData) {
        TronRing.staticData = {
            geometry: new THREE.TorusBufferGeometry(5, 1, 8, 40),
            material: getTronMaterial('../textures/tron1.png'),
            rings: []
        }
    }

    var ring = new THREE.Mesh(TronRing.staticData.geometry, TronRing.staticData.material);
    this.obj = new THREE.Object3D();
    this.obj.position.set(x, y, z);
    this.obj.add(ring);

    TronRing.staticData.rings.push(this.obj);

    TronRing.animate = function(t) {
        TronRing.staticData.rings.forEach(function(r,i) {r.rotation.z = t * ((i % 2) ? 1 : -1)});
    }
}

function LightPillar(x, y, z) {
    const baseHeight = 15;

    if(!LightPillar.staticData) {
        LightPillar.staticData = {
            geometry: new THREE.CylinderBufferGeometry(2, 2, baseHeight),
            baseMaterial: getTronMaterial('../textures/tron1.png'),
            beamMaterial: new THREE.MeshBasicMaterial({color: 0xFFFF00})
        }
    }

    var base = new THREE.Mesh(LightPillar.staticData.geometry, LightPillar.staticData.baseMaterial);
    var beam = new THREE.Mesh(LightPillar.staticData.geometry, LightPillar.staticData.beamMaterial);
    beam.scale.set(0.6, 30, 0.6);
    base.position.y = baseHeight/2;
    beam.position.y = baseHeight/2;

    this.obj = new THREE.Object3D();
    this.obj.position.set(x, y, z);
    this.obj.add(base);
    this.obj.add(beam);
}

function getTronMaterial(url, repeat) {
    if(!this.texureLoader) {
        this.texureLoader = new THREE.TextureLoader();
    }
    var texture  = this.texureLoader.load(url);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    if(repeat) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( repeat, repeat );
    }
    return new THREE.MeshLambertMaterial({
        color:       0x001020,
        emissiveMap: texture,
        emissive:    0xFFFFFF
    });
}

var flareVertexShader = 
"varying vec2 vUv;\n" +
"void main() {\n" +
"   vUv = vec2( 1.- uv.x, uv.y );\n" +
"   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n" +
"}\n";

var flareFragmentShader =
"precision mediump float;\n" +

"varying vec2 vUv;\n" +

"#define M_PI 3.1415926535897932384626433832795\n" +

"float noise(float a) {\n" +
"   return \n" +
"     + sin(a *  16.) * 0.12\n" +
"     - sin(a *   8.) * 0.3\n" +
"     - sin(a *   4.) * 0.3\n" +
"     - sin(a *   2.) * 0.3\n" +
"     - sin(a *   1.) * 0.3\n" +
";}\n" +

"void main()  {\n" +

"   vec2 uv = (vUv - vec2(0.5, 0.5)) * 2.;\n" +

"   float a         = atan(uv.x,uv.y);\n" +
"   float r         = 1. - length(uv);\n" +
"   float white     = pow(0.05 + 1.0 * r, 2.);\n" +
"   float purple    = pow(0.75 * noise(a), 3.) * r;\n" +
"   gl_FragColor    = (vec4(1., 1., 1., 1.) * white + vec4(1., 0., 1., 1.) * purple) * pow(r, 3.);\n" +

"}\n";

var gridVertexShader = 
"varying vec2 vUv;\n" +
"void main() {\n" +
"   vUv = uv;\n" +
"   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n" +
"}\n";

var gridFragmentShader =
"precision mediump float;\n" +

"varying vec2 vUv;\n" +

"void main()  {\n" +
"   vec2 uv = mod(vUv * 25., 1.);" +
"   float thickness = 0.02;" +
"   float taper     = 0.01;" +
"   float gX = smoothstep(0.5 - thickness - taper, 0.5 - thickness, uv.x) - smoothstep(0.5 + thickness, 0.5 + thickness + taper, uv.x);" +
"   float gY = smoothstep(0.5 - thickness - taper, 0.5 - thickness, uv.y) - smoothstep(0.5 + thickness, 0.5 + thickness + taper, uv.y);" +
"   gl_FragColor = vec4(0., 1., 1., 1.) * (gX + gY);\n" +
"}\n";