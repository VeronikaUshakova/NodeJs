const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const appPort = 3001;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.set("view engine", "pug");

app.listen(appPort, function () {
  console.log("Site available on http://localhost:" + appPort);
});

app.get("/", function (req, res) {
  let contentFiles = [];
  findFiles("./content", "./content".length - 1, contentFiles);
  let information = informationFile(contentFiles, false);
  let informationDetailed = informationFile(contentFiles, true);
  let log = { ...information.log };
  let logDetailed = { ...informationDetailed.log };
  res.render("index", {
    title: "Node.js",
    javascript: informationDetailed.javascript,
    typescript: informationDetailed.typescript,
    definition: informationDetailed.definition,
    configuration: informationDetailed.configuration,
    image: information.image,
    imageDetailed: informationDetailed.image,
    log: log,
    logDetailed: logDetailed,
    other: informationDetailed.other,
  });
});

app.get("/*", function (req, res) {
  const path = `./content${res.req.url}`;
  res.download(path);
});

app.delete("/*", function (req, res) {
  const path = `./content${res.req.url}`;
  fs.unlinkSync(path);
  res.send('OK');
});

function findFiles(dir, length, array) {
  let files = fs.readdirSync(dir);
  for (let x in files) {
    let next = path.join(dir, files[x]);
    if (fs.lstatSync(next).isDirectory() == true) {
      findFiles(next, length, array);
    } else {
      array.push(next.slice(length, next.length));
    }
  }
}

function informationImage(elem, information, check) {
  if (elem.match(/(_|-)(x[0-9]+)/gi) && check === true) {
    let scale = elem.match(/(_|-)(x[0-9]+)/gi);
    scale[scale.length - 1] = scale[scale.length - 1].slice(2, scale[0].length);
    let imagePath = elem + " ( Retina, scale=" + scale + " )";
    information.image.push(imagePath);
  } else {
    information.image.push(elem);
  }
}

function informationLogDetailed(elem, information, i, check) {
  let logPath = elem;
  if (elem.match(/stdout/giu) && check === true) {
    logPath += " ( stdout )";
  } else if (elem.match(/stderr/giu) && check === true) {
    logPath += " ( stderr )";
  }
  information.log[i].push(logPath);
}

function informationLog(elem, information, check) {
  let date = elem.match(/[0-9]{8}\//gi);
  let nameFolder = date[0].slice(0, 4) + "-" + date[0].slice(4, 6);
  let checkAddFile = false;
  let logPath = elem;
  if (Object.keys(information.log).length !== 0) {
    for (let i in information.log) {
      if (i === nameFolder) {
        informationLogDetailed(elem, information, nameFolder, check);
        checkAddFile = true;
      }
    }
    if (checkAddFile === false) {
      information.log[nameFolder] = [];
      informationLogDetailed(elem, information, nameFolder, check);
    }
  } else {
    information.log[nameFolder] = [];
    informationLogDetailed(elem, information, nameFolder, check);
  }
}

function informationFile(array, check) {
  let information = {
    javascript: [],
    typescript: [],
    definition: [],
    configuration: [],
    image: [],
    log: [],
    other: [],
  };
  for (let i = 0; i < array.length; i++) {
    if (array[i].match(/(.*\.jsx?)$/giu)) {
      information.javascript.push(array[i]);
    } else if (array[i].match(/(.*[^d]\.tsx?)$/giu)) {
      information.typescript.push(array[i]);
    } else if (array[i].match(/(.*\.d\.ts)$/giu)) {
      information.definition.push(array[i]);
    } else if (array[i].match(/(.*\.(json|yaml|yml))$/giu)) {
      information.configuration.push(array[i]);
    } else if (array[i].match(/(.*\.(jpe?g|png|svg|gif))$/giu)) {
      informationImage(array[i], information, check);
    } else if (array[i].match(/(logs\/[0-9]{8}\/.*\.log)$/giu)) {
      informationLog(array[i], information, check);
    } else {
      information.other.push(array[i]);
    }
  }
  return information;
}
