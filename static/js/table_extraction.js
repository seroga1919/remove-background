class Operation {
    constructor(){
        this.detect_table = {};
        this.ratio = {};
        this.size = 0; // length of key
        this.w_r = 0.9;
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        this.imlist = document.getElementById("image_list");
        this.collap_ind = {}; // definition in upload function. represent number of every pdf.
        this.w_r = 0.9;
        this.convert_checking = false;
        this.coll = null;
        this.tables = {};
        this.cascaded_method = "Program";
    }
    
    get_ext_body(img_name){
        let name_body = img_name.substring(img_name.length-4, 0);
        let extension = img_name.substring(img_name.length-4);
        return {name_body, extension};
    }

    upload(data, cascaded_method) {        
        this.key = Object.keys(data);
        this.size = this.key.length;
        this.detect_table = data;
        this.ratio = {}
        this.imlist.innerHTML = " ";   
        this.cascaded_method = cascaded_method;  
        var kk = 0;
        let show_checking = true;

        for (var ii = 0; ii < this.size; ii++) { 
            let w = document.getElementById("main_mid").offsetWidth * this.w_r;
            var button = document.createElement('button')   
            let {name_body, extension} = this.get_ext_body(this.key[ii]);
            
            if(extension==".pdf") { // if pdf
                
                if(show_checking) {
                    this.show_img(name_body, "pdf", 0);
                    show_checking = false;
                }
                
                let sub_key = Object.keys(this.detect_table[this.key[ii]]); //from upldfile function in api.py
                let sub_size = sub_key.length;
                this.collap_ind[this.key[ii]] = kk;
                this.imlist.appendChild(button);
                var imlist_div = document.createElement('div');
                let sub_detect_table = {};
                let sub_ratio = {};
                
                kk = kk + 1;
                button.innerHTML = this.key[ii];
                button.className = "bttn collapsible";

                for (var jj = 0; jj < sub_size; jj++) { 
                    sub_detect_table[sub_key[jj]] = this.detect_table[this.key[ii]][sub_key[jj]];
                    sub_ratio[sub_key[jj]] = w/sub_detect_table[sub_key[jj]].pop(-1);
                    var button = document.createElement('button');
                    button.innerHTML = sub_key[jj];
                    button.className = "pdfbtn";
                    imlist_div.appendChild(button);

                    for (k= 0; k < this.detect_table[this.key[ii]].length; k++) {
                        sub_detect_table[sub_key[jj]][k] = sub_detect_table[sub_key[jj]][k].map(x=> x*ratio[this.key[ii]]);
                    }
                }
                imlist_div.className = "content";
                this.imlist.appendChild(imlist_div);
                this.detect_table[this.key[ii]] = sub_detect_table;
                this.ratio[this.key[ii]] = sub_ratio;

            } else { // if jpg
                
                this.ratio[this.key[ii]] = w/this.detect_table[this.key[ii]].pop(-1);
                button.innerHTML = this.key[ii];
                button.className = "bttn";
                this.imlist.appendChild(button);

                let values = this.detect_table[this.key[ii]];
                for (var k= 0; k < values.length; k++) { //resizing detected region according to canvas's size
                    values[k] = values[k].map(x=> Math.floor(x*this.ratio[this.key[ii]]));
                }

                if(show_checking) {
                    this.show_img(this.key[0], "jpg", 0)
                    show_checking = false;
                }   
            }
        }
        this.coll = document.getElementsByClassName("collapsible"); 
    }

    show_img(img_name, extension, ind) {

        // let name_body, extension = this.get_ext_body(img_name);
        let detect_table = this.detect_table;
        let canvas = this.canvas;
        let ctx = this.ctx;
        let imageObj = null;
        let w_r = this.w_r;
        let w = document.getElementById("main_mid").offsetWidth*w_r;     
        var s = null;
        imageObj = new Image();
        if (extension == "pdf") {
            imageObj.onload = function () { 
                let h = w/imageObj.width*imageObj.height;
                canvas.width = w;
                canvas.height = h;  
                ctx.drawImage(imageObj, 0, 0, w, h);
                let myPromise = new Promise(function(myResolve, myReject){
                    s = new canvaState(canvas, detect_table, imageObj, img_name+".pdf", ind);
                    myResolve(s);
                    myReject("Error!!!");
                });
                myPromise.then(
                    // function(value) {clear(value, img_name, "pdf");},
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
                let h = w/imageObj.width*imageObj.height; 
                canvas.width = w;
                canvas.height = h; 
                let myPromise = new Promise(function(myResolve, myReject){
                    s = new canvaState(canvas, detect_table, imageObj, img_name_body, 0);
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

    det_modify() {   
        let imgsize = 10000;
        let temp_detect_table = {};
        for (var attr in myoperation.detect_table) {
            if (this.detect_table.hasOwnProperty(attr)) temp_detect_table[attr] = clone(this.detect_table[attr]);
        }        

        for (var ii = 0; ii < this.size; ii++) { 
            let {name_body, extension} = this.get_ext_body(this.key[ii]);   
            if(extension==".pdf") { // if pdf
                let sub_detect_table = {};            
                let sub_ratio = {};
                let sub_key = Object.keys(this.detect_table[this.key[ii]]); //from upldfile function in api.py
                let sub_size = sub_key.length;
                
                for (var jj = 0; jj < sub_size; jj++) { 
                    let mm = Object.keys(this.detect_table[this.key[ii]][sub_key[jj]]).length;
                    sub_detect_table[sub_key[jj]] = this.detect_table[this.key[ii]][sub_key[jj]];
                    sub_ratio[sub_key[jj]] = this.ratio[this.key[ii]][sub_key[jj]];
                    for (k= 0; k < mm; k++) {
                        sub_detect_table[sub_key[jj]][k] = sub_detect_table[sub_key[jj]][k].map(x=> x/sub_ratio[sub_key[jj]]);
                    }
                    if (this.cascaded_method=="Manual" & sub_detect_table[sub_key[jj]].length == 0) { 
                        sub_detect_table[sub_key[jj]] = [[0, 0, imgsize, imgsize]]; }
                }
                temp_detect_table[this.key[ii]] = sub_detect_table;
                        
            } else {
                for (k= 0; k < this.detect_table[this.key[ii]].length; k++) { //resizing detected region according to canvas's size
                    temp_detect_table[this.key[ii]][k] = temp_detect_table[this.key[ii]][k].map(x=> Math.floor(x/this.ratio[this.key[ii]]));}
                if (this.cascaded_method=="Manual" && this.detect_table[this.key[ii]].length == 0) {
                    temp_detect_table[this.key[ii]] = [[0, 0, imgsize, imgsize]]; }
            } 
        }
        return temp_detect_table
    }
    
    drawTable(tbl) {
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

    imglistprocessing(event) {
        
        var btnclsname = event.target.className;
        let img_name = event.target.innerHTML;
        let {name_body, extension} = this.get_ext_body(img_name);
        var collvaria = this.coll[this.collap_ind[img_name]];
        
        if (this.convert_checking) {
            
            if(extension == ".pdf") {
                collvaria.classList.toggle("active");
                var content = collvaria.nextElementSibling;
                if (content.style.maxHeight){
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                } 
                let tblename = Object.values(this.tables[img_name])[0];
                this.drawTable(tblename.split('_page_')[0]+"/"+tblename);
            } else{
                if (btnclsname == "pdfbtn") {
                    let bodyname = img_name.split('_page_')[0];
                    this.drawTable(bodyname+"/"+img_name+".xlsx");
                } else {
                    this.drawTable(this.tables[img_name]);   
                }
            }

        } else { // Before convering...
            console.log("not converting")
            if(extension == ".pdf") {
                collvaria.classList.toggle("active");
                var content = collvaria.nextElementSibling;
                if (content.style.maxHeight){
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                } 
                this.show_img(name_body, "pdf", 0);// display first page of pdf when press + button    
            } else{
                if (btnclsname == "pdfbtn") {
                    this.show_img(img_name.split("_page_")[0]+"/"+img_name,"jpg", 0);       
                } else {
                    this.show_img(img_name,"jpg", 0);        
                }
            }
        }
    }
}

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


// var coll = document.getElementsByClassName("collapsible");

customBtn.addEventListener("click", function () {
realFileBtn.click();
});

var myoperation = new Operation();
realFileBtn.addEventListener("change", function () {
    
    if (realFileBtn.value) {
        var radios = document.getElementsByName('Cascaded');
        var cascaded_method = "Program";
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
            // do whatever you want with the checked radio
            cascaded_method = radios[i].value
            // only one radio can be logically checked, don't check the rest
            break;
            }
        }        
        myoperation.convert_checking = false;
        $("#table").css("display", "none");
        $(".loadAnim").css("display", "block");

        var file_length = realFileBtn.files.length
        customTxt.innerHTML = file_length + "  files chosen";
        var form_data = new FormData($('#uploadform')[0]);
        // var cascade_send = false;       
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
                        myoperation.upload(data, cascaded_method);
                        $(".loadAnim").css("display", "none");
                    },
                })
                $("#canvas").css("display", "block");
            },
        })
        

    } else {
        customTxt.innerHTML = "No file chosen, yet.";
    }

});    

///// image selection and canvas event /////
const wrapper = document.getElementById('image_list');
    wrapper.addEventListener('click', (event) => {
    const isButton = event.target.nodeName === 'BUTTON';
    if (!isButton) {
        return;
    }
    myoperation.imglistprocessing(event);
    
})   
//////////////////////////////////
///// Convert button event /////
$('#convert_button').click(function () { 
    $(".loadAnim").css("display", "block");  
    
    let temp_detect_table = myoperation.det_modify();
    // temp_detect_table["setting"] = [document.getElementById("setting_lang").value, document.getElementById("setting_h").value];
    imm = JSON.stringify(temp_detect_table);
     
    $.ajax({
    type: 'POST',
    url: '/process',
    data: imm,
    contentType: false,
    cache: false,
    processData: false,
                
    success: function (data) {
        console.log("success")     
    },
    })
})

///// using canvas command /////
function clear(s, img_name, extension) { 
    s.shapes = [];
    s.isValid = false;
    let det = [];
    if(extension=="pdf"){
        det = myoperation.detect_table[img_name+".pdf"][img_name+'_page_0.jpg'];
    }else{
        det = myoperation.detect_table[img_name]; // for image file.
        if (det==null) {
            let pdf_name = img_name.split('_page_')[0] + ".pdf";
            det = myoperation.detect_table[pdf_name][img_name]; // for page image in pdf file.
        }
    }
    for (k= 0; k < det.length; k++) { 
        s.isValid = false;

        s.addShape(new rectShape(det[k]));
        s.draw();
    }    
}
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}