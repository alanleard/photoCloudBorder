var win = Ti.UI.createWindow({});
var images = []

win.open();

getImageList({imageListURL:'http://dev2app.com/apps/photoCloudBorder/count.php', imageURL:'http://dev2app.com/apps/photoCloudBorder/photos/', callback:function(e){
    images = e.images;
    photoSuccess()
}});

function getImageList(params){
        if(params.imageListURL){
            var client = Ti.Network.createHTTPClient({
                 // function called when the response data is available
                 onload : function(e) {
                    
                   params.callback({images: loadImages({data:JSON.parse(this.responseText), imageURL:params.imageURL})});
                 },
                 // function called when an error occurs, including a timeout
                 onerror : function(e) {
                     Ti.API.debug(e.error);
                     alert('Oops!  We are unable to reach our Images online.');
                 },
                 timeout : 8000  // in milliseconds
             });
             // Prepare the connection.
             client.open("GET", params.imageListURL);
             // Send the request.
             client.send(); 
                    
        } else if (params.imageList){
            loadImages({data:params.imageList});
        } else {
            alert('No Images Provided.')
        }
    }
    
function loadImages(args){
    var remoteImageURLArr = [];
    
    //load image array
    var arr = args.data;
    
    //get the array length
    length = arr.length
    
    if(length ==0){
        alert('There are no remote images available.')
    }
    
    for (var i = 0; i<length; i++){
        
        var remoteImageURL = args.imageURL+arr[i];

        remoteImageURLArr.push(remoteImageURL);
    }
    return remoteImageURLArr;
}


function photoSuccess(e){
    var currentImage = 0;
    var overlayImage = Titanium.UI.createImageView({
        top:0,
        left:0, 
        right:0,
        bottom:0,
        touchEnabled:false,
        image:"backgroundLand.png"
    });

    
    var imageView = Ti.UI.createImageView({
        image:e?e.media:images[0],
        width:1200
        // heigth:Ti.Platform.displayCaps.platformHeight,
        // width:Ti.Platform.displayCaps.platformWidth

    });
    
    var zoomView = Ti.UI.createScrollView({
        contentHeight:'auto', 
        contentWidth:'auto',
        top:50,
        left:50,
        right:40, 
        bottom:35, 
        zoomScale:1.0, 
        minZoomScale:0.1, 
        maxZoomScale:5.0,
        backgroundColor:"red"
    });
    var photoView = Ti.UI.createImageView({
        bottom:0,
        width:958,
        height:718
    });
    
    var label = Ti.UI.createLabel({
        color:"#ffffff",
        bottom:10,
        right:50,
        text:"Test Text",
        font:{fontSize:50, fontFamily:"cochin"},
        textAlign:"right",
        width:"40%",
        height:'size',
        shadowColor:"#000000",
        shadowOffset:{x:2, y:2}
        
    });
    
     var textField = Ti.UI.createTextField({
        width:400,
        height:50,
        top:300,
        borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        visible:false,
        enabled:true,
        clearButtonMode:1
    });
    
    label.addEventListener('click', function(){
        textField.value = label.text;
        
        textField.show();
        textField.addEventListener('change', function(e){
            label.setText(e.value);
        })
        
        textField.addEventListener('return', function(e){
            label.setText(e.value);
            textField.hide();
        })
        
    })
//    
    zoomView.add(imageView);
    photoView.add(zoomView);
    photoView.add(overlayImage);
    photoView.add(label);
    win.add(photoView);
    win.add(textField);
    
    var save = Ti.UI.createButton({
        title:'Save',
        top:0,
        left:5,
        width:100,
        height:30,
        backgroundImage:'button.png',
        color:'#ffffff'
    });

    win.add(save);
    
    var sign = Ti.UI.createButton({
        title:'Sign',
        top:0,
        width:100,
        height:30,
        backgroundImage:'button.png',
        color:'#ffffff'
    });
   

    win.add(sign);
    
    var next = Ti.UI.createButton({
        title:'Next',
        top:0,
        right:5,
        width:80,
        height:30,
        zIndex:1000,
        backgroundImage:'button.png',
        color:'#ffffff'
    });

    win.add(next);
    
    var picture = Ti.UI.createButton({
        title:'Add Pic',
        top:0,
        right:100,
        width:80,
        height:30,
        zIndex:1000,
        backgroundImage:'button.png',
        color:'#ffffff'
    });

    win.add(picture);
    
    picture.addEventListener('click', selectImage);
    
    next.addEventListener('click', nextImage);
    
    function nextImage(){
        
        currentImage+=1
        if(!images[currentImage]){
            getImageList({imageListURL:'http://dev2app.com/apps/photoCloudBorder/count.php', imageURL:'http://dev2app.com/apps/photoCloudBorder/photos/', callback:function(e){
              if(e.images.length == (currentImage-1)){
                  currentImage = 0;
                  imageView.setImage(images[0]);
              } else {
                  nextImage();
              }
              
            }})   
        }
        imageView.setImage(images[currentImage]);

    };

    save.addEventListener('click', function(){
            
            
            var labelImage = photoView.toImage();
            Titanium.Media.saveToPhotoGallery(labelImage);
            

            var emailDialog = Ti.UI.createEmailDialog();
            emailDialog.barColor = '#300000';
            emailDialog.subject = 'Custom Label: '+label.text;
            emailDialog.toRecipients = ['info@222wine.com'];
            emailDialog.messageBody = '';
            emailDialog.addAttachment(labelImage);
            emailDialog.open();
            emailDialog.addEventListener('complete', function(x){
            
                if(x.success){
                    alert('Label sent!')
                }
            });
        
    });
    var color = "red";
    sign.addEventListener('click',signWrite); 
    sign.addEventListener('longpress', function(){
        if(color=="red"){
            color="black"
        } else {
            color="red"
        }
    })
    function signWrite(){
        sign.removeEventListener('click',signWrite);
        sign.title = 'Clear';
        sign.addEventListener('click', signErase);
        
        var Paint = require('ti.paint');

        var paintView = Paint.createPaintView({
            top:0, right:0, bottom:0, left:0,
            // strokeWidth (float), strokeColor (string), strokeAlpha (int, 0-255)
            strokeColor:color, strokeAlpha:255, strokeWidth:6,
            eraseMode:false
        });
        photoView.add(paintView);
        
        function signErase(){
            paintView.clear();
            photoView.remove(paintView);
            paintView = null;
            sign.removeEventListener('click', signErase);
            sign.title = 'Sign';
            sign.addEventListener('click',signWrite); 
        }
        
    };

}

function camera(){
    
Titanium.Media.showCamera({

    success:function(e){
        Titanium.Media.saveToPhotoGallery(e.media);
        photoSuccess(e)
    }
    ,
    cancel:selectImage,
    error:function(error)
    {
        var a = Titanium.UI.createAlertDialog({title:'Camera'});
        if (error.code == Titanium.Media.NO_CAMERA)
        {
            a.setMessage('Sorry, you need a camera.');
        }
        else
        {
            a.setMessage('Unexpected error: ' + error.code);
        }
        a.show();
    },
    mediaTypes:Ti.Media.MEDIA_TYPE_PHOTO,
    autohide:true
    });
};

function gallery(){
    Titanium.Media.openPhotoGallery({

    success:photoSuccess
    ,
    cancel:function()
    {
        //selectImage();
    },
    error:function(error)
    {
        var a = Titanium.UI.createAlertDialog({title:'Camera'});
        
            a.setMessage('Unexpected error: ' + error.code);
        
        a.show();
    },
    mediaTypes:Ti.Media.MEDIA_TYPE_PHOTO,
    autohide:true 
    });
};

function selectImage(){
    if(win.children){
        for(var i = 0, l = win.children.length; l>i; l--){
            win.remove(win.children[l-1]);
        }
    }
    if(Ti.Media.isCameraSupported){
        var dialog = Ti.UI.createOptionDialog({
            title: "Let's get a photo!",
            options:['Snap a Photo!', 'Image Gallery', 'Cancel'],
            buttonNames: ['Snap a Photo!', 'Image Gallery' ],
            cancel:2
        })
        dialog.show();
            
        dialog.addEventListener('click', function(e){
            switch(e.index)
            {
            case 0:
                camera();
              break;
            case 1:
                gallery();
              break;
            case 2:

            }
        });
    } else {
        gallery();
    }
}


