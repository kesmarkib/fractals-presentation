import * as THREE from 'three';

const dropdownIcon = document.getElementById("dropdown-button")
const dropdown = document.getElementById("options")

dropdown.style.visibility = "hidden";

dropdownIcon.addEventListener("click", () => {
  const clicked = dropdownIcon.getAttribute("clicked")
  if(clicked == "false"){
    dropdownIcon.setAttribute("clicked", "true")
    dropdown.style.visibility = "visible";
  }else{
    dropdownIcon.setAttribute("clicked", "false")
    dropdown.style.visibility = "hidden";
  }
})

let fragmentShader = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_xaxis;
    uniform bool u_type;

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
        vec2 mouse = u_mouse/u_resolution.xy;
        mouse.x = mouse.x * 4.0 - u_xaxis;
        mouse.y = (mouse.y * 2.0 - 1.0) * -1.0;

        vec2 z_n = z_0.xy;
        vec2 c = z_0.xy;

        if(u_type == true){
          c = mouse.xy;
        }

        
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
      uv.x = gl_FragCoord.x/u_resolution.x * 4.0 - u_xaxis;
      uv.y = gl_FragCoord.y/u_resolution.y * 2.0 - 1.0;

      vec3 color = vec3(0.0);

      float iterationsNum = iterations(uv.xy);

      float x_clamp = iterationsNum/250.0;


      float r = x_clamp;
      float g = x_clamp;
      float b = x_clamp;

      color = vec3(r, g ,b);

      gl_FragColor = vec4(color, 1.0);
    }
  `

//uniforms
const canvas = document.getElementById("webgl")

const sizes = {
  width: window.screen.availWidth,
  height: window.screen.availHeight
}

const coords = document.getElementById("coordinates")

const mousePos = {
  mx: 0,
  my: 0
}

const uniforms = {
  u_time: { value: 0.0 },
  u_resolution: {value: new THREE.Vector2(sizes.width, sizes.height)},
  u_mouse: {value: new THREE.Vector2(mousePos.mx, mousePos.my)},
  u_xaxis: {value: 2.5},
  u_type: {value: false}
}

function updateMousePosDisplay(){
  coords.innerHTML = `(x: ${mousePos.mx/sizes.width * 4.0 - uniforms.u_xaxis.value} | i: ${(mousePos.my/sizes.height * 2.0 - 1.0) * -1})`
}

function resetMousePos(){
  mousePos.mx = 0.0;
  mousePos.my = 0.0;
}

canvas.addEventListener("mousedown", (e) =>{
  mousePos.mx = e.clientX
  mousePos.my = e.clientY
  updateMousePosDisplay()
  canvas.addEventListener("mousemove", mouseMove)
})

canvas.addEventListener("mouseup", () =>{
  canvas.removeEventListener("mousemove", mouseMove)
})

function mouseMove(e) {
  mousePos.mx = e.clientX 
  mousePos.my = e.clientY
  updateMousePosDisplay()
}

let material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader:`
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader
})


let active;

Array.from(dropdown.children).forEach(child => {
  child.addEventListener("click", () => {
    document.getElementsByClassName("active")[0].classList.remove("active")
    child.classList.add("active")
    active = child.getAttribute("id")
    change(active)
  })
})

function change(active){
  switch(active) {
    case "m-opt":
      uniforms.u_type.value = false;
      uniforms.u_xaxis.value = 2.5;
      resetMousePos()
      updateMousePosDisplay()
      break;

    case "j-opt":
      uniforms.u_type.value = true;
      uniforms.u_xaxis.value = 2.0;
      resetMousePos()
      updateMousePosDisplay()
      break;

    case "z-opt":
      
      break;

    default:
      break;
  }
}

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

const scene = new THREE.Scene()

const geometry = new THREE.PlaneGeometry(2, 2)


const mesh = new THREE.Mesh(geometry, material)
mesh.material.needsUpdate = true
scene.add(mesh)


function animate() {
  uniforms.u_mouse.value = new THREE.Vector2(mousePos.mx, mousePos.my)
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();