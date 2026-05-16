function punanletter(letter) {
    var textBox = document.getElementById("txtBox");
    textBox.value += letter;
}

function huwasisa() {
    var textBox = document.getElementById("txtBox");
    textBox.value = textBox.value.slice(0, -1);
}

function huwastanan() {
    var textBox = document.getElementById("txtBox");
    textBox.value = "";
}