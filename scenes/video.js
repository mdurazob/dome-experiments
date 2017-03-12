/* This demonstration is adapted from:
 *   https://threejs.org/examples/webgl_video_panorama_equirectangular.html
 */

function setupScene(scene) {
    var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
    geometry.scale( -1, 1, 1 );
    
    /* Video from https://vimeo.com/97887646 */
    
    var video = document.createElement( 'video' );
    video.width  = 1024;
    video.height =  640;
    video.loop   = true;
    video.muted  = false;
    video.src = "../textures/Spherible- Purp Cycle.mp4";
    video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );
    video.play();
    
    var texture = new THREE.VideoTexture( video );
    texture.minFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    var material   = new THREE.MeshBasicMaterial( { map : texture } );
    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.y = -Math.PI/2;
    mesh.rotation.x =  Math.PI/16;
    scene.add( mesh );
    
    var credit = getTextElement("Spherible - Purp Cycle - By Daniel Arnett", 6);
    credit.position.z = -8;
    credit.position.y = 1;
    scene.add(credit);
}

function animateScene(dt, scene) {
}

function getTextElement(text, scale) {
    const font       = "Bold 40px Arial";
    const fillStyle  = "white";
    const height     = 50;
    
    var canvas    = document.createElement('canvas');
    var ctx       = canvas.getContext('2d');
    ctx.font      = font;
    ctx.fillStyle = fillStyle;
    
    var textWidth = ctx.measureText(text).width;
    canvas.width  = textWidth;
    canvas.height = height;
    ctx.font      = font;
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, 0, 40);
    
    var spriteMaterial = new THREE.SpriteMaterial( {
        map:         new THREE.Texture(canvas),
        color:       0xffffff,
        lights:      false,
        rotation:    Math.PI
    });
    spriteMaterial.map.needsUpdate = true;
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(scale, scale * height/textWidth, 1);
    return sprite;
}