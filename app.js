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

//Check for db errors
db.on("error", err => {
  console.log("err", err);
});

//init app
const app = express();

//bring in Models
let Article = require("./models/article.js");
let User = require("./models/user.js");
let Geneva = require("./models/geneva.js");

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

app.get("/add/:name/:code", (req, res) => {
  console.log(req.params);
  // console.log(req.query);

  const name = req.params.name;
  const code = req.params.code;
  let previousText = "";

  fs.readFile("list.txt", "utf8", (err, file) => {
    if (err) {
      fs.writeFile("list.txt", "", err => {
        if (err) {
          console.log("error creating database file", err);
        } else {
          console.log("database file created");
        }
      });

      readFile(name, code);
    } else {
      readFile(name, code);
    }
  });

  res.send("Saved bike number: " + name + ", with code: " + code);
});

app.get("/get-all", (req, res) => {
  //res.send("Hello World");
  fs.readFile("list.txt", "utf8", (err, file) => {
    if (err) {
      console.log("There is no database file.", err);
      res.send("There is no database file.");
    } else {
      console.log("get-all > I got file");

      res.send(file);
    }
  });
});

app.get("/get/:id", (req, res) => {
  console.log(req.params);

  fs.readFile("list.txt", "utf8", (err, file) => {
    if (err) {
      console.log(err);
    } else {
      console.log("get id > I got file");
      const object = JSON.parse(file);
      res.send(object[req.params.id]);
    }
  });
});

app.get("/delete/:id", (req, res) => {
  console.log(req.params);

  fs.readFile("list.txt", "utf8", (err, file) => {
    if (err) {
      console.log(err);
    } else {
      console.log("delete > id I got file");

      let object = JSON.parse(file);
      let newObject = JSON.parse(file);
      console.log("req.params.id", req.params.id);
      delete newObject[req.params.id];
      console.log("object", object, newObject);

      if (JSON.stringify(object) !== JSON.stringify(newObject)) {
        res.send("deleted all pairs with name " + req.params.id);

        fs.writeFile("list.txt", JSON.stringify(newObject), err => {
          if (err) {
            console.log(err);
          } else {
            console.log("file saved");
          }
        });
      } else {
        res.send("nothing to delete");
      }
    }
  });
});

//home route
app.get("/articles/:page", (req, res) => {
  console.log("read article:", req.params.page);

  Article.find({ page: req.params.page }, (err, articles) => {
    console.log("articles[0]", articles[0]);
    if (err) {
      console.log(err);
    } else {
      try {
        res.send(JSON.stringify(articles[0]));
      } catch (e) {
        res.send("api error");
      }
    }
  });
});

app.post("/articles/save/p", (req, res) => {
  console.log("body", req.body.page);

  if (!req.body || Object.keys(req.body).length === 0 || !req.body.page) {
    res.status(404).send("empty page");
  }

  console.log(
    "body",
    req.body,
    "save article:",
    req.body.page,
    "paragraph:",
    req.body.paragraphId,
    "text:",
    req.body.text
  );

  Article.find({ page: req.body.page }, (err, article) => {
    if (err) {
      console.log(err);
    } else {
      try {
        console.log("article", article);
        const paragraphs = article[0]["_doc"].paragraphs;
        console.log("para", paragraphs);
        paragraphs[req.body.paragraphId].text = req.body.text;

        console.log("pars:", paragraphs, req.body.page);

        Article.update(
          { page: req.body.page },
          { $set: { paragraphs: paragraphs } },
          { new: true }
        ).then(() => {
          Article.findOne({ page: req.body.page }).then(result => {
            console.log("result", result);
          });
          res.status(200).send("edit paragraph successfull");
        });
      } catch (e) {
        console.log("err", e);
      }
    }
  });
});

app.post("/articles/save/ps", (req, res) => {
  console.log("body", req.body.page);

  if (!req.body || Object.keys(req.body).length === 0 || !req.body.page) {
    res.status(404).send("empty page");
  }

  const parsedHtml = JSON.parse(req.body.parsedHtmlJson);
  const blockId = req.body.blockId;

  console.log(
    "save article:",
    req.body.page,
    "\nblock:",
    req.body.blockId,
    "\n\nparsedHtmlJson:",
    req.body.parsedHtmlJson,
    "\n\nparsedHtml",
    parsedHtml
  );

  console.log("req.body.parsedHtmlJson", req.body.parsedHtmlJson);

  Article.find({ page: req.body.page }, (err, article) => {
    if (err) {
      console.log(err);
    } else {
      try {
        console.log("article", article);
        let blocks = article[0]["_doc"].blocks;
        console.log("blocks 1", blocks);

        blocks[blockId] = JSON.parse(req.body.parsedHtmlJson);

        console.log("blocks 2", blocks);

        Article.updateOne(
          { page: req.body.page },
          { $set: { blocks: blocks } },
          { new: true }
        ).then(() => {
          Article.findOne({ page: req.body.page }).then(result => {
            console.log("result", result);
          });
          res.status(200).send("edit block successfull");
        });
      } catch (e) {
        console.log("err", e);
      }
    }
  });
});

app.post(
  "/articles/changeType/:page/paragraph/:paragraphId/:newType",
  (req, res) => {
    Article.find({ page: req.params.page }, (err, article) => {
      if (err) {
        console.log(err);
      } else {
        const paragraphs = article[0]["_doc"].paragraphs;

        paragraphs[req.params.paragraphId].type = req.params.newType;

        console.log("pars:", paragraphs, req.params.page);

        Article.update(
          { page: req.params.page },
          { $set: { paragraphs: paragraphs } },
          { new: true }
        ).then(() => {
          Article.findOne({ page: req.params.page }).then(result => {
            console.log("result", result);
          });
          res.status(200).send("edit paragraph successfull");
        });
      }
    });
  }
);

app.post("/articles/save/:page/newBlock", (req, res) => {
  Article.find({ page: req.params.page }, (err, article) => {
    if (err) {
      console.log(err);
    } else {
      const blocks = article[0]["_doc"].blocks;

      blocks.push("");

      Article.update(
        { page: req.params.page },
        { $set: { blocks: blocks } },
        { new: true }
      ).then(() => {
        res.status(200).send("add block successfull");
      });
    }
  });
});

app.post("/articles/delete/:page/block/:blockId", (req, res) => {
  Article.find({ page: req.params.page }, (err, article) => {
    if (err) {
      console.log(err);
    } else {
      const blocks = article[0]["_doc"].blocks;

      blocks.splice(req.params.blockId, 1);

      Article.update(
        { page: req.params.page },
        { $set: { blocks: blocks } },
        { new: true }
      ).then(() => {
        res.status(200).send("delete block successfull");
      });
    }
  });
});

app.get("/articles/remove/:id", (req, res) => {
  console.log("remove!", req.params.id);
  Article.deleteOne({ _id: req.params.id }, function(err) {
    if (err) return console.log(err);
    // deleted at most one tank document
  });
  res.send("delete successfull");
});

app.post("/articles/edit", (req, res) => {
  console.log("edit!", req.body.id);

  let article = {};
  article.title = req.body.title;
  article.author = "David 2";
  article.body = req.body.body;

  Article.update({ title: req.body.title }, article, function(err) {
    if (err) return console.log("DB edit err", err);
    console.log("updated");
  });
  res.status(200).send("edit successfull");
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
        console.log("answer", answer[0], typeof answer);
        if (answer[0]) {
          //authorized
          current = login.username;
          res.json({ success: true });
        } else {
          //unauthorized
          res
            .status(404) // HTTP status 404: NotFound
            .send("Not found");
        }
      }
    }
  );
});

app.get("/logout", (req, res) => {
  current = "";
  console.log("logout");
  res.json({ success: true });
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
          .status(404) // HTTP status 404: NotFound
          .send("Not found");
      }
    }
  });

  // if (current === "admin") {
  //   res.json({ logged: current });
  // } else {
  //   res
  //     .status(404) // HTTP status 404: NotFound
  //     .send("Not found");
  // }
});

app.get("/users", (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.log(err);
    } else {
      res.send(JSON.stringify(users));
    }
  });
});

app.get("/geneva", (req, res) => {
  console.log("guerying geneva");
  Geneva.find({}, (err, geneva) => {
    console.log("geneva", geneva);
    if (err) {
      console.log(err);
    } else {
      res.send(JSON.stringify(geneva));
    }
  });
});

//ass submit POST route
app.post("/articles/add", (req, res) => {
  console.log("articles/add", req.body.title);
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  //find if it exists already
  Article.find({ title: article.title }, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      console.log("found", articles);
      if (articles.length) {
        console.log("already exists");
        res.send("ALREADY_EXISTS");
      } else {
        article.save(err => {
          if (err) {
            console.log(err);
            return;
          } else {
            console.log("save");
            res.redirect("/");
          }
        });
      }
    }
  });
});

app.listen(8000);
