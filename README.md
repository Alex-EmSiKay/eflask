# Online Knitting Stitch Viewer
#### Video Demo:  <URL HERE>
#### Description:
This is a python web app running in Flask, hosted on Heroku with a Postgres DB.
The function is to enable users to input a sequence of knitting stitches and have visual preview and pattern information presented to them. There is also the ability to save and load previously encoded stitches.
https://eflask-mck-app.herokuapp.com/

**app/static/scripts.js**
Contains all of the user interaction scripts and some of the info-processing that can be done on the client end.

The main parts are handling the ajax call to return the stich preview and the processing of the raw stich code into something more user-readable.

**app/static/styles.css**
Some basic style info for rendering the html

**app/templates/bottom.svg, edge.svg, knit.svg, loop.svg, purl.svg**
These files do not directly interact with the code but are included for posterity, since they form the building blocks for the template "stiches.svg"

**app/templates/index.html**
The home page and place where you can 'build' a stitch

**app/templates/layout.html**
Contains the headers and title for the other templates, including the links to the style and script files.

**app/templates/list.html**
a list of all the saved stiches

**app/templates/stitches.svg**
a template which takes an array of kitting rows encoded as strings and returns a representation of the final stitch by building it in a grid like way.

**app/main.py**
The main Flask application, containing the routes and a small number of additional functions the help streamline the code.

**Procfile**
A file to tell Heroku how to run the app

**Procfile.windows**
A MS Windows compatible procfile, for running on a local PC

**requirements.txt**
A list of python modules required for the heroku build.

**runtime.txt**
Gives the required version of Python for the heroku build

**wsgi.py**
heroku actually runs this script to start the app.

