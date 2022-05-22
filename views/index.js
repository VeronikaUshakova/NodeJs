function deleteFile(url){
    let xhr = new XMLHttpRequest();
    xhr.open('DELETE', url);
    xhr.onload = function() {
        alert("OK");
    };     
    xhr.send();
    window.location.href = ""; 
}