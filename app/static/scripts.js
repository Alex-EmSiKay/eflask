function update(text) {
    //console.log(text)
    updateText = document.getElementById("update_text");
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            updateText.innerHTML = ajax.responseText;
        }
    }
    if (text == "") {
        ajax.open("GET", "preview", true);
        //console.log("Set no args request");
    }
    else {
        text = text.trimStart().toUpperCase();
        text = text.replace(/[^KP\n]/, "");
        inputText = document.getElementById("input_text");
        inputText.value = text;
        //updateText.innerHTML = text;
        lines = text.replace(/\n/g, "-");
        //console.log(lines);
        ajax.open("GET", "preview?lines=" + lines.replace(/-$/, "") + "&colour=" + document.getElementById("color_choice").value, true);
    }

    ajax.send();
}