// Updates the visual preview of the stitch every time the input changes
function update() {
    //console.log(text)
    text = document.getElementById('input_text').value
    updateText = document.getElementById("update_text");
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            if (ajax.responseText != "") {
                updateText.innerHTML = ajax.responseText;
                // The following lines set up and send the cleaned up stitch info to be rendered in the condensed pattern form
                var condlines = []
                document.getElementById("rendered").value.split("-").every((val) => condlines.push(condense(val.split(""), 1, 's')));
                condlines = condense(condlines, 1, 'r');
                document.getElementById("cond").innerHTML = render(condlines);
            }
        }
    }
    // makes sure nothing is returned if the input textarea is empty
    if (text == "") {
        ajax.open("GET", "preview", true);
    }
    else {
        // restricting the textarea to only uppercase 'K' and 'P', while still allowing to type lowercase.
        text = text.trimStart().toUpperCase();
        text = text.replace(/[^KP\n]/, "");
        inputText = document.getElementById("input_text");
        inputText.value = text;

        //preparing and sending the info to get the svg of the stich preview
        lines = text.replace(/\n/g, "-");
        //pull input mode
        input_mode = get_input();
        ajax.open("GET", "preview?lines=" + lines.replace(/-$/, "") + "&colour=" + document.getElementById("color_choice").value.replace("#", "") + "&reverse=" + document.getElementById("show_reverse").value + "&input=" + input_mode, true);
    }

    ajax.send();
}

// manually reading the state of the radio input to be used elsewhere
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

// when the input method changes, this does the necessary transformations to the input textarea to switch to the other mode
function switch_input() {
    var in_text = document.getElementById('input_text').value;
    var in_lines = in_text.trim().split("\n");
    var dir = 0;
    var inp = get_input();
    if (inp == "result" && in_lines.length % 2 == 0) {
        dir = 1;
    }
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
    if (inp == "result") {
        document.getElementById("explain").innerHTML = "The sequence of K's and P's correspond left-to-right, top-to-bottom with the visible grid of stitches on the final result";
    }
    else {
        document.getElementById("explain").innerHTML = "The sequence of stiches and new rows one would have to knit in order to achieve the final result"
    }
}

//reads the state of the page and sends it to the app to be saved in the DB, note the thumbnail processing is done on the server side
function save() {
    if (document.getElementById("title").value == "") {
        alert("Stitch Title must not be blank!");
        return
    }
    if (document.getElementById("input_text").value == "") {
        alert("There needs to be some stiches added first!");
        return
    }
    if (get_input() == "stitch") {
        switch_input()
    }
    window.location.replace("save?lines=" + document.getElementById("input_text").value.replace(/\n/g, "-") + "&colour=" + document.getElementById("color_choice").value.replace("#", "") + "&title=" + document.getElementById("title").value);
}

// This functions reads the input code and identifies any repetitions, systematically condensing the information through recurrence
function condense(arr, depth, type) {
    var cond_array = []
    var proc = 0
    var count = 0;
    while (proc < arr.length) {
        //if the last element has been reached, ad it and move on
        if (proc == arr.length - 1) {
            cond_array.push([1, arr.slice(proc, proc + 1), type]);
            break;
        }
        //counts how many times each slice occurs in succession. Depending on how deep we are, it looks at larger slices
        while (arrayEquals(arr.slice(proc, proc + depth), arr.slice(proc + depth * (count + 1), proc + depth * (count + 2)))) {
            if (proc + count < arr.length - 1) {
                count++;
            }
            else {
                break;
            }
        }
        // add the info to the new array, records the amount already looked at and resets the count
        cond_array.push([count + 1, arr.slice(proc, proc + depth), type]);
        proc = proc + depth * (count + 1);
        count = 0;
    }
    // If we can go deeper, then run the process again
    if (depth < Math.floor(arr.length / 2)) {
        return condense(cond_array, depth + 1, type);
    }
    else {
        return cond_array;
    }
}
// found function for array equality. Source "https://masteringjs.io/tutorials/fundamentals/compare-arrays" with a few adjustments
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => {
            if (Array.isArray(val)) {
                return arrayEquals(val, b[index]);
            }
            else {
                return val === b[index];
            }
        }
        );
}

//reads out the info in the condensed form and renders it to the user
function render(l) {
    var s = "";
    for (var i = 0; i < l.length; i++) {
        //the somewhat redundant nature of the condensing means we need to catch some edge cases,
        //such as going nested '1's or arrays of single element arrays
        if (l[i].length < 2) {
            return render(l[i])
        }
        if (Array.isArray(l[i][0])) {
            return render(l[i])
        }
        // the base case, where there is a given value to return
        if (l[i][1][0] == "K" || l[i][1][0] == "P") {
            s = s + l[i][1][0]
        }
        // otherwise, we follow the branch down
        else {
            if (l[i][2] == 'r') {
                //this conditional only adds brackets to blocks of rowswhere they are not superfluous
                if (l[i][1].length > 1 && l[i][0] > 1) {
                    s = s + `[${render(l[i][1]).slice(0, -4)}]<br>`
                }
                else {
                    s = s + `${render(l[i][1])}<br>`;
                }
            }
            //this conditional only adds brackets to stitches where they are not superfluous
            else {
                if (l[i][0] > 1) {
                    s = s + "[" + render(l[i][1]) + "]";
                }
                else {
                    s = s + render(l[i][1]);
                }
            }
        }
        //catches the occasional case of [['K']]
        if (l[i][0] > 1 && l[i][2] == 's') {
            s = s + String(l[i][0]);
        }
        //some logic to message for repeated rows
        if (l[i][0] > 1 && l[i][2] == 'r' && !(l[i][1].length > 1)) {
            s = s + `Repeat the previous ${l[i][1].length} row(s) ${l[i][0] - 1} more time(s)<br>`;
        }
        if (l[i][1].length > 1 && l[i][0] > 1 && l[i][2] == 'r') {
            s = s + `Repeat this block ${l[i][0] - 1} more time(s)<br>`;
        }
    }
    return s.replace(/<br><br>/g, "<br>")
}

//copies the condensed form for use elsewhere.
function copy_rendered() {
    var copyText = document.getElementById("cond").innerHTML.replace(/<br>/g, "\n");
    navigator.clipboard.writeText(copyText);
}