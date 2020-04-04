const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const {
  PAIR_EDIT,
  TRANSLATE_ONE,
  LOG_USER_ACTION,
  USER_PROGRESS_GET_TWENTY_FOUR,
  USER_WORD_FLAG
} = require("./endpoints");
require("dotenv").config();
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

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
let Pair = require("./models/pair.js");
let Log = require("./models/log.js");

function parseHrtimeToSeconds(hrtime) {
  var seconds = (hrtime[0] + hrtime[1] / 1e9).toFixed(3);
  return seconds;
}

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

app.post("/signup", (req, res) => {
  // console.log("login req", req);
  const signup = req.body;
  console.log("signup", signup, typeof signup);
  User.find({ username: signup.username }, (err, answer) => {
    if (err) {
      console.log("signup > username find > database lookup error");
    } else {
      console.log("answer:", answer, answer[0], typeof answer);
      if (!Array.isArray(answer)) {
        console.log("signup failed");
        //unauthorized
        res
          .status(401) // HTTP status 404: NotFound
          .send("Signup Failed (users DB corrupted)");
      } else if (answer[0]) {
        // already exists
        console.log("user", signup.username, "already exists");
        res.status(303).send("USERNAME_ALREADY_EXISTS");
      } else {
        //can create
        current = signup.username;
        console.log("current user:", current);
        const millis = Date.now();
        const seconds = Math.floor(millis / 1000);
        const random = Math.random();
        const userToken = Math.floor(seconds * random);
        User.create(
          {
            username: signup.username,
            email: signup.email,
            password: signup.password,
            fromLanguage: "en",
            toLanguage: "fr",
            auth: userToken
          },
          (err, resp) => {
            if (err) {
              console.log("err", err);
              res
                .status(401) // HTTP status 404: NotFound
                .send("Signup Failed");
            } else {
              console.log("res", res);
              //res.json({ success: true, userToken });
              res.status(200).send({ success: true, userToken: userToken });
            }
          }
        );
      }
    }
  });
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

const getToFrom = async username => {
  console.time("getToFrom", username);

  return User.findOne({ username: username }, (err, suc) => {
    if (err) {
      console.log("err", err);
      res.send("LANGUAGE_getToFrom_FAIL");
      return { toLanguage: toLanguage, fromLanguage: fromLanguage };
    } else {
      console.log("LANGUAGE_getToFrom_SUCCESS", suc);
      console.timeEnd("getToFrom");

      return { toLanguage: suc.toLanguage, fromLanguage: suc.fromLanguage };
    }
  });
};

app.get("/get/:username/:count", async (req, res) => {
  const COUNT = 50;
  console.time("get");
  var startTime = process.hrtime();

  console.log("app get", req.params);

  console.log("get id > I got file");

  console.log("req.params.count", req.params.count);
  let count =
    req.params.count === "undefined"
      ? 4
      : req.params.count
      ? parseInt(req.params.count)
      : 4;

  let localRes = null;
  const promise = new Promise(resolve => {
    localRes = resolve;
  });

  const username = req.params.username;
  const toFrom = await getToFrom(username); //here could be some optimalization, to receive toFrom from React if it has it
  console.log("toFrom", toFrom);

  let toLanguage = "fr";
  let fromLanguage = "en";
  if (toFrom) {
    toLanguage = toFrom.toLanguage ? toFrom.toLanguage : "fr";
    fromLanguage = toFrom.fromLanguage ? toFrom.fromLanguage : "en";
  }
  console.log("toLanguage", toLanguage);

  console.log("Start");
  let randomsArr = [];
  let index = 0;

  const userFound = await User.findOne(
    { username: username },
    (userErr, userFound) => {
      if (userErr) {
        console.log("user find err", userErr);
        res.status(500).send("USER FIND FAIL");
      } else {
        return userFound;
      }
    }
  );

  const flaggedIds = [];
  if (userFound.flaggedWords && userFound.flaggedWords.length > 0) {
    userFound.flaggedWords.forEach(f => {
      if (f.language === fromLanguage) {
        flaggedIds.push(f.id);
      }
    });
  }

  console.log("flaggedIds", flaggedIds);

  while (randomsArr.length < count) {
    cycleLimiter = 0;
    let randomCandidate = Math.floor(Math.random() * COUNT);
    while (
      cycleLimiter < 100 &&
      (randomsArr.includes(randomCandidate.toString(10)) ||
        flaggedIds.includes(randomCandidate))
    ) {
      if (cycleLimiter >= 98) {
        console.log("CYCLE LIMITED", cycleLimiter);
      }
      cycleLimiter += 1;
      randomCandidate = Math.floor(Math.random() * COUNT);
    }
    console.log("randomCandidate", randomCandidate);
    if (!randomsArr.includes(randomCandidate.toString(10))) {
      randomsArr.push(randomCandidate.toString(10));
    }
    console.log("logic", randomsArr.includes(randomCandidate.toString(10)));
    console.log("randomsArr", randomsArr);
    console.log("randomCandidate.toString(10)", randomCandidate.toString(10));
  }

  console.log("randomsArr", randomsArr);

  //todo need to get more words

  // getting count of word pairs for lesson request
  await Pair.find({
    toLanguage: toLanguage,
    fromLanguage: fromLanguage
    // display: true
    //translation: { $ne: "" },
    //word: { $ne: "" }
  })
    .where("id")
    .in(randomsArr)
    .exec((err, found) => {
      if (err) {
        console.log("foundMore err");
        res.status(500).send("PAIR_FIND_ERR");
      } else {
        console.log("found", found);
        // response.push({
        //   id: found.id,
        //   word: found.word,
        //   translation: found.translation
        // });
        localRes();
        const response = found;

        console.log("End");

        console.log("sendd response", response);
        console.timeEnd("get");

        var elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));
        console.log("It takes " + elapsedSeconds + "seconds");

        res.status(200).send({ pairs: response, lookupTime: elapsedSeconds });
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

app.post("/frequencies/get-all", (req, res) => {
  Frequent.find({}, (err, frequencies) => {
    if (err) {
      console.log("err", err);
    } else {
      console.log("frequencies", frequencies);
      res.send(frequencies);
    }
  });
});

app.post("/pairs/get-all", async (req, res) => {
  const username = req.body.username;
  const { toLanguage, fromLanguage } = await getToFrom(username); //here could be some optimalization, to receive toFrom from React if it has it
  console.log("toLanguage", toLanguage);

  Pair.find(
    { toLanguage: toLanguage, fromLanguage: fromLanguage },
    null,
    { sort: { id: 1 } },
    (err, pairs) => {
      if (err) {
        console.log("err", err);
      } else {
        console.log("pairs", pairs);
        res.send(pairs);
      }
    }
  );
});

const translateThisWord = async (id, word, fromLanguage, toLanguage) => {
  let url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
  url += "&q=" + encodeURI(word);
  url += `&source=${fromLanguage}`;
  url += `&target=${toLanguage}`;

  console.log("translate", word);
  console.log("url", url);

  if (fromLanguage === undefined || toLanguage === undefined) {
    console.error("to or from language underined in translateThisWord");
    return;
  }

  Pair.find(
    { word: word, toLanguage: toLanguage, fromLanguage: fromLanguage },
    (err, response) => {
      if (err) {
        console.log("err find pair", err);
      } else {
        console.log("find pair response", response);
        if (Array.isArray(response) && response.length > 1) {
          console.log("duplicities in pair translated");
          Pair.deleteOne(
            { word: word, toLanguage: toLanguage, fromLanguage: fromLanguage },
            (err, response) => {
              if (err) {
                console.log("error deleting one pair");
              } else {
                console.log("deleted one duplicit pair");
              }
            }
          );
        } else if (Array.isArray(response) && response.length === 1) {
          console.log("exactly one translation already, I keep it");
        } else {
          //do actual translation
          try {
            fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
              }
            })
              .then(res => res.json())
              .then(response => {
                console.log("response from google: ", response);
                console.log(
                  "return",
                  response.data.translations[0].translatedText
                );

                const translation =
                  response.data.translations[0].translatedText;
                try {
                  Pair.create({
                    id: id,
                    word: word,
                    toLanguage: toLanguage,
                    fromLanguage: fromLanguage,
                    translation: translation,
                    display: true
                  });
                } catch (e) {
                  console.log("error", e);
                }
              })
              .catch(error => {
                console.log(
                  "There was an error with the translation request: ",
                  error
                );
              });
          } catch (e) {
            console.log("translateion e", e);
          }
        }
      }
    }
  );
};
// //
// app.post(PAIR_FLAG, (req, res) => {
//   const fromLanguage = req.body.fromLanguage;
//   const toLanguage = req.body.toLanguage;
//   const word = req.body.word;
//   const username = req.body.username;
// });

app.post(TRANSLATE_ONE, (req, res) => {
  const fromLanguage = req.body.fromLanguage;
  const toLanguage = req.body.toLanguage;
  const word = req.body.word;

  let url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
  url += "&q=" + encodeURI(word);
  url += `&source=${fromLanguage}`;
  url += `&target=${toLanguage}`;

  console.log("translate", word);
  console.log("url", url);
  try {
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(response => {
        console.log("response from google: ", response);
        console.log("return", response.data.translations[0].translatedText);
        res.send(response);
        // const translation = response.data.translations[0].translatedText;
        // try {
        //   Pair.create({
        //     id: id,
        //     word: word,
        //     toLanguage: toLanguage,
        //     fromLanguage: fromLanguage,
        //     translation: translation
        //   });
        // } catch (e) {
        //   console.log("error", e);
        // }
      })
      .catch(error => {
        console.log("There was an error with the translation request: ", error);
        res.status(500).send("TRANSLATE ONE FAIL");
      });
  } catch (e) {
    console.log("translateion e", e);
  }
});

app.post("/frequencies/translate", (req, res) => {
  const fromLanguage = req.body.fromLanguage;
  const toLanguage = req.body.toLanguage;
  console.log("freq trans");
  Frequent.find({}, (err, frequencies) => {
    if (err) {
      console.log("err", err);
    } else {
      console.log("frequencies", frequencies);
      frequencies.forEach(f => {
        console.log("I have f:", f.id, f.word);
        //only translate if translation is not yet done
        const translation = translateThisWord(
          f.id,
          f.word,
          fromLanguage,
          toLanguage
        );
      });
      res.send("TRANSLATED");
    }
  });
});

app.post(PAIR_EDIT, (req, res) => {
  const fromLanguage = req.body.fromLanguage;
  const toLanguage = req.body.toLanguage;
  const id = req.body.id;
  const translation = req.body.translation;

  console.log("pair edit", id, fromLanguage, toLanguage, translation);
  Pair.updateOne(
    { id: id, fromLanguage: fromLanguage, toLanguage: toLanguage },
    { translation: translation },
    (err, result) => {
      if (err) {
        console.log("err", err);
        res.status(500).send("PAIR_EDIT FAILED");
      } else {
        console.log("result", result);
        res.send("PAIR_EDIT SUCCESS");
      }
    }
  );
});

app.post(USER_WORD_FLAG, (req, res) => {
  const username = req.body.username;
  const fromLanguage = req.body.fromLanguage;
  const id = req.body.id;
  const word = req.body.word;

  console.log("USER_WORD_FLAG", username, id);

  User.updateOne(
    { username: username },
    { $push: { flaggedWords: { language: fromLanguage, id: id, word: word } } },
    function(error, success) {
      if (error) {
        console.log(error);
        res.status(500).send("updated fail");
      } else {
        console.log(success);
        res.status(200).send("updated");
      }
    }
  );
});

app.post("/userSettings/set", (req, res) => {
  console.log("userSettings", req.body.type, req.body.setting, req.body.auth);

  if (req.body.type === "toLanguage") {
    User.updateOne(
      { auth: req.body.auth },
      { toLanguage: req.body.setting },
      (err, suc) => {
        if (err) {
          console.log("err", err);
          res.send("userSettings_FAIL_AUTH_FIND");
        } else {
          console.log("userSettings_TO_SUCCESS");
          //res.send("userSettings_TO_SUCCESS");
        }
      }
    );
  }

  if (req.body.type === "choicesCount") {
    User.updateOne(
      { auth: req.body.auth },
      { choicesCount: req.body.setting },
      (err, suc) => {
        if (err) {
          console.log("err", err);
          res.send("LANGUAGE_TO_FAIL_AUTH_FIND");
        } else {
          console.log("LANGUAGE_TO_SUCCESS");
          //res.send("LANGUAGE_TO_SUCCESS");
        }
      }
    );
  }

  res.status(200).send("updated");
});

app.post("/userSettings/get", (req, res) => {
  console.log("get userSettings", req.body.auth);
  User.findOne({ auth: req.body.auth }, (err, suc) => {
    if (err) {
      console.log("err", err);
      res.send("LANGUAGE_TO_FAIL_AUTH_FIND");
    } else {
      console.log("LANGUAGE_TO_SUCCESS", suc);

      const typeArr = JSON.parse(req.body.type);

      let response = {
        message: "LANGUAGE_TO_SUCCESS"
      };

      if (typeArr.includes("username")) {
        response.username = suc.username;
      }

      if (typeArr.includes("choicesCount")) {
        response.choicesCount = suc.choicesCount;
      }

      if (typeArr.includes("toLanguage")) {
        response.toLanguage = suc.toLanguage;
      }

      if (typeArr.includes("fromLanguage")) {
        response.fromLanguage = suc.fromLanguage;
      }

      console.log("response", response);
      res.status(200).send(response);
    }
  });
});

// app.post("/languages/delete/:word", (req, res) => {
//   console.log("removing", req.params.word);
//   Language.deleteOne({ word: req.params.word }, err => {
//     if (err) {
//       console.log("err", err);
//       res.send("NOT_DELETED");
//     } else {
//       console.log("deleted");
//       res.send("DELETED_SUCCESSFULLY");
//     }
//   });
// });

app.post(LOG_USER_ACTION, (req, res) => {
  const word = req.body.word;
  const fromLanguage = req.body.fromLanguage;
  const toLanguage = req.body.toLanguage;
  const username = req.body.username;
  const success = req.body.success;
  const action = req.body.action;

  try {
    Log.create({
      word: word,
      toLanguage: toLanguage,
      fromLanguage: fromLanguage,
      username: username,
      success: success,
      action: action
    });

    console.log("LOG_SUCCESS");
    res.send("LOG_SUCCESS");
  } catch (e) {
    console.log("error", e);
    res.status(500).send("LOG_FAIL");
  }
});

app.post(USER_PROGRESS_GET_TWENTY_FOUR, (req, res) => {
  var startTime = process.hrtime();

  const fromLanguage = req.body.fromLanguage;
  const toLanguage = req.body.toLanguage;
  const username = req.body.username;
  console.log("USER_PROGRESS_GET");
  try {
    // optimalization needed if I knew how to use aggregate better
    Log.aggregate([
      {
        $match: {
          createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          toLanguage: toLanguage,
          fromLanguage: fromLanguage,
          username: username
        }
      }
    ]).exec((err, result) => {
      if (err) {
        console.log("err", err);
      } else {
        console.log("result", result);
        let good = 0;
        let bad = 0;
        result.forEach(r => {
          if (r.success) {
            good++;
          } else {
            bad++;
          }
        });

        console.log("good / bad", good, bad);
        var elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));

        res.send({
          last24hours: {
            good: good,
            bad: bad,
            lookupTime: elapsedSeconds
          }
        });
      }
    });

    console.log("USER_PROGRESS_GET SUCCCESS");
  } catch (e) {
    console.log("error", e);
    res.status(500).send("USER_PROGRESS_GET FAIL");
  }
});

// app.post("/frequency/add", (req, res) => {
//   console.log("freq add", req.body.id, req.body.word);
//   try {
//     Frequent.create({
//       id: req.body.id,
//       word: req.body.word
//     });
//     console.log("frequency added");
//     res.send("FREQUENCY_ADD_SUCCESS");
//   } catch (e) {
//     console.log("frequency err", e);
//     res.send("FREQUENCY_ADD_FAIL");
//   }
// });

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
          console.log("id", id, word);
          Frequent.create({ id: id, word: word }, (err, res) => {
            if (err) {
              console.log("err", err);
            } else {
              console.log("res", res);
            }
          });
          id++;
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
