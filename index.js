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
let User = require("./models/user.js");
let Frequent = require("./models/frequent.js");

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

app.post("/user-logged", (req, res) => {
  console.log("req.body.auth", req.body.auth);
  User.find({ auth: req.body.auth }, (err, answer) => {
    if (err) {
      console.log("login database lookup error");
    } else {
      console.log("answer ul", answer[0], typeof answer);
      if (answer[0]) {
        //authorized
        res.status(200).send({ logged: true });
      } else {
        //unauthorized
        res
          .status(401) // HTTP status 404: Unauthorized
          .send("Not logged in ");
      }
    }
  });
});

app.post("/login", (req, res) => {
  // console.log("login req", req);
  const login = req.body;
  // console.log("login", login, typeof login);
  User.find(
    { username: login.username, password: login.password },
    (err, answer) => {
      if (err) {
        console.log("login database lookup error");
      } else {
        console.log("answer:", answer[0], typeof answer);
        if (answer[0]) {
          //authorized
          current = login.username;
          console.log("current user:", current);
          const millis = Date.now();
          const seconds = Math.floor(millis / 1000);
          const random = Math.random();
          const userToken = Math.floor(seconds * random);
          User.updateOne(
            { username: login.username },
            { auth: userToken },
            (err, res) => {
              if (err) {
                console.log("err", err);
              } else {
                console.log("res", res);
              }
            }
          );

          res.json({ success: true, userToken });
        } else {
          console.log("login failed");
          //unauthorized
          res
            .status(401) // HTTP status 404: NotFound
            .send("Login Failed");
        }
      }
    }
  );
});

// app.get("/logout", (req, res) => {
//   current = "";
//   console.log("logout");
//   res.json({ success: true });
// });

app.post("/logout", (req, res) => {
  console.log("logout req.body.auth", req.body.auth);
  User.find({ auth: req.body.auth }, (err, answer) => {
    if (err) {
      console.log("logout database lookup error");
    } else {
      console.log("logout answer ul", answer[0], typeof answer);
      if (answer[0]) {
        //authorized
        User.updateOne({ auth: req.body.auth }, { auth: 0 }, (err, res) => {
          if (err) {
            console.log("err", err);
          } else {
            console.log("res", res);
          }
        });
        res.status(200).send({ loggedOut: true });
      } else {
        //unauthorized
        res
          .status(401) // HTTP status 404: Unauthorized
          .send("Not logged out ");
      }
    }
  });
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

  fs.readFile("./translator/100t.txt", "utf8", (err, file) => {
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

app.post("/frequency/add", (req, res) => {
  console.log("freq add", req.body.id, req.body.word);
  try {
    Frequent.create({
      id: req.body.id,
      word: req.body.word
    });
    console.log("frequency added");
    res.send("FREQUENCY_ADD_SUCCESS");
  } catch (e) {
    console.log("frequency err", e);
    res.send("FREQUENCY_ADD_FAIL");
  }
});

app.post("/frequency/addArray", (req, res) => {
  console.log("freq add array", req.body.array);
  try {
    let id = 0;
    const array = req.body.array;
    Frequent.remove({}, (err, suc) => {
      if (err) {
        console.log("error deleting", err);
      } else {
        console.log("suc", suc);

        array.forEach(word => {
          id++;
          console.log("id", id, word);
          Frequent.create({ id: id, word: word }, (err, res) => {
            if (err) {
              console.log("err", err);
            } else {
              console.log("res", res);
            }
          });
        });
      }
    });
    console.log(`frequencies ${id} added`);

    res.send("FREQUENCY_ADD_SUCCESS");
  } catch (e) {
    console.log("frequency err", e);
    res.send("FREQUENCY_ADD_FAIL");
  }
});

app.listen(8000);
