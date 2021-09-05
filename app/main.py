from flask import Flask, render_template, request
import os
import psycopg2

DATABASE_URL = os.environ['DATABASE_URL']

conn = psycopg2.connect(DATABASE_URL, sslmode='allow')

cur = conn.cursor()

app = Flask(__name__)


@app.route("/")
def home_view():
    cur.execute("SELECT * FROM test;")
    data = cur.fetchone()
    return render_template("index.html", data=data)


@app.route("/preview")
def preview():
    if len(request.args) > 0:
        lines = request.args["lines"].split("-")
        if len(lines) == 1:
            lines.append(lines[0])

        maxcols = max([len(line) for line in lines])
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
        # print(request.args["reverse"])
        if (request.args["input"] == "stitch"):
            for i in range(len(lines)):
                if i % 2 == 1:
                    lines[i] = lines[i].replace("K", "O")
                    lines[i] = lines[i].replace("P", "K")
                    lines[i] = lines[i].replace("O", "P")
                else:
                    lines[i] = lines[i][::-1]
            lines.reverse()
        if request.args["reverse"] == "1":
            for i in range(len(lines)):
                lines[i] = lines[i].replace("K", "O")
                lines[i] = lines[i].replace("P", "K")
                lines[i] = lines[i].replace("O", "P")
                lines[i] = lines[i][::-1]
        return render_template("stitches.svg", lines=lines, maxcols=maxcols, colour="#" + request.args["colour"])
    else:
        return ""
