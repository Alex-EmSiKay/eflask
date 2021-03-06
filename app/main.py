from flask import Flask, render_template, request
import os
import psycopg2
import base64
import pyvips

DATABASE_URL = os.environ['DATABASE_URL']

conn = psycopg2.connect(DATABASE_URL, sslmode='allow')

app = Flask(__name__)


@app.route("/")
def home_view():
    return render_template("index.html")


# Loads a stitch from the DB


@app.route("/load")
def load():
    return call(request.args["id"])


# returns the preview svg for the ajax call


@app.route("/preview")
def preview():
    if len(request.args):
        fixed_lines = fix_lines(request.args)
        return render_template("stitches.svg", lines=fixed_lines[0], maxcols=fixed_lines[1], colour="#" + request.args["colour"], stitch_string="-".join(fixed_lines[2]))
    else:
        return ""


@app.route("/save")
def save():
    if len(request.args):
        fixed_lines = fix_lines(request.args)
        # Gets the code for the svg in a buffer
        svg_image = render_template(
            "stitches.svg", lines=fixed_lines[0], maxcols=fixed_lines[1], colour="#" + request.args["colour"])
        # Creating a pyvips Image object from the svg code
        png_image = pyvips.Image.thumbnail_buffer(
            bytes(svg_image, 'utf-8'), 200)
        # converting to png and saving to a buffer
        png_buffer = png_image.pngsave_buffer()
        with conn.cursor() as cur:
            cur.execute("INSERT INTO stitches (code, colour, title, thumbnail) VALUES (%s, %s, %s, %s) RETURNING id;",
                        (request.args["lines"], request.args["colour"], request.args["title"], png_buffer))
        conn.commit()
        new_id = cur.fetchone()
        return call(new_id, saved=True)


@app.route("/stitchlist")
def slist():
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM stitches;")
        data = cur.fetchall()
    thumbnails = [base64.b64encode(
        bytes(datum[4])).decode("utf-8") for datum in data]
    return render_template("list.html", data=data, thumbnails=thumbnails)

# 'Opens' the selected stitch in the previewer


def call(id, saved=False):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM stitches WHERE id = %s;", (id,))
        call_stitch = cur.fetchall()
    return render_template("index.html", data=call_stitch, saved=saved)

# 'swaps the Ks and Ps in odd lines'


def switch_input(l):
    transform = str.maketrans("KP", "PK")
    return [(v.translate(transform) if i % 2 == 1 else v[::-1]) for i, v in enumerate(l)]
    # for i in enumerate(l):
    #     if i % 2 == 1:
    #         l[i] = l[i].replace("K", "O")
    #         l[i] = l[i].replace("P", "K")
    #         l[i] = l[i].replace("O", "P")
    #     else:
    #         l[i] = l[i][::-1]

# Cleans up and transforms the code depending on the input mode


def fix_lines(arg):
    lines = arg["lines"].split("-")
    if len(lines) == 1:
        lines.append(lines[0])

    maxcols = max([len(line) for line in lines])
    # Repeats the row if only one is encodes, otherwise fills in the gaps in the stitchs with surrounding stitches
    while not len([item for sublist in lines for item in sublist]) == len(lines) * maxcols:
        for i in range(len(lines) - 1):
            if len(lines[i]) < len(lines[i+1]):
                for j in range(len(lines[i]), len(lines[i+1])):
                    lines[i] += lines[i+1][j]
            elif not i == 0 and len(lines[i]) < len(lines[i-1]):
                for j in range(len(lines[i]), len(lines[i-1])):
                    lines[i] += lines[i-1][j]
        if len(lines[-1]) < len(lines[-2]):
            for j in range(len(lines[-1]), len(lines[-2])):
                lines[-1] += lines[-2][j]
    # we need to return the version which is stitch-by-stitch for condensing
    by_stitch_lines = lines.copy()
    if "input" in arg:
        if (arg["input"] == "stitch"):
            lines = switch_input(lines)
            lines.reverse()
        else:
            by_stitch_lines.reverse()
            by_stitch_lines = switch_input(by_stitch_lines)
    if "reverse" in arg:
        if arg["reverse"] == "1":
            tform = str.maketrans("KP", "PK")
            lines = [v[::-1].translate(tform) for v in lines]
            # lines[i] = lines[i].replace("K", "O")
            # lines[i] = lines[i].replace("P", "K")
            # lines[i] = lines[i].replace("O", "P")
            # lines[i] = lines[i][::-1]
    return [lines, maxcols, by_stitch_lines]
