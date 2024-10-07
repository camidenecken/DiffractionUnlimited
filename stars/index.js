// Create an empty scene
let scene = new THREE.Scene();

let colorSun = "#ff00ff" // Magenta
let colorSelect = '#ffff00' // Yellow
let colorOnHover = '#6699ff' // Light blue
let colorDefault = '#ffffff' // White
let colorSpecial = '#3d8522' // Green

let n_stars = 4046;
let nExoplanets = 5722;

// Create a basic perspective camera
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 200;

// Create a renderer with Antialiasing
let renderer = new THREE.WebGLRenderer({ antialias: true });

// Configure renderer clear color
renderer.setClearColor('#000000');

// Configure renderer size
renderer.setSize(window.innerWidth, window.innerHeight);

// Append Renderer to DOM
document.body.appendChild(renderer.domElement);

let colors = [];
let initialColors = [];

//Add Sun with a special magenta color
let dotGeometry = new THREE.Geometry();

let rawFile = new XMLHttpRequest();
rawFile.open('GET', 'xyz.txt', false);
rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
            let data = rawFile.responseText.split('\n');

            for (let i = 0; i < n_stars; i++) {
                let parts = data[i].split(',');
                dotGeometry.vertices.push(
                    new THREE.Vector3(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]))
                );
                let color;
                // 1: Special - 0: Normal - 2: Sun
                if (parts[3] == 1) {
                    color = colorSpecial
                } else if (parts[3] == 2) {
                    color = colorSun
                } else {
                    color = colorDefault
                }

                colors.push(new THREE.Color(color));
                initialColors.push(color)
            }
        }
    }
};
rawFile.send(null);

let names;
rawFile = new XMLHttpRequest();
rawFile.open('GET', 'names.txt', false);
rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
            allText = rawFile.responseText;
            names = allText.split('\n');
        }
    }
};
rawFile.send(null);

dotGeometry.colors = colors;

let exoplanetStarNames;
rawFile = new XMLHttpRequest();
rawFile.open('GET', 'exoplanet_star_names.txt', false);
rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
            allText = rawFile.responseText;
            exoplanetStarNames = allText.split('\n');
        }
    }
};
rawFile.send(null);

let bool_matrix_param = 'vis'
const wavelengthSlider = document.getElementById("wavelengthSlider")
wavelengthSlider.addEventListener('change', function() {
    const wavelengthValue = document.getElementById("wavelengthValue")
    wavelengthValue.innerText = this.checked ? 'Infrared' : 'Visible'
    wavelengthValue.style.color = this.checked ? 'red' : 'yellow'
    bool_matrix_param = this.checked ? 'nir' : 'vis'
})

function read_bool_matrix(file_path) {
    let bool_matrix = []
    rawFile = new XMLHttpRequest();
    rawFile.open('GET', file_path, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                allText = rawFile.responseText;
                let bool_matrix_v1 = allText.split('\n')
                for (i=0; i<bool_matrix_v1.length -1; i++){
                    bool_matrix.push(bool_matrix_v1[i].split(','));
                }
            }
        }
    };
    rawFile.send(null);
    
    return bool_matrix
}

let matrix_params = ['Rainbow', 'Glint', 'Glory', 'Rayleigh'];
let file_path;

let boolMatrices = []
matrix_params.forEach((param) => {
    file_path = `../${param.toLowerCase()}bool_${bool_matrix_param}.csv`;
    bool_matrix = read_bool_matrix(file_path)
    boolMatrices.push(bool_matrix)
})

var values = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
slider1.addEventListener('input', function() {
    document.querySelector('span#sliderValue').innerText = values[this.value];
});

let size = 0.4;
let dotMaterial = new THREE.PointsMaterial({
    size: size,
    vertexColors: THREE.VertexColors
});
let dots = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dots);

let controls = new THREE.TrackballControls(camera, renderer.domElement);

// Render Loop
let render = function () {
    requestAnimationFrame(render);
    controls.update();
    // Render the scene
    renderer.render(scene, camera);
    TWEEN.update();
};

render();

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('mousemove', onDocumentMouseMove, false);
window.addEventListener('click', onDocumentMouseClick, true);
window.addEventListener('wheel', onDocumentMouseWheel, true);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let centerindex = 0;
let centerdistval = 200;
let selectedObject = -1;
let clickedObject = -1;

function onDocumentMouseWheel() {
    updateCenterGUI();
}

function onDocumentMouseClick(event) {
    let intersects = getIntersects(event.layerX, event.layerY);
    if (intersects.length > 0) {
        let idx = intersects[0].index;
        // Update the clicked star's information and UI
        updateStarPage(idx);
        // Update colors and camera focus
        clickedObject = idx;
        centerindex = idx;
        updateCenterGUI();
    }
}

let starNameList = []
fetch('names.txt')
    .then(response => response.text())
    .then(data => {
        starNameList = data.split('\n').map(name => name.trim());
    });

const searchInput = document.getElementById('srchkey');
const suggestionsBox = document.getElementById('suggestions-box');

searchInput.addEventListener('focus', function() {
    starNameList.forEach((name) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = name;
        
        suggestionItem.addEventListener('click', function() {
            searchInput.value = name;
            suggestionsBox.innerHTML = '';
            searchfunc()
            searchInput.value = '';
        });

        suggestionsBox.appendChild(suggestionItem);
    });

    suggestionsBox.style.display = 'block';
})

searchInput.addEventListener('input', function() {
    const searchInputVal = searchInput.value.toLowerCase();
    let filteredSuggestions;
    if (searchInputVal == "") {
        filteredSuggestions = starNameList
    } else {
        filteredSuggestions = starNameList.filter(name => name.toLowerCase().includes(searchInputVal))
    }

    suggestionsBox.innerHTML = ''

    filteredSuggestions.forEach((name) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = name;
        
        suggestionItem.addEventListener('click', function() {
            searchInput.value = name;
            suggestionsBox.innerHTML = '';
            searchfunc()
        });

        suggestionsBox.appendChild(suggestionItem);
    });

    if (filteredSuggestions.length > 0) {
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
});

document.addEventListener('click', function(event) {
    if (!suggestionsBox.contains(event.target) && event.target !== searchInput) {
        suggestionsBox.style.display = 'none';
    }
});

function searchfunc() {
    let srchkey = document.getElementById('srchkey').value;
    if (srchkey == '') return;
    let key = srchkey.replace(/[^A-Z0-9]/gi, '').toLowerCase();
    if (key == 'sun') {
        dots.geometry.colors[centerindex] = new THREE.Color(initialColors[centerindex]);
        updateStarPage(0);
        centerindex = 0;
        updateCenterGUI();
    } else {
        let found = false;
        for (let i = 0; i < n_stars; i++) {
            let name = names[i];
            if (name.indexOf(',') > -1) {
                let namearr = name.split(',');
                for (let j = 0; j < namearr.length; j++) {
                    if (namearr[j].replace(/[^A-Z0-9]/gi, '').toLowerCase() == key) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    if (centerindex !== i)
                        dots.geometry.colors[centerindex] = new THREE.Color(initialColors[centerindex]);
                    centerindex = i;

                    updateStarPage(i);
                    updateCenterGUI();
                    break;
                }
            } else {
                if (name.replace(/[^A-Z0-9]/gi, '').toLowerCase() == key) {
                    if (centerindex !== i){
                        dots.geometry.colors[centerindex] = new THREE.Color(initialColors[centerindex]);
                        }
                    centerindex = i;
                    updateStarPage(i);
                    updateCenterGUI();
                    found = true;
                    break;
                }
            }
        }
        if (!found) alert(srchkey + ' not found. Yes, we know we need to improve our search 😊');
    }
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    if (selectedObject >= 0) {
        if (selectedObject === clickedObject) dots.geometry.colors[selectedObject] = new THREE.Color(colorSelect);
        else dots.geometry.colors[selectedObject] = new THREE.Color(initialColors[selectedObject]);
        dots.geometry.colorsNeedUpdate = true;

        selectedObject = -1;
    }

    let intersects = getIntersects(event.layerX, event.layerY);
    if (intersects.length > 0) {
        let idx = intersects[0].index;
        dots.geometry.colors[idx] = new THREE.Color(colorOnHover);
        dots.geometry.colorsNeedUpdate = true;
        selectedObject = idx;
    }
}

function onDocumentMouseClick(event) {
    let intersects = getIntersects(event.layerX, event.layerY);
    if (intersects.length > 0) {
        let idx = intersects[0].index;

        if (centerindex !== idx)
            dots.geometry.colors[centerindex] = new THREE.Color(initialColors[centerindex]);

        updateStarPage(idx);
        if (idx != 0) UpdateInfo()

        dots.geometry.colorsNeedUpdate = true;
        clickedObject = idx;
        centerindex = idx;
        updateCenterGUI();
    }
}

exoplanetInfo = document.getElementById('visibility')

function UpdateInfo(_) {
    let telescopeRows = []
    boolMatrices.forEach((matrix) => {
        telescopeRows.push(matrix[parseInt(slider1.value) + 1])
    })

    let text = ''
    let has = [false, false, false, false];
    for (i=0; i<nExoplanets; i++) {
        if (exoplanetStarNames[i] == names[selectedObject]){
            for (j=0; j<4; j++) {
                if (telescopeRows[j][i] == 'True') {
                    has[j] = true
                }
            }
        }
    }
    

    has.forEach((h, i) => {

        if (h){
            text += (matrix_params[i] + ': Visible\n')
        } else {
            text += (matrix_params[i] + ': No Visible\n')
        }
    })
    exoplanetInfo.innerText = text
}

let raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = size * 0.5;
let mouseVector = new THREE.Vector3();

function getIntersects(x, y) {
    x = (x / window.innerWidth) * 2 - 1;
    y = -(y / window.innerHeight) * 2 + 1;

    mouseVector.set(x, y, 0.5);
    raycaster.setFromCamera(mouseVector, camera);

    return raycaster.intersectObject(dots, true);
}

// TODO cambiar nombres
let starName = document.getElementById('starName');
let starNames = document.getElementById('starNames');
let starDist = document.getElementById('starDist');

let starColor = document.getElementById('starColor');

function updateStarPage(i) {
    let name = names[i];

    starName.innerText = name;
    starName2.innerText = name;
    starNames.innerText = name;
    
    let color;
    let textColor;

    if (name == 'Sun') {
        color = colorSun
        textColor = 'magenta'
    } else {
        color = colorSelect
        textColor = 'yellow'
    }

    dots.geometry.colors[i] = new THREE.Color(color);
    starColor.style.color = color;
    starColor.innerText = textColor;

    if (typeof A !== 'undefined') {

        let d = dots.geometry.vertices[i].length(); // distance
        let fov = 1;
        fov /= d / 2;
        if (fov > 1) fov = 1;

        A.aladin('#aladin-lite-div', { target: firstname, fov, showLayersControl: false, showGotoControl: false });
    }

    let from = controls.target;
    let to = dots.geometry.vertices[i];

    let starDistance = to.length();
    starDist.innerText = `${starDistance.toFixed(1)} pc (${(3.262 * starDistance).toFixed(1)} ly)`;

    TWEEN.removeAll();
    let tween = new TWEEN.Tween(from)
        .to(to, 750)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function (p) {
            camera.lookAt(p);
        });

    tween.start();

    dots.geometry.colorsNeedUpdate = true;
    clickedObject = i;
}

function updateCenterGUI() {
    let cameraloc = camera.position;
    centerdistval = cameraloc.distanceTo(dots.geometry.vertices[centerindex]);
}