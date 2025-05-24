import * as THREE from 'three';

const fragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;

  vec2 complexAdd(vec2 z_0, vec2 z_1 )
  {
      float a = z_0.x;
      float b = z_0.y;
      float c = z_1.x;
      float d = z_1.y;
    
      return vec2(a + c, b + d);
  }

  vec2 complexMult( vec2 z_0, vec2 z_1 )
  {
      float a = z_0.x;
      float b = z_0.y;
      float c = z_1.x;
      float d = z_1.y;

      return vec2((a*c - b*d), (b*c + a*d));
  }

  float absValue ( vec2 z_0 ) 
  {
      float a = z_0.x;
      float b = z_0.y;

      return sqrt(pow(a, 2.0) + pow(b, 2.0));
  }

  float iterations(vec2 z_0)
  {
      vec2 z_n = z_0.xy;
      vec2 c = z_0.xy;
      for(int i = 0; i < 250; i++)
      {
          vec2 z = complexAdd(complexMult(z_n, z_n), c);
          if ( absValue(z) > 2.0 ) {
              return float(i);
          }
          z_n = z;
      }
      return 0.0;
  }

  void main() {
    vec2 uv = vec2(0.0);
    uv.x = gl_FragCoord.x/u_resolution.x * 4.0 - 2.5;
    uv.y = gl_FragCoord.y/u_resolution.y * 2.0 - 1.0;

    vec3 color = vec3(0.0);

    float iterationsNum = iterations(uv.xy);
    
    float x_clamp = iterationsNum/250.0;

    color = vec3(x_clamp);

    gl_FragColor = vec4(color, 1.0);
  }



`



const canvasContainer = document.getElementById("canvas-container")
const canvas = document.getElementById("webgl")

const sizes = {
  width: canvasContainer.getBoundingClientRect().width,
  height: canvasContainer.getBoundingClientRect().height
}

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

const scene = new THREE.Scene()

const geometry = new THREE.PlaneGeometry(2, 2)

const uniforms = {
  u_time: { value: 0.0 },
  u_resolution: {value: new THREE.Vector2(sizes.width, sizes.height)}
}

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader:`
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader
})


const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();