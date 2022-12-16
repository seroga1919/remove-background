import os
import shutil
from flask import Flask, render_template, request, send_file, jsonify
from flask_uploads import UploadSet, configure_uploads, IMAGES
import cv2
import numpy as np
import pandas as pd
# import matplotlib.pyplot as plt
import statistics
import json
# from  zipfile import ZipFile
import zipfile
from io import BytesIO
import time
from glob import glob
from flask_cors import CORS, cross_origin
from rembg import remove

# from table_parser import setting_fun, Pdf_split, Document, Page
# from cascade_detection_mmdet import cascade_mmdet

# pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
app = Flask(__name__)
CORS(app)
photos = UploadSet('photos', IMAGES)

app.config['UPLOADED_PHOTOS_DEST'] = 'static/img'
configure_uploads(app, photos)


def main_table(filename, indir, outdir, setting, coor):
    
    hcoe, reader, tess_language = setting_fun(setting)
    pdf_doc = Document(filename, coor, indir, outdir, hcoe, reader, tess_language)
    pdf_doc.parse_doc()

    return None
def get_xywh(filename):
    xywh = []
    kk = 0.05
    if cascaded_method == "Manual":
        _, imgw, _ = cv2.imread(filename).shape

    xywh.append(imgw)
    return  xywh

def clear_contents(dir_path):
    '''
    Deletes the contents of the given filepath. Useful for testing runs.
    '''
    filelist = os.listdir(dir_path)
    if filelist:
        for f in filelist:
            if os.path.isdir(os.path.join(dir_path, f)):
                shutil.rmtree(os.path.join(dir_path, f))
            else:
                os.remove(os.path.join(dir_path, f))
    return None

global cascaded_method
cascaded_method = "Program"
@app.route('/')
def landing():
    return render_template('landing_page.html')

@app.route('/main', methods=['GET'])
def home():
    return render_template('home.html')

# AJAX upload route
@app.route('/cascade', methods=['POST'])
def cascademethod():
    if request.method == 'POST':
        a = request.data        
        a = json.loads(a.decode('utf-8'))  
        global cascaded_method
        cascaded_method= a["0"]    
        return cascaded_method
@app.route('/upload', methods=['POST'])
def upldfile():

    if request.method == 'POST' and 'file' in request.files:
        files = request.files.getlist('file')
        clear_contents("static/img")
        clear_contents("static/output")
        clear_contents("static/downloadData")
        detect_table = {}
        
        for ff in files:
            x, y, w, h = [], [], [], []
            
            filename = ff.filename
            savepath = f"static/img/{filename}"
            ff.save(savepath)
            if filename.split('.')[-1].lower() == "pdf":
                starttime = time.time()
                pdf_pages = Pdf_split(savepath)
                print(time.time()-starttime, "oooooooooooooo")
                os.mkdir(savepath[0:-4])
                os.mkdir(f"static/output/{filename[0:-4]}")
                page_detect_table = {}
                for i in range(len(pdf_pages)):
                    ssname = f"{savepath[0:-4]}/{filename[0:-4]}_page_{i}.jpg"
                    cv2.imwrite(ssname, pdf_pages[i])
                    page_detect_table[f"{filename[0:-4]}_page_{i}.jpg"] = get_xywh(ssname)
                detect_table[filename] = page_detect_table
                os.remove(savepath)
            else:
                detect_table[filename] = get_xywh(savepath)
            print(detect_table)
        return detect_table
# AJAX process route
@app.route('/process', methods=['POST'])
def convert():
    
    if request.method == 'POST':
        a = request.data        
        filenames = json.loads(a.decode('utf-8')) 
        dataF = {}
        # setting = filenames["setting"]
        print(filenames, "filenames")
        for filename in filenames.keys():
            img = cv2.imread(f"static/img/{filename}")
            
            output = remove(img)
            cv2.imwrite(f"static/output/{filename}", output)
        return {"inro":"sucess"}

# Download excel file
@app.route('/downloadX')
def downloadX():
    # target = 'static/output'
    # stream = BytesIO()
    # with ZipFile(stream, 'w') as zf:
    #     for filename in glob(os.path.join(target, '*')):
    #         zf.write(filename, os.path.basename(filename))
    # stream.seek(0)

    # return send_file(
    #     stream,
    #     as_attachment=True,
    #     attachment_filename='xlsx_archive.zip'
    # )
    timestr = time.strftime("%Y%m%d-%H%M%S")
    fileName = "image2table{}.zip".format(timestr)
    memory_file = BytesIO()
    file_path = 'static/output'
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(file_path):
            for filename in files:
                zipf.write(os.path.join(root, filename))
    memory_file.seek(0)
    return send_file(memory_file,
                     attachment_filename=fileName,
                     as_attachment=True)
# Download xml file
@app.route('/downloadC')
def downloadC():
    # return send_file(rf'static\downloadData\{variable}.xml', as_attachment=True)
    target = 'static/output'

    stream = BytesIO()
    with ZipFile(stream, 'w') as zf:
        for file in glob(os.path.join(target, '*.xml')):
            zf.write(file, os.path.basename(file))
    stream.seek(0)

    return send_file(
        stream,
        as_attachment=True,
        attachment_filename='xml_archive.zip'
    )    

if __name__ == "__main__":
    app.run(debug=True)
