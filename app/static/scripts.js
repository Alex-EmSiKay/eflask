function update() {
    //console.log(text)
    text = document.getElementById('input_text').value
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
        //pull input mode
        input_mode = get_input();
        ajax.open("GET", "preview?lines=" + lines.replace(/-$/, "") + "&colour=" + document.getElementById("color_choice").value.replace("#", "") + "&reverse=" + document.getElementById("show_reverse").value + "&input=" + input_mode, true);
    }

    ajax.send();
}

function get_input() {
    var ele = document.getElementsByTagName('input');
    for (i = 0; i < ele.length; i++) {
        if (ele[i].type == "radio") {
            if (ele[i].checked) {
                return ele[i].value;
            }
        }
    }
}

function switch_input() {
    var in_text = document.getElementById('input_text').value;
    var in_lines = in_text.split("\n");
    var dir = 0;
    var inp = get_input();
    if (inp == "result") {
        dir = 1;
    }
    //console.log(dir);
    for (var i = 0; i < in_lines.length; i++) {
        if (i % 2 == (in_lines.length + dir) % 2) {
            in_lines[i] = in_lines[i].replace(/K/g, "O");
            in_lines[i] = in_lines[i].replace(/P/g, "K");
            in_lines[i] = in_lines[i].replace(/O/g, "P");
        }
        if (i % 2 != (in_lines.length + dir) % 2) {
            var split_string = in_lines[i].split("");
            var reverse_array = split_string.reverse();
            in_lines[i] = reverse_array.join("")
        }
    }
    in_lines = in_lines.reverse();
    document.getElementById('input_text').value = in_lines.join("\n")
}