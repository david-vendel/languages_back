const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/nodekb");
let db = mongoose.connection;

//Check connection
db.once("open", () => {
  console.log("Connected to MongoDb");
});

// mongoose.collections((err, result) => {
//   if (err) {
//     console.log("err", err);
//   } else {
//     console.log("result", result);
//   }
// });

//Check for db errors
db.on("error", err => {
  console.log("err", err);
});

//init app
const app = express();

//bring in Models
let Language = require("./models/language.js");
// let User = require("./models/user.js");

let current = "";

app.use("/public", express.static(path.join(__dirname, "static")));

var cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

//Body parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World");
  // res.sendFile(path.join(__dirname, "static", "index.html"));
});

readFile = (name, code) => {
  fs.readFile("list.txt", "utf8", (err, file) => {
    if (err) {
      console.log("err", err);
    } else {
      previousText = file;
      console.log("previous text", previousText);
      let object = {};
      if (previousText) {
        object = JSON.parse(previousText);
      }
      object[name] = code;
      console.log("object", object);
      console.log("red file to variable.");

      fs.writeFile("list.txt", JSON.stringify(object), err => {
        if (err) {
          console.log(err);
        } else {
          console.log("file saved");
        }
      });
    }
  });
};

app.get("/get/:id", (req, res) => {
  console.log("app get", req.params);

  fs.readFile("./../translator/100t.txt", "utf8", (err, file) => {
    if (err) {
      console.log(err);
    } else {
      console.log("get id > I got file");
      const filearr = file.split("\n");
      const ids = req.params.id.split(",");
      console.log("ids", ids);
      let response = [];
      ids.forEach(id => {
        console.log("id", id);
        console.log("filearr", filearr[id]);
        response.push(filearr[id].replace("\r", ""));
        console.log("id,", id, "response", response);
      });
      res.send(JSON.stringify(response));
    }
  });
});

//ass submit POST route
app.post("/languages/add", (req, res) => {
  console.log(
    "languages/add word:",
    req.body.word,
    "translation",
    req.body.translation
  );
  let language = new Language();
  //   language.word = req.body.word;
  //   language.translation = req.body.translation;

  console.log("language:", language);

  //find if it exists already
  Language.find({ word: req.body.word }, (err, languages) => {
    console.log("finding", req.body.word);
    if (err) {
      console.log("err", err);
    } else {
      console.log("found", languages, "len:", languages.length);
      if (languages.length) {
        console.log("already exists");
        res.send("ALREADY_EXISTS");
      } else {
        console.log("doesnt exist yet, i'll try to add");
        try {
          Language.create(
            {
              word: req.body.word,
              translation: req.body.translation
            } /*,
            (err, obj) => {
              if (err) {
                console.log("err", err);
              } else {
                console.log("obj", obj);
              }
            }*/
          );
          console.log("add should be success");
          res.send("ADDED");
        } catch (e) {
          console.log("e", e);
          res.send("NOT_ADDED");
        }
      }
    }
  });

  console.log("end find");
});

app.post("/languages/get-all", (req, res) => {
  Language.find({}, (err, languages) => {
    if (err) {
      console.log("err", err);
    } else {
      console.log("languages", languages);
      res.send(languages);
    }
  });
});

app.post("/languages/delete/:word", (req, res) => {
  console.log("removing", req.params.word);
  Language.deleteOne({ word: req.params.word }, err => {
    if (err) {
      console.log("err", err);
      res.send("NOT_DELETED");
    } else {
      console.log("deleted");
      res.send("DELETED_SUCCESSFULLY");
    }
  });
});

app.listen(8000);
