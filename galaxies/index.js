// TODO:
// - CONECT SLIDER TO DATA
// - COLOR FOR SPECIAL STARS
// - COLOR FOR SEEN EXOPLANETS AND SEEN OTHER THINGS (TELESCOPE)
// - TOGGLE TO IDENTIFY BOOL EXOPLANETS MATRIX

// Create an empty scene
let scene = new THREE.Scene();

let colorSun = "#ff00ff" // Magenta
let colorSelect = '#ffff00' // Yellow
let colorOnHover = '#6699ff' // Light blue
let colorDefault = '#ffffff' // White
let colorSpecial = '#3d8522' // Green

let n_stars = 4046;
let n_exoplanets = 5722;

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
// dotGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
// colors.push(new THREE.Color(colorSun))
// initialColors.push(colorSun);

let rawFile = new XMLHttpRequest();
rawFile.open('GET', 'xyz.txt', false);
rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
            let data = rawFile.responseText.split('\n');
            // console.log(data)

            for (let i = 0; i < n_stars; i++) {
                let parts = data[i].split(',');
                dotGeometry.vertices.push(
                    new THREE.Vector3(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]))
                );
                let color;
                // let c = 1 // parts[3]
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
            // console.log('COLORS')
            // console.log(colors)
            // console.log('INIT COLORS')
            // console.log(initialColors)
            // console.log('VERTICES')
            // console.log(dotGeometry.vertices)
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

let exoplanet_star_names;
rawFile = new XMLHttpRequest();
rawFile.open('GET', 'exoplanet_star_names.txt', false);
rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
            allText = rawFile.responseText;
            exoplanet_star_names = allText.split('\n');
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
    // if (wavelengthSlider.value) {
    //     bool_matrix_param = 'nir';
    // } else {
    //     bool_matrix_param = 'vis';
    // }
    bool_matrix_param = this.checked ? 'nir' : 'vis'
    // console.log('AAAAAAAAA')
    // console.log(bool_matrix_param)
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

// console.log('PARAAAAAM')
// console.log(bool_matrix_param)
let bool_matrices = []
matrix_params.forEach((param) => {
    console.log(`../${param.toLowerCase()}bool_${bool_matrix_param}.csv`)
    file_path = `../${param.toLowerCase()}bool_${bool_matrix_param}.csv`;
    bool_matrix = read_bool_matrix(file_path)
    bool_matrices.push(bool_matrix)
})
console.log(bool_matrices)

var values = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]; // TODO: CHANGE VALUES AND CAPTURE OUT 
slider1.addEventListener('input', function() {
    // console.log(this.value)
    // console.log('IN')
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
// window.addEventListener('contextmenu', onDocumentMouseRightClick, false);
window.addEventListener('wheel', onDocumentMouseWheel, true);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let centerindex = 0; // central galaxy
// let centerdist = document.getElementById('centerdist');
let centerdistval = 200;
// let startstring = document.getElementById('startstring');
let selectedObject = -1;
let clickedObject = -1;
let rclickedObject = -1;

function onDocumentMouseWheel() {
    updateCenterGUI();
}

function onDocumentMouseClick(event) {
    let intersects = getIntersects(event.layerX, event.layerY);
    if (intersects.length > 0) {
        let idx = intersects[0].index;
        // Update the clicked galaxy's information and UI
        updateGalaxyPage(idx);
        // Update colors and camera focus
        clickedObject = idx;
        centerindex = idx;
        updateCenterGUI();
    }
}


document.getElementById('srchkey').addEventListener('keyup', function (event) {
    event.preventDefault();
    if (event.keyCode === 13) document.getElementById('srchbtn').click();
});

let galaxyNameList = []
fetch('names.txt')
    .then(response => response.text())
    .then(data => {
        galaxyNameList = data.split('\n').map(name => name.trim());
    });

const searchInput = document.getElementById('srchkey');
const suggestionsBox = document.getElementById('suggestions-box');

searchInput.addEventListener('focus', function() {
    galaxyNameList.forEach((name) => {
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
        filteredSuggestions = galaxyNameList
    } else {
        filteredSuggestions = galaxyNameList.filter(name => name.toLowerCase().includes(searchInputVal))
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
        updateGalaxyPage(0);
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
                        // console.log('before')
                        // console.log(dots.geometry.colors[centerindex])
                        dots.geometry.colors[centerindex] = new THREE.Color(initialColors[centerindex]);
                        // console.log('after')
                        // console.log(dots.geometry.colors[centerindex])

                            // centerindex === 0 ? new THREE.Color(new THREE.Color('#f0f')) : new THREE.Color('#fff');
                    centerindex = i;

                    updateGalaxyPage(i);
                    updateCenterGUI();
                    break;
                }
            } else {
                if (name.replace(/[^A-Z0-9]/gi, '').toLowerCase() == key) {
                    if (centerindex !== i){
                        // console.log('before')
                        // console.log(dots.geometry.colors[centerindex])
                        dots.geometry.colors[centerindex] = new THREE.Color(initialColors[centerindex]);
                        // console.log('after')
                        // console.log(dots.geometry.colors[centerindex])

                            // centerindex === 0 ? new THREE.Color(new THREE.Color('#f0f')) : new THREE.Color('#fff');
                        }
                    centerindex = i;
                    updateGalaxyPage(i);
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
        // if (selectedObject === 0) dots.geometry.colors[0] = new THREE.Color(colorSun);
        if (selectedObject === clickedObject) dots.geometry.colors[selectedObject] = new THREE.Color(colorSelect);
        // else if (selectedObject === rclickedObject) dots.geometry.colors[selectedObject] = new THREE.Color('#0f0');
        else dots.geometry.colors[selectedObject] = new THREE.Color(initialColors[selectedObject]);
        // console.log(selectedObject)
        // console.log(dots.geometry.colors[selectedObject])
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

        updateGalaxyPage(idx);
        if (idx != 0) UpdateInfo()
        // if (idx) updateGalaxyPage(idx);
        // else updateGalaxyPage(0);

        dots.geometry.colorsNeedUpdate = true;
        clickedObject = idx;
        centerindex = idx;
        updateCenterGUI();
    }
}

// TODO: CHANGE ID NAME
exoplanet_info = document.getElementById('Hay')

function UpdateInfo(_) {
    // TODO: IDENTIFICAR SI SE VEN LOS EXOPLANETAS DE LA ESTRELLA SELECCIONADA
    let telescope_rows = []
    console.log('update')
    console.log(parseInt(slider1.value) + 1)
    console.log(bool_matrices)
    bool_matrices.forEach((matrix) => {
        telescope_rows.push(matrix[parseInt(slider1.value) + 1])
    })
    console.log('telescope')
    console.log(telescope_rows)

    let text = ''
    let has = [false, false, false, false];
    console.log(names[selectedObject])
    console.log('--------')
    for (i=0; i<n_exoplanets; i++) {
        // console.log(names)
        // console.log(exoplanet_star_names)
        if (exoplanet_star_names[i] == names[selectedObject]){
            console.log('coincide exoplaneta')
            for (j=0; j<4; j++) {
                console.log('ij')
                console.log(telescope_rows[j][i])
                if (telescope_rows[j][i] == 'True') {
                    console.log('TRUEEEE')
                    has[j] = true
                    console.log('SI TIENE')
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
    // console.log('NAMES')
    // console.log(selectedObject)
    // console.log(names)

    // console.log('exo')
    // console.log(exoplanet_star_names)
    exoplanet_info.innerText = text // TODO: CHANGE TEXT
}
// function onDocumentMouseRightClick(event) {
//     let intersects = getIntersects(event.layerX, event.layerY);
//     if (intersects.length > 0) {
//         let idx = intersects[0].index;
//         if (idx) dots.geometry.colors[idx] = new THREE.Color('#0f0');
//         else dots.geometry.colors[idx] = new THREE.Color('#f0f');
//         dots.geometry.colorsNeedUpdate = true;
//         rclickedObject = idx;
//     }
// }

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
let galaxyName = document.getElementById('galaxyName');
let galaxyName2 = document.getElementById('galaxyName2');
let galaxyNames = document.getElementById('galaxyNames');
let galaxyDist = document.getElementById('galaxyDist');

let galaxyColor = document.getElementById('galaxyColor');

// let exoplanetsTitle = document.getElementById('exoplanetsTitle')

// let image = document.getElementById('image');

// let cdsLink = document.getElementById('cds');
// let simbad = document.getElementById('simbad');
// let aladinLink = document.getElementById('aladin');
// let ned = document.getElementById('ned');

// let aladinDiv = document.getElementById('aladin-lite-div');
function updateGalaxyPage(i) {
    let name = names[i];
    // console.log(i)
    // console.log(dots.geometry.colors[i])

    galaxyName.innerText = name;
    galaxyName2.innerText = name;
    galaxyNames.innerText = name;
    
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
    galaxyColor.style.color = color;
    galaxyColor.innerText = textColor;

    // console.log(galaxyColor.stylsrs[i])



    // if (i === 0) {
    //     galaxyName.innerText = 'Sun';
    //     galaxyName2.innerText = 'Sun';
    //     galaxyNames.innerText = 'Sun';

    //     dots.geometry.colors[0] = new THREE.Color(colorSun);
    //     galaxyColor.style.color = colorSun;
    //     galaxyColor.innerText = 'magenta';
    //     //exoplanetsTitle.innerText = ''

    //     // if (typeof A !== 'undefined') {
    //         // if (aladinDiv.style.display === 'none') aladinDiv.style.display = 'block';
    //         // if (image.style.display === 'block') image.style.display = 'none';
    //         // A.aladin('#aladin-lite-div', { target: '266.4 -29', fov: 60, showLayersControl: false, showGotoControl: false });
    //     // } else
    //         // image.src =
    //         //     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/ESO-VLT-Laser-phot-33a-07.jpg/1280px-ESO-VLT-Laser-phot-33a-07.jpg';

    //     // if (cdsLink.style.display === 'block') cdsLink.style.display = 'none';
    //     // if (simbad.style.display === 'block') simbad.style.display = 'none';
    //     // if (aladinLink.style.display === 'block') aladinLink.style.display = 'none';
    //     // if (ned.style.display === 'block') ned.style.display = 'none';
    // } else {
    //     dots.geometry.colors[i] = new THREE.Color(colorSelect);

    //     galaxyColor.style.color = colorSelect;
    //     galaxyColor.innerText = 'yellow';

    //     let firstname = name//.split(',')[0];

    //     galaxyName.innerText = firstname;
    //     galaxyName2.innerText = firstname;
    //     galaxyNames.innerText = name;
    //     // exoplanetsTitle.innerText = 'Explonets'


        // if (cdsLink.style.display === 'none') cdsLink.style.display = 'block';
        // if (simbad.style.display === 'none') simbad.style.display = 'block';
        // if (aladinLink.style.display === 'none') aladinLink.style.display = 'block';
        // if (ned.style.display === 'none') ned.style.display = 'block';

        // cdsLink.href = `http://cdsportal.u-strasbg.fr/?target=${firstname}`;
        // simbad.href = `http://simbad.u-strasbg.fr/simbad/sim-id?Ident=${firstname}`;
        // aladinLink.href = `https://aladin.u-strasbg.fr/AladinLite/?target=${firstname}`;
        // ned.href = `https://ned.ipac.caltech.edu/cgi-bin/objsearch?extend=no&hconst=73&omegam=0.27&omegav=0.73&corr_z=1&out_csys=Equatorial&out_equinox=J2000.0&obj_sort=RA+or+Longitude&of=pre_text&zv_breaker=30000.0&list_limit=5&img_stamp=YES&objname=${firstname}`;

    if (typeof A !== 'undefined') {
        // if (aladinDiv.style.display === 'none') aladinDiv.style.display = 'block';
        // if (image.style.display === 'block') image.style.display = 'none';

        let d = dots.geometry.vertices[i].length(); // distance
        let fov = 1;
        fov /= d / 2;
        if (fov > 1) fov = 1;

        A.aladin('#aladin-lite-div', { target: firstname, fov, showLayersControl: false, showGotoControl: false });
    } else {
        // image.src = `http://alasky.u-strasbg.fr/cgi/simbad-thumbnails/get-thumbnail.py?name=${firstname}`;
    }
    // }
    // TODO: CHECK IF ITS USED
    let from = controls.target;
    let to = dots.geometry.vertices[i];

    let galaxyDistance = to.length();
    galaxyDist.innerText = `${galaxyDistance.toFixed(1)} pc (${(3.262 * galaxyDistance).toFixed(1)} ly)`;

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

    // centerdist.innerHTML = centerdistval.toFixed(2);
    // centerdistly.innerHTML = (3.262 * centerdistval).toFixed(2);
}



// const values = [1, 3, 5, 10, 20, 50, 100];

// const input = document.getElementById('input'),
//     output = document.getElementById('output');

// input.oninput = function() {
//     output.innerHTML = values[this.value];
// };

// // set the default value
// input.oninput();
