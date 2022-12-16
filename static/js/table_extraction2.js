///// initial setting //////
$("#canvas").css("display", "none");
$(".loadAnim").css("display", "none");
$("#table").css("display", "none");
document.getElementById('nameB').checked = true;
///// Choose button event /////
function onClickMenu() {
document.getElementById("menu").classList.toggle("change");
document.getElementById("nav").classList.toggle("change");
document.getElementById("menu-bg").classList.toggle("change-bg");
}
const realFileBtn = document.getElementById("upform");
const customBtn = document.getElementById("custom-button");
const customTxt = document.getElementById("custom-text");
var cascaded_method = "Program";
var collap_ind = {};
var coll = document.getElementsByClassName("collapsible");
var ratio = {};
var convert_checking = false;
var tables = {};

customBtn.addEventListener("click", function () {
realFileBtn.click();
});

realFileBtn.addEventListener("change", function () {
    $("#canvas").css("display", "block");
    if (realFileBtn.value) {
        var radios = document.getElementsByName('Cascaded');
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
            // do whatever you want with the checked radio
            cascaded_method = radios[i].value
            // only one radio can be logically checked, don't check the rest
            break;
            }
        }        
        convert_checking = false;
        detect_table = {};
        ratio = {};
        $("#table").css("display", "none");
        $(".loadAnim").css("display", "block");

        var file_length = realFileBtn.files.length
        customTxt.innerHTML = file_length + "  files chosen";
        var form_data = new FormData($('#uploadform')[0]);
        var cascade_send = false;       
        var sendata = {};
        sendata["0"] = cascaded_method
        sendata = JSON.stringify(sendata)
        $.ajax({
            type: 'POST',
            url: '/cascade',
            data: sendata,
            contentType: false,
            cache: false,
            processData: false,     
            success: function (data) { 

                $.ajax({
                    type: 'POST',
                    url: '/upload',
                    data: form_data,
                    contentType: false,
                    cache: false,
                    processData: false,
                    
                    success: function (data) {

                        var key = Object.keys(data);
                        var size = key.length;
                        var kk = 0;
                        let show_checking = true;
                        xx = document.getElementById("image_list")
                        xx.innerHTML = " ";
                        console.log(data)
                        detect_table = data
                        
                        for (ii = 0; ii < size; ii++) { 
                            
                            var button = document.createElement('button')       
                            if(key[ii].substring(key[ii].length-4)==".pdf") { // if pdf
                                
                                if(show_checking) {
                                    show_img(key[ii].substring(key[ii].length-4, 0), "pdf", 0);
                                    show_checking = false;
                                }
                                
                                let sub_key = Object.keys(detect_table[key[ii]]); //from upldfile function in api.py
                                collap_ind[key[ii]] = kk;
                                kk = kk + 1;
                                let sub_detect_table = {};
                                let sub_ratio = {};
                                button.innerHTML = key[ii];
                                button.className = "bttn collapsible";
                                xx.appendChild(button);
                                xxdiv = document.createElement('div');

                                for (var jj = 0; jj < sub_key.length; jj++) { 
                                    // ratio[key[ii]] = w/data[key[ii]].pop(-1);
                                    sub_detect_table[sub_key[jj]] = detect_table[key[ii]][sub_key[jj]];
                                    sub_ratio[sub_key[jj]] = w/sub_detect_table[sub_key[jj]].pop(-1);
                                    var button = document.createElement('button');
                                    button.innerHTML = sub_key[jj];
                                    button.className = "pdfbtn";
                                    xxdiv.appendChild(button);

                                    for (k= 0; k < detect_table[key[ii]].length; k++) {
                                        sub_detect_table[sub_key[jj]][k] = sub_detect_table[sub_key[jj]][k].map(x=> x*ratio[key[ii]]);
                                    }
                                }
                                xxdiv.className = "content";
                                xx.appendChild(xxdiv);
                                detect_table[key[ii]] = sub_detect_table;
                                ratio[key[ii]] = sub_ratio;

                            } else { // if jpg
                                
                                ratio[key[ii]] = w/detect_table[key[ii]].pop(-1);
                                button.innerHTML = key[ii];
                                button.className = "bttn";
                                xx.appendChild(button);
                                
                                for (k= 0; k < detect_table[key[ii]].length; k++) { //resizing detected region according to canvas's size
                                    detect_table[key[ii]][k] = detect_table[key[ii]][k].map(x=> Math.floor(x*ratio[key[ii]]));
                                    
                                }

                                if(show_checking) {
                                    show_img(key[0], "jpg", 0)
                                    show_checking = false;
                                }
                                
                            }
                            
                        }
                        
                        $(".loadAnim").css("display", "none");
                    },
                })
            },
        })

        coll = document.getElementsByClassName("collapsible");  

    } else {
        customTxt.innerHTML = "No file chosen, yet.";
    }

});    

//////////////////////////////////
///// Convert button event /////
$('#convert_button').click(function () { 

    key = Object.keys(detect_table);
    let imgsize = 10000;
    for (var ii = 0; ii < key.length; ii++) { 
        
        if(key[ii].substring(key[ii].length-4)==".pdf") { // if pdf

            let sub_key = Object.keys(detect_table[key[ii]]);
            let sub_detect_table = {};            
            let sub_ratio = {};    
            for (var jj = 0; jj < sub_key.length; jj++) { 
                sub_detect_table[sub_key[jj]] = detect_table[key[ii]][sub_key[jj]];
                sub_ratio[sub_key[jj]] = ratio[key[ii]][sub_key[jj]];

                for (k= 0; k < detect_table[key[ii]].length; k++) {
                    sub_detect_table[sub_key[jj]][k] = sub_detect_table[sub_key[jj]][k].map(x=> x/sub_ratio[sub_key[jj]]);
                }
                if (cascaded_method=="Manual" & sub_detect_table[sub_key[jj]].length == 0) { 
                    sub_detect_table[sub_key[jj]] = [0, 0, imgsize, imgsize]; }
            }
            detect_table[key[ii]] = sub_detect_table;
                    
        } else {
            for (k= 0; k < detect_table[key[ii]].length; k++) { //resizing detected region according to canvas's size
                detect_table[key[ii]][k] = detect_table[key[ii]][k].map(x=> Math.floor(x/ratio[key[ii]]));}
            if (cascaded_method=="Manual" && detect_table[key[ii]].length == 0) {
                detect_table[key[ii]] = [0, 0, imgsize, imgsize]; }

        } 
    }
    detect_table["setting"] = [document.getElementById("setting_lang").value, document.getElementById("setting_h").value]

    imm = JSON.stringify(detect_table)
    $(".loadAnim").css("display", "block");  
        
    $.ajax({
    type: 'POST',
    url: '/process',
    // data: {'ids':imgnames, type:'info'},
    data: imm,
    contentType: false,
    cache: false,
    processData: false,
                
    success: function (data) {
        var key = Object.keys(data);
        var size = key.length;
        tables = data;
        convert_checking = true;

        if (typeof(tables[key[0]]) == "object"){
            let tblename = Object.values(tables[key[0]])[0];
            drawTable(tblename.split('_page_')[0]+"/"+tblename);
        } else {
            drawTable(tables[key[0]]);
        }          
    },
    })
})
function drawTable(tbl) {
    $(".loadAnim").css("display", "none");
    $("#table").css("display", "block");
    $("#canvas").css("display", "none");      
    const excel_file = document.getElementById('table');
    var req = new XMLHttpRequest();
    req.open("GET", "http://127.0.0.1:5000/static/output/"+tbl, true);
    req.responseType = "arraybuffer";

    req.onreadystatechange = function(e) {
        if(req.readyState === 4)
        {
            if(req.status === 200 || req.status == 0)
            {
            var data = new Uint8Array(req.response);
            //var workbook = XLSX.read(data, {type:"array"});
            var workbook = XLSX.read(data, {type:"array"});
            var sheet_name = workbook.SheetNames;
            var sheet_data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name[0]], {
                header: 1
            });
            if (sheet_data.length > 0) {
                var table_output = '<table class="table table-striped table-bordered">';
                for (var row = 0; row < sheet_data.length; row++) {
                table_output += '<tr>';
                if (row == 0) {
                    table_output += '<th>' + ['Serial'] + '</th>'
                } else {
                    table_output += '<td>' + row + '</td>'
                }
                for (var cell = 0; cell < sheet_data[row].length; cell++) {

                    if (row == 0) {
                        if (sheet_data[row][cell]) {
                            table_output += '<th>' + sheet_data[row][cell] + '</th>';   
                        } else {
                            table_output += '<th>' + "" + '</th>';
                        }
                    } else {
                        if (sheet_data[row][cell]) {
                            table_output += '<td>' + sheet_data[row][cell] + '</td>';
                        } else { 
                            table_output += '<td>' + "" + '</td>';
                        }
                    }
                }
                table_output += '</tr>';
                }
                table_output += '</table>';
                document.getElementById('table').innerHTML = table_output;
            }
            excel_file.value = '';              
            }
        /* DO SOMETHING WITH workbook HERE */
        }
    }
req.send(); 
}
function show_img(img_name, extension, ind) {

    
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var s = null;
    imageObj = new Image();
    if (extension == "pdf") {
        imageObj.onload = function () { 
            w = document.getElementById("main_mid").offsetWidth*w_r;
            h = w/imageObj.width*imageObj.height;
            // canvas.style.width = "90%"; 
            canvas.width = w;
            canvas.height = h;  
            ctx.drawImage(imageObj, 0, 0, w, h);
            let myPromise = new Promise(function(myResolve, myReject){
                s = new canvaState(canvas,imageObj, img_name+".pdf", ind);
                myResolve(s);
                myReject("Error!!!");
            });
            myPromise.then(
                function(value) {clear(value, img_name, "pdf");},
                function(error) {console.log(error);}
            )
        }; 
        imageObj.src=`static/img/${img_name}/` + `${img_name}_page_${ind}.jpg`;  
    } else {
        let img_name_body = img_name.split('/')[1];
        if(img_name_body==null) {
            img_name_body = img_name;
        }
        imageObj.onload = function () { 
            w = document.getElementById("main_mid").offsetWidth*w_r;
            h = w/imageObj.width*imageObj.height; 
            canvas.width = w;
            canvas.height = h; 
            let myPromise = new Promise(function(myResolve, myReject){
                s = new canvaState(canvas,imageObj, img_name_body, 0);
                myResolve(s);
                myReject("Error!!!");
            });
            myPromise.then(
                function(value) {clear(value, img_name_body, "jpg");},
                function(error) {console.log(error);}
            )
            ctx.drawImage(imageObj, 0, 0, w, h); 
        };          
        imageObj.src=`static/img/${img_name}`;            
    }
}

///// using canvas command /////

var imageObj = null;
var detect_table = {};
var ii = 0;
var w_r = 0.9;
var w = document.getElementById("main_mid").offsetWidth*w_r;
///// image selection and canvas event /////
const wrapper = document.getElementById('image_list');
    wrapper.addEventListener('click', (event) => {
    const isButton = event.target.nodeName === 'BUTTON';
    var re = /(?:\.([^.]+))?$/;        
    if (!isButton) {
        return;
    }
    var btnclsname = event.target.className;
    let img_name = event.target.innerHTML;
    if (convert_checking) {
        
        if(re.exec(img_name)[1] == "pdf") {
        
        coll[collap_ind[img_name]].classList.toggle("active");
        var content = coll[collap_ind[img_name]].nextElementSibling;
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        } 
        let tblename = Object.values(tables[img_name])[0];
        drawTable(tblename.split('_page_')[0]+"/"+tblename);
        } else{
        if (btnclsname == "pdfbtn") {
            let bodyname = img_name.split('_page_')[0];
            drawTable(bodyname+"/"+img_name+".xlsx");
        } else {
            drawTable(tables[img_name]);   
        }
        
        }

    } else { // Before convering...
        console.log("not converting")
        let img_name = event.target.innerHTML;
        if(re.exec(img_name)[1] == "pdf") {
        
            coll[collap_ind[img_name]].classList.toggle("active");
            var content = coll[collap_ind[img_name]].nextElementSibling;
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            } 
            show_img(img_name.substring(img_name.length-4, 0), "pdf", 0);// display first page of pdf when press + button    
        } else{
            if (btnclsname == "pdfbtn") {
                show_img(img_name.split("_page_")[0]+"/"+img_name,"jpg", 0);       
            } else {
                show_img(img_name,"jpg", 0);        
            }
        }
    }
})   
function clear(s, img_name, extension) { 
    s.shapes = [];
    s.isValid = false;
    let det = [];
    if(extension=="pdf"){
        det = detect_table[img_name+".pdf"][img_name+'_page_0.jpg'];
    }else{
        det = detect_table[img_name]; // for image file.
        if (det==null) {
            let pdf_name = img_name.split('_page_')[0] + ".pdf";
            det = detect_table[pdf_name][img_name]; // for page image in pdf file.
        }
    }
    // s.addShape(new rectShape([10, 10, 100, 100]));
    for (k= 0; k < det.length; k++) { 
        s.isValid = false;

        s.addShape(new rectShape(det[k]));
        s.draw();
    }    
}
function save(s, img_name) {
    let det = s.shapes;

    for (k= 0; k < det.length; k++) {
        detect_table[img_name][k] = [det[k][x], det[k][y], det[k][w], det[k][h]];

    }
}

    // let keyname = "";
    // let pagename = "";
    // try {
    //     rectStartXArray = detect_table[name][0];
    //     rectStartYArray = detect_table[name][1];
    //     rectWArray = detect_table[name][2];
    //     rectHArray = detect_table[name][3];
    //     keyname = name;   
    //     pagename = "";
        
    // } catch {
    //     keyname = name.split('/')[0] + ".pdf";
    //     pagename = name.split('/')[1];
    //     rectStartXArray = detect_table[keyname][pagename][0];
    //     rectStartYArray = detect_table[keyname][pagename][1];
    //     rectWArray = detect_table[keyname][pagename][2];
    //     rectHArray = detect_table[keyname][pagename][3];          
    // }
    // return [keyname, pagename];

// function save(keyname, pagename) {
// try {
//     detect_table[keyname][pagename] = [rectStartXArray, rectStartYArray, rectWArray, rectHArray];
// } catch {
//     detect_table[keyname] = [rectStartXArray, rectStartYArray, rectWArray, rectHArray];
// }

// }

// function init__(name) {
//     console.log("checking1");
//     let keyname = "";
//     let pagename = "";
    
//     ii = 0;
//     [keyname, pagename] = clear(name);
//     console.log("checking1");
//     drawOldShapes();
//     console.log("checking2");
//     canvas.addEventListener('mousedown', mouseDown, false);
//     canvas.addEventListener('mouseup', mouseUp, false);
//     canvas.addEventListener('mousemove', mouseMove, false);
//     save(keyname, pagename);
// }

// function mouseDown(e) {
    
//     rect.startX = e.pageX - document.getElementById('canvas').offsetLeft-5;
//     rect.startY = e.pageY - document.getElementById('main_mid').offsetTop;
//     drag = true;
// }

// function mouseUp() {
//     if (ii>0) {
//     if (rect.w) {
//         rectStartXArray[rectStartXArray.length] = rect.startX;
//         rectStartYArray[rectStartYArray.length] = rect.startY;
//         rectWArray[rectWArray.length] = rect.w;
//         rectHArray[rectHArray.length] = rect.h;
//     }
//     draw();  
//     } else {
//     ii = ii + 1;
//     }
    
//     drawOldShapes();drag = false;
// }
// function mouseMove(e) {
// if (drag) {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(imageObj, 0, 0, w, h);
//     rect.w = (e.pageX - document.getElementById('canvas').offsetLeft-5) - rect.startX;
//     rect.h = (e.pageY - document.getElementById('main_mid').offsetTop) - rect.startY; 
//     }
// }

// function draw() {
//     ctx.beginPath();
//     ctx.strokeStyle = 'red';
//     ctx.rect(rect.startX, rect.startY, rect.w, rect.h);
//     ctx.stroke();
// }
// function drawOldShapes(){
//     console.log("checking3");
//     console.log(rectStartXArray)
//     for(var i=0;i<rectStartXArray.length;i++)
//     {
//         console.log("checking4");
//         console.log(rect.startX, rect.startY)
//         // if(rectStartXArray[i]!= rect.startX && rectStartYArray[i] != rect.startY && rectWArray[i] != rect.w && rectHArray[i] != rect.h)
//         if (true )
//         {
//             console.log("checking5")  
//             ctx.beginPath();
//             ctx.strokeStyle = 'red';
//             ctx.rect(rectStartXArray[i], rectStartYArray[i], rectWArray[i], rectHArray[i]);
//             ctx.stroke();
//             console.log(rectStartXArray, "ddd")
//         }
//     }
// }      
