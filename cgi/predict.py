#!/Users/randy/anaconda3/bin/python

import cgitb; cgitb.enable()
import cv2 as cv
import numpy as np
from keras import backend as K
K.clear_session()
from keras.models import model_from_json
json_file = open("ia_model.json", 'r')
loaded_model_json = json_file.read()
json_file.close()
model = model_from_json(loaded_model_json)
model.load_weights("ia_model.h5")

#import matplotlib.pyplot as plt
#https://github.com/Tes3awy/OpenCV-3.2.0-Compiling-on-Raspberry-Pi

import cgi
#import base64
import os

fs = cgi.FieldStorage()



print ("Content-Type: text/html")
#print ("Content-Type:application/octet-stream")
print ()
#for key in fs.keys():
	#imagem = fs[key].value
#	print (key+" = <img src='data:image/jpg;"+fs[key].value+"'/>")
    #print ("%s = <img src='%s'/>" % (key, fs[key].value))

"""   Prever o resultado """
#imagem = fs.getvalue('imagem')
image = fs['imagem'].value
#image = image.replace("data:image/jpeg;base64,", "b")
imagem = cv.imdecode(np.fromstring(image,dtype=np.uint8),0)

im = cv.resize(imagem, (28,28))

print('<p>'+ image +'</p>')
print('<p>imagem lida</p>'+ cv.__version__)

#print("<img src='"+ image +"'/>")

#base64data = image.replace('data:image/jpeg;base64','').replace('data:image/png;base64','')

#my_buffer = buffer(base64data);
#image = cv2.imdecode(base64data, 0); #Image is now represented as Mat
#outBase64 =  cv2.imencode('.jpg', image).toString('base64')


#print('<img src=data:image/jpeg;base64,'+outBase64 + '>')
#print('<img src='+image+'/>')
"""
imgdata = base64.b64decode(image)
im1 = Image.open(io.BytesIO(imgdata))
image = cv2.cvtColor(numpy.array(im1), cv2.COLOR_BGR2RGB)
"""



#with open("number.jpg", "wb") as fh:
#    fh.write(base64.decodebytes(image))
#im = base64.decodestring(image)
#print('<p>teste: '+image+'</p>')
#print("<img src='"+ fs['imagem'].value +"'/>")
#cv2.imshow('gray_image',imagem)
#print("<p>Numero predicto:</p>")
#im = cv2.imdecode(image, 0)
"""
im = cv2.imread("/Users/randy/Downloads/number.jpg", 0)

im = cv2.resize(im, (28,28))
im = im.reshape(1,1,28,28)
result = model.predict_classes(im.reshape(1,1,28,28))
print("[result] {} may be {}".format(result[0], result[0].argmax()))
"""

#no permission to delete files
#os.remove("/Users/randy/Downloads/number.jpg")

#print ("""
#    This is my first CGI script
#    Hello, world!
#)"""
