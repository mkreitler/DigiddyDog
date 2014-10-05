
window.onload = function () {
    // TODO:: Do your initialization job

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName === "back") {
            tizen.application.getCurrentApplication().exit();
        }
    });

    // Sample code
//    var textbox = document.querySelector('.contents'),
//        context = tj.Graphics.lock();
//    textbox.addEventListener("click", function(){
//    	var box = document.querySelector('#textbox');
//    	box.innerHTML = box.innerHTML === "Basic" ? "Sample" : "Basic";
//    });
    
    tj.DD = new tj.DigiddyDog();
};

