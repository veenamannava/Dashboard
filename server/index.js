const express = require("express");
const cors = require("cors");
const app = express();
const sqlite3 = require("sqlite3");
const fileUpload = require("express-fileupload");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 8080;
const fs = require("fs");
const path = require("path");
const { parse } = require("path");
const { exit } = require("process");
const { endianness } = require("os");
require("dotenv").config();
path.resolve(process.env.Img); 
app.use(process.env.Fname, express.static(path.resolve(process.env.Img)));

// path.resolve('E:/Newfolder'); 
// app.use("/Newfolder", express.static(path.resolve("E:/Newfolder")));

// below 2 lines is for getting path in same folder
// path.join(__dirname, "./Images");
// app.use("/Images", express.static(path.join(__dirname, "/Images")));
// above 2 lines is for getting path in same folder

app.use(express.static("public"));
app.use(fileUpload());
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const db = new sqlite3.Database(process.env.Database, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Connected to db");
});
let userMail;

app.post("/Login", function (req, res) {
  const db = new sqlite3.Database(process.env.Database, (err) => {
    if (err) {
      console.log(err);
    }
    console.log("Connected to db");
  });
  db.get(
    "SELECT * FROM userdetails where user_name=? AND password=?;",
    [req.body.Email_Id, req.body.password],
    function (err, rows) {
      console.log(req.body.Email_Id);
      if (rows) {
        try {
          console.log(rows);
          if (
            rows.user_name == req.body.Email_Id &&
            rows.password == req.body.password
          ) {
            userMail = rows.user_name;
            console.log("yes");
            res.send(true);
            const d = new Date();
            const hrs = d.getHours();

            const mins = d.getMinutes();
            const millsec = d.getSeconds();
            const dt = d.getDate();
            const mnth = d.getMonth();
            const yer = d.getFullYear();
            const logoutLogger = `UPDATE userdetails SET Logout_Time=?  Where Logout_Time IS NULL AND Login_Time IS NOT NULL `;
            db.run(
              logoutLogger,
              [`${dt}/${mnth + 1}/${yer} ${hrs}:${mins}:${millsec}`],
              () => {}
            );
            const updateLogger = `UPDATE userdetails SET Login_Time=?  Where user_name=?`;
            db.run(
              updateLogger,
              [`${dt}/${mnth + 1}/${yer} ${hrs}:${mins}:${millsec}`, userMail],
              () => {}
            );
            const updateloggerlogout = `UPDATE userdetails SET Logout_Time=? Where user_name=?`;
            db.run(updateloggerlogout, [, userMail], () => {});
            return;
          }
        } catch (err) {
          res.send(false);
          console.log(err);
        }
      } else {
        res.send(false);
      }
    }
  );
});

app.get("/logout", function (req, res) {
  const d = new Date();
  const hrs = d.getHours();
  const mins = d.getMinutes();
  const millsec = d.getMilliseconds();
  const dt = d.getDate();
  const mnth = d.getMonth();
  const yer = d.getFullYear();
  if (userMail) {
    const updateLogger = `UPDATE userdetails SET Logout_Time=? Where user_name=?`;
    db.run(
      updateLogger,
      [`${hrs}:${mins}:${millsec} ${dt}-${mnth+1}-${yer}`, userMail],
      () => {
        console.log("updated");
        // db close below
        db.close((err) => {
          if (err) console.log(err.message);
          else console.log("Close the database connection.");
        });
        // shutdownserver();

        //  app.exit()
        // npx kill-port 8080
        // express.close()
        // db close above
      }
    ); 
    res.send(true);
  }

  userMail = "";
});

app.post("/changepassword", (req, res) => {
  let data = [
    req.body.Email_Id,
    req.body.password,
    req.body.Newpassword,
    req.body.reenternewpassword,
  ];
  console.log(data);
  db.get(
    `SELECT * FROM userdetails where user_name=? and password=?`,
    [req.body.Email_Id, req.body.password],
    function (err, rows) {
      try {
        if (
          rows.user_name == req.body.Email_Id &&
          rows.password == req.body.password
        ) {
          if (req.body.Newpassword == req.body.reenternewpassword)
            db.run(
              `UPDATE userdetails SET password = ? WHERE user_name = ?`,
              [req.body.Newpassword, req.body.Email_Id],
              function (err, urows) {
                console.log("password is changed");
                res.send(true);
              }
            );
          else {
            console.log("password is not changed");
            res.send(false);
          }
        } else {
          console.log("password is not changed");
          res.send(false);
        }
      } catch (err) {
        console.log("invalid crendentials");
        res.send(false);
      }
    }
  );
});

// below summary
app.post("/summary", (req, res) => {
  let sufilters = [];

  let subottletypes = [];

  let { from, to } = req.body;

  for (const [dlkey, dlvalue] of Object.entries(req.body.filterConditions)) {
    if (dlvalue) {
      sufilters.push(dlkey);
    }
  }

  if (sufilters.includes("Aqua")) {
    subottletypes.push("Aqua");
  } else {
    subottletypes.push("");
  }

  if (sufilters.includes("Oasis")) {
    subottletypes.push("Oasis");
  } else {
    subottletypes.push("");
  }
  if (sufilters.includes("OtherBrands")) {
    subottletypes.push("OtherBrands");
  } else {
    subottletypes.push("");
  }

  let Aqua = `select "${from}" as fromdate,"${to}" as todate,Bottle_Type,count(case when Defect_Type="Discoloration" then 1 end)as Discoloration, count(case when Defect_Type="Foreign Particles" then 1 end)as Forigen_Particle,count(case when Defect_Type="Others" then 1 end)as Others,
   count(case when Defect_Type="Scratches" then 1 end)as Scratches,count(case when Defect_Type="Bottle_Cap" then 1 end)as Bottle_Cap,
   count(case when Defect_Type="Good Bottle" then 1 end)as Good_Bottle,count(case when Defect_Type!="Good Bottle" then 1 end)as Defect_Bottle,count(case when Image Like "%POS1%" then 1 end)as Total_Bottles from Defect_Log where Time_Stamp BETWEEN ? AND ? and Bottle_Type IN (?,?,?) GROUP BY Bottle_Type;`;

  // console.log(from,to + "summary" ,subottletypes)
  db.all(Aqua, [`${from}`, `${to + 1}`, ...subottletypes], (err, suAqua) => {
    if (err) {
      console.log(err);
    }

    res.send(suAqua);
  });
});

// above summary
app.post("/defectlogwholedata", (req, res) => {
  let dlfilters = [];

  let dlbottletypes = [];

  let { from, to } = req.body;

  for (const [dlkey, dlvalue] of Object.entries(req.body.filterConditions)) {
    if (dlvalue) {
      dlfilters.push(dlkey);
      // console.log(dlfilters + "defect1")
    }
  }

  if (dlfilters.includes("Aqua")) {
    dlbottletypes.push("Aqua");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Oasis")) {
    dlbottletypes.push("Oasis");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("OtherBrands")) {
    dlbottletypes.push("OtherBrands");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Discoloration")) {
    dlbottletypes.push("Discoloration");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Scratches")) {
    dlbottletypes.push("Scratches");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Foreign Particles")) {
    dlbottletypes.push("Foreign Particles");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Others")) {
    dlbottletypes.push("Others");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Good Bottle")) {
    dlbottletypes.push("Good Bottle");
  } else {
    dlbottletypes.push("");
  }

  let sqlString = `SELECT SNO,Time_Stamp,Bottle_Type,Defect,Defect_Type,Image,Score1,Mark_False_Positive FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN (?,?,?,?) AND Defect_Type IN (?,?,?,?,?,?)`;
  // console.log(dlbottletypes + "defectlog")
  db.all(
    sqlString,
    [`${from}`, `${to + 1}`, ...dlbottletypes],
    (err, drows) => {
      if (err) {
        console.log(err);
      }
      res.send(drows);
      // console.log(drows)
    }
  );

  //   console.log(dlbottletypes);
});

// below is for upload model
app.post("/uploadfile", (req, res) => {
  const modelname = req.body.value;
  const folder = `./modelfiles/${modelname}`;
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  if (!req.files) {
    console.log("failed");
    return res.status(500).send({ msg: "file is not found" });
  }
  const File = req.files.file;
  let Path = `${__dirname}/${folder}/${File.name}`;
  let date =
    new Date().getDate() +
    "/" +
    (new Date().getMonth() + 1) +
    "/" +
    new Date().getFullYear();
  // Use the mv() method to place the file somewhere on your server

  File.mv(`${Path}`, function (err) {
     if (err) {
      console.log(err);
      // return res.status(500).send({ msg: "error" });
      return res.send(false);
    } else 
    if(req.body.i === req.body.fl)
     {
      db.all(
        `insert into Modelstatuslist(Model,Version,Last_Update,Status,File_Path) values(?,?,?,"Inactive",?)`,
        [req.body.value, req.body.version, date, `${Path}`],
        function (err, uploadata) {
          // console.log(uploadata+"kjh")
          if (uploadata) {
            db.run(
              `insert into System_Threshold (Scratches,Foreign_Particles,Discoloration,Model,Bottle_Cap,Others)values(?,?,?,?,?,?)`,
              ["0%", "0%", "0%", modelname, "0%", "0%"]
            );
            res.send(true);
          }
          else{
            res.send(false)
          }
        }
      );
      // res.send(false)
      // // return res.send({ file: File.name, path: `/${File}`, ty: File.type }); 
    }
    else{
     res.send( "one")
    }
    // res.send(false)
  });
});

app.post("/updatestatus", (req, res) => {
  db.serialize(function () {
    db.all(`UPDATE Modelstatuslist  SET Status = ? WHERE Status = ? `, [
      "Inactive",
      "Active",
    ]);
    db.all(
      `UPDATE Modelstatuslist  SET Status = ? WHERE Sl_No = ? `,
      ["Active", req.body.Sl_No],
      ["Active"],
      function (err, statusrows) {
        res.send(statusrows);
      }
    );
  });
});

app.post("/modeldata", (req, res) => {
  db.serialize(function () {
    db.all(
      `SELECT * from Modelstatuslist WHERE Model=?`,
      [req.body.Model],
      function (err, modelrows) {
        res.send(modelrows);
      }
    );
  });
});
app.post("/modelclicked", (req, res) => {
  db.serialize(function () {
    db.all(
      `SELECT * from System_Threshold WHERE Model=?`,
      [req.body.Modelc],
      function (err, modelc) {
        res.send(modelc);
      }
    );
  });
});

app.post("/defectlogdaydata", (req, res) => {
  let dlfilters = [];
  let dlbottletypes = [];
  let { from, to, limit, skip } = req.body;

  for (const [dlkey, dlvalue] of Object.entries(req.body.filterConditions)) {
    if (dlvalue) {
      dlfilters.push(dlkey);
    }
  }
  if (dlfilters.includes("Aqua")) {
    dlbottletypes.push("Aqua");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Oasis")) {
    dlbottletypes.push("Oasis");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("OtherBrands")) {
    dlbottletypes.push("OtherBrands");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Discoloration")) {
    dlbottletypes.push("Discoloration");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Scratches")) {
    dlbottletypes.push("Scratches");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Foreign Particles")) {
    dlbottletypes.push("Foreign Particles");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Others")) {
    dlbottletypes.push("Others");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Bottle Cap")) {
    dlbottletypes.push("Bottle Cap");
  } else {
    dlbottletypes.push("");
  }

  let sqlString = `SELECT SNO,Time_Stamp,Bottle_Type,Defect,Defect_Type,Image,Score1,Mark_False_Positive,Bottle_No FROM Defect_Log WHERE  Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN(?,?,?) AND Defect_Type IN (?,?,?,?,?) GROUP BY Bottle_No LIMIT ? OFFSET  ?;`;
  db.all(
    sqlString,
    [`${from}`, `${to + 1}`, ...dlbottletypes, `${limit}`, `${skip}`],
    (err, drows) => {
      if (err) {
        console.log(err);
      }
      console.log(drows);
      res.send(drows);
    }
  );
  // console.log(dlbottletypes)
});

app.post("/sbottledetails", (req, res) => {
  //  let bottle = req.body
  //  console.log(req.body.bottleno + "123456789")

  let sqlString = `SELECT SNO,Time_Stamp,Bottle_Type,Defect,Bottle_Region,Defect_Type,Image,Score1,Mark_False_Positive,Bottle_No FROM Defect_Log WHERE Bottle_No = ?  ORDER BY Bottle_No;`;
  db.all(sqlString, req.body.bottleno, (err, sbrows) => {
    if (err) {
      console.log(err);
    }
    res.send(sbrows);
  });
  // console.log(dlbottletypes)
});


// defectlog table rendering
app.post("/defectfilternextpage", (req, res) => {
  let dlfilters = [];
  let dlbottletypes = [];
  let { from, to, limit, skip } = req.body;

  for (const [dlkey, dlvalue] of Object.entries(req.body.filterConditions)) {
    if (dlvalue) {
      dlfilters.push(dlkey);
    }
  }
  if (dlfilters.includes("Aqua")) {
    dlbottletypes.push("Aqua");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Oasis")) {
    dlbottletypes.push("Oasis");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("OtherBrands")) {
    dlbottletypes.push("OtherBrands");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Discoloration")) {
    dlbottletypes.push("Discoloration");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Scratches")) {
    dlbottletypes.push("Scratches");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Foreign Particles")) {
    dlbottletypes.push("Foreign Particles");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Others")) {
    dlbottletypes.push("Others");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Bottle Cap")) {
    dlbottletypes.push("Bottle Cap");
  } else {
    dlbottletypes.push("");
  }
  let sqlString = `SELECT SNO,Time_Stamp,Bottle_Type,Defect,Defect_Type,Image,Score1,Mark_False_Positive,Bottle_No FROM Defect_Log WHERE  Time_Stamp BETWEEN ? AND ?AND Bottle_Type IN(?,?,?) AND Defect_Type IN (?,?,?,?,?) GROUP BY Bottle_No LIMIT ? OFFSET  ?;`;
  db.all(
    sqlString,
    [`${from}`, `${to + 1}`, ...dlbottletypes, `${limit}`, `${skip}`],
    (err, dlnrows) => {
      if (err) {
        throw err;
      }

      res.send(dlnrows); 
    }
  );
});

app.post("/defectfilterpreviouspage", (req, res) => {
  let dlfilters = [];
  let dlbottletypes = [];
  let { from, to, limit, skip } = req.body;

  console.log(`${skip}`);
  for (const [dlkey, dlvalue] of Object.entries(req.body.filterConditions)) {
    if (dlvalue) {
      dlfilters.push(dlkey);
    }
  }
  if (dlfilters.includes("Aqua")) {
    dlbottletypes.push("Aqua");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Oasis")) {
    dlbottletypes.push("Oasis");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("OtherBrands")) {
    dlbottletypes.push("OtherBrands");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Discoloration")) {
    dlbottletypes.push("Discoloration");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Scratches")) {
    dlbottletypes.push("Scratches");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Foreign Particles")) {
    dlbottletypes.push("Foreign Particles");
  } else {
    dlbottletypes.push("");
  }
  if (dlfilters.includes("Others")) {
    dlbottletypes.push("Others");
  } else {
    dlbottletypes.push("");
  }

  if (dlfilters.includes("Bottle Cap")) {
    dlbottletypes.push("Bottle Cap");
  } else {
    dlbottletypes.push("");
  }

  let sqlString = `SELECT SNO,Time_Stamp,Bottle_Type,Defect,Defect_Type,Image,Score1,Mark_False_Positive,Bottle_No FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN(?,?,?) AND Defect_Type IN (?,?,?,?,?) Group BY Bottle_No LIMIT ? OFFSET  ? ;`;
  db.all(
    sqlString,
    [`${from}`, `${to + 1}`, ...dlbottletypes, `${limit}`, `${skip}`],
    (err, dlfrows) => {
      if (err) {
        throw err;
      }

      res.send(dlfrows);
      console.log(dlfrows);
    }
  );
});
// end
app.post("/historyfilter", (req, res) => {
  let value = req.body.skip;
  // let filterdata = `select * from historylog where Sl_No BETWEEN ? AND ?`;
  db.all(
    `select * from History_Log where Time_Stamp BETWEEN ? AND ? ORDER BY Sl_No DESC LIMIT ? OFFSET?  `,
    [req.body.from, req.body.to + 1, req.body.limit, value],
    (err, hfrows) => {
      if (err) {
        throw err;
      }

      res.send(hfrows);
    }
  );
});

app.post("/historyfilternextpage", (req, res) => {
  let value = req.body.skip;
  // let filterdata = `select * from historylog where Sl_No BETWEEN ? AND ?`;
  db.all(
    `select * from History_Log where Time_Stamp BETWEEN ? AND ? ORDER BY Sl_No DESC LIMIT ? OFFSET  ?`,
    [req.body.from, req.body.to, req.body.limit, value],
    (err, hfnrows) => {
      if (err) {
        throw err;
      }

      res.send(hfnrows);
    }
  );
});

app.post("/historyfilterpreviouspage", (req, res) => {
  let value = req.body.skip;
  // let filterdata = `select * from historylog where Sl_No BETWEEN ? AND ?`;
  db.all(
    `select * from History_Log where Time_Stamp BETWEEN ? AND ? ORDER BY Sl_No DESC LIMIT ? OFFSET  ?`,
    [req.body.from, req.body.to, req.body.limit, value],
    (err, hfrows) => {
      if (err) {
        throw err;
      }

      res.send(hfrows);
    }
  );
});

app.post("/historydaydata", (req, res) => {
  let value = req.body.skip;
  // let filterdata = `select * from historylog where Sl_No BETWEEN ? AND ?`;
  db.all(
    `select * from History_Log where Time_Stamp BETWEEN ? AND ? ORDER BY Sl_No DESC LIMIT ? OFFSET ?  `,
    [req.body.from, req.body.to + 1, req.body.limit, value],
    (err, hdrows) => {
      //db.all(`select * from historylog (MULTISET (SELECT SKIP ? FIRST ?) where Time_Stamp BETWEEN ? AND ?  `,[req.body.skip,req.body.limit,req.body.from,req.body.to],(err, hdrows) => {
      if (err) {
        throw err;
      }

      res.send(hdrows);
    }
  );
});
//end
// edit data in system thershold in below
app.post("/edit", function (req, res) {
  let data = [
    req.body.store.Scratches + "%",
    req.body.store.ForeignParticles + "%",
    req.body.store.Discoloration + "%",
    req.body.store.Bottle_Cap + "%",
    req.body.store.Others + "%",
    req.body.Sl_No,
  ];
  let sql = `UPDATE System_Threshold SET Scratches = ?, Foreign_Particles=?, Discoloration=?,Bottle_Cap=?,Others=? WHERE Sl_No = ?`;

  db.all(sql, data, function (err, edit) {
    if (err) {
      return console.error(err.message);
    }
    if (edit) {
      return console.log(edit);
    }
  });
});

// edit data in system thershold in above
// amar---update
// defectlog table rendering
app.post("/defectlog", (req, res) => {
  const sql3 = `Select * from Defect_Log where Time_Stamp between ? and ?`;
  db.all(sql3, [String(req.body.from), String(req.body.to)], (err, rows) => {
    if (err) {
      console.log(err);
    }
    res.send(rows);
  });
});
// defectlog table rendering


app.post("/markfalsepositiveto1", (req, res) => {
  let data = [1, req.body.SNO]; //removed Sl_No
  let sql = `UPDATE Defect_Log SET Mark_False_Positive = ? WHERE SNO = ?`;

  db.run(sql, data, function (err, edit) {
    if (err) {
      return console.error(err.message);
    }
    res.send(edit);
  });
});
app.post("/markfalsepositiveto0", (req, res) => {
  let data = [0, req.body.SNO]; //removed Sl_No
  let sql = `UPDATE Defect_Log SET Mark_False_Positive = ? WHERE SNO = ?`;

  db.run(sql, data, function (err, edit) {
    if (err) {
      return console.error(err.message);
    }
    res.send(edit);
  });
});

//amar

// system threshold table renedering
app.get("/table", (req, res) => {
  db.get(
    `SELECT Model from Modelstatuslist WHERE Status=?`,
    ["Active"],
    (err, model) => {
      if (model) {
        let sql = `SELECT * from System_Threshold WHERE Model=?`;
        // let Sno = ;
        let modelname = model.Model;
        // first row only
        db.all(sql, modelname, (err, rows) => {
          if (err) {
            throw err;
          }
          res.send(rows);
        });
      } else {
        throw err;
      }
    }
  );
});
// system threshold table renedering

//model status table rendering
app.get("/status", (req, res) => {
  let sql = `SELECT * from Modelstatuslist ORDER BY Status=?  DESC`;

  // first row only
  db.all(sql, ["Active"], (err, rowm) => {
    if (err) {
      throw err;
    }

    res.send(rowm);
  });
});

app.post("/tableseevlues", (req, res) => {
  let sql = `SELECT * from System_Threshold WHERE Model=?`;
  db.all(sql, req.body.model, (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.send(rows);
    }
  });
});

//model status table rendering

app.get("/data", async (req, res) => {
  let filters = [];
  let bottletypes = [];
  const chartData = [];
  const x = new Date();
  let givenDate = `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate() - 1}`;
  let nextDate = `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`;
  //

  for (const [key, value] of Object.entries(req.body)) {
    if (value) {
      filters.push(key);
    }
  }
  if (filters.includes("Aqua")) {
    bottletypes.push("Aqua");
  } else {
    bottletypes.push("");
  }

  if (filters.includes("Oasis")) {
    bottletypes.push("Oasis");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("OtherBrands")) {
    bottletypes.push("OtherBrands");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Discoloration")) {
    bottletypes.push("Discoloration");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Scratches")) {
    bottletypes.push("Scratches");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Foreign Particles")) {
    bottletypes.push("Foreign Particles");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Others")) {
    bottletypes.push("Others");
  } else {
    bottletypes.push("");
  }

  if (filters.includes("Bottle Cap")) {
    bottletypes.push("Bottle Cap");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Good Bottle")) {
    bottletypes.push("Good Bottle");
  } else {
    bottletypes.push("");
  }

  let sqlString1 = `SELECT date(Time_Stamp),SUM(count) as TotalCount FROM (SELECT Time_Stamp, Defect_Type,COUNT(*) as count FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN (?,?,?,?) AND Defect_Type IN (?,?,?,?,?,?)  GROUP BY Defect_Type,Time_Stamp) GROUP BY date(Time_Stamp);`;
  await db.all(
    sqlString1,
    [
      `${givenDate}`,
      `${nextDate}`,
      "Aqua",
      "Oasis",
      "OtherBrands",
      "Discoloration",
      "Foreign Particles",
      "Scratches",
      "Others",
      "Bottle Cap",
      "Good Bottle",
    ],
    async (err, rows) => {
      if (err) {
        console.log(err);
        return;
      }
      await chartData.push(rows);
    }
  );

  let sqlString = `SELECT Defect_Type,COUNT(*) as count FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN (?,?,?) AND Defect_Type IN (?,?,?,?,?,?)  GROUP BY Defect_Type;`;

  await db.all(
    sqlString,
    [
      `${givenDate}`,
      `${nextDate}`,
      "Aqua",
      "Oasis",
      "OtherBrands",
      "Discoloration",
      "Foreign Particles",
      "Scratches",
      "Others",
      "Bottle Cap",
      "Good Bottle",
    ],
    async (err, rows) => {
      if (err) {
        console.log(err);
      }
      await chartData.push(rows);
    }
  );
  let barDataQuary = `SELECT Defect_Type,Bottle_Type,COUNT(*) as count FROM Defect_Log Where Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN(?,?,?) AND Defect_type IN(?,?,?,?,?,?)  GROUP BY Defect_Type,Bottle_Type;`;
  await db.all(
    barDataQuary,
    [
      `${givenDate}`,
      `${nextDate}`,
      "Aqua",
      "Oasis",
      "OtherBrands",
      "Discoloration",
      "Foreign Particles",
      "Scratches",
      "Others",
      "Bottle Cap",
      "Good Bottle",
    ],
    async (err, rows) => {
      if (err) {
        console.log(err);
      }
      await chartData.push(rows);
      res.send(chartData);
    }
  );
});

// app.post("/defectlogwholedata", (req, res) => {

//     let dlfilters = [];

//     let dlbottletypes = [];

//     let { from, to } = req.body;

//     for (const [dlkey, dlvalue] of Object.entries(req.body.filterConditions)) {

//       if (dlvalue) {

//         dlfilters.push(dlkey);

//       }

//     }

//     // if(dlfilters.includes("typeA")){

//     //   dlbottletypes.push("typeA")

//     // }else{

//     //   dlbottletypes.push("")

//     // }

//     // if(dlfilters.includes("typeB")){

//     //   dlbottletypes.push("typeB")

//     // }else{

//     //   dlbottletypes.push("")

//     // }

//     if (dlfilters.includes("Discoloration")) {

//       dlbottletypes.push("Discoloration");

//     } else {

//       dlbottletypes.push("");

//     }

//     if (dlfilters.includes("Scratches")) {

//       dlbottletypes.push("Scratches");

//     } else {

//       dlbottletypes.push("");

//     }

//     if (dlfilters.includes("Foreign Particles")) {

//       dlbottletypes.push("Foreign Particles");

//     } else {

//       dlbottletypes.push("");

//     }

//     if (dlfilters.includes("Others")) {

//       dlbottletypes.push("Others");

//     } else {

//       dlbottletypes.push("");

//     }
// if (dlfilters.includes("Crack")) {

//         dlbottletypes.push("Crack");

//       } else {

//         dlbottletypes.push("");

//       }

//     let sqlString = `SELECT SNO,Time_Stamp,Defect,Defect_Type,Image,Score1,Mark_False_Positive FROM Defect_Log WHERE  Time_Stamp BETWEEN ? AND ? AND Defect_Type IN (?,?,?,?,?)`;

//     db.all(

//       sqlString,

//       [`${from}`, `${to + 1}`, ...dlbottletypes],

//       (err, drows) => {

//         if (err) {

//           console.log(err);

//         }

//         res.send(drows);

//       }

//     );

//     console.log(dlbottletypes);

//   });

app.post("/data/filter", async (req, res) => {
  let filters = [];
  let bottletypes = [];
  const chartData = [];
  let { fromDate, toDate } = req.body;

  for (const [key, value] of Object.entries(req.body)) {
    if (value) {
      console.log(key);
      filters.push(key);
    }
  }
  if (filters.includes("Aqua")) {
    bottletypes.push("Aqua");
  } else {
    bottletypes.push("");
  }

  if (filters.includes("Oasis")) {
    bottletypes.push("Oasis");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("OtherBrands")) {
    bottletypes.push("OtherBrands");
  } else {
    bottletypes.push("");
  }

  if (filters.includes("Discoloration")) {
    bottletypes.push("Discoloration");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Scratches")) {
    bottletypes.push("Scratches");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Foreign Particles")) {
    bottletypes.push("Foreign Particles");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Others")) {
    bottletypes.push("Others");
  } else {
    bottletypes.push("");
  }
  
  if (filters.includes("Good Bottle")) {
    bottletypes.push("Good Bottle");
  } else {
    bottletypes.push("");
  }
  if (filters.includes("Bottle Cap")) {
    bottletypes.push("Bottle Cap");
  } else {
    bottletypes.push("");
  }
  console.log(fromDate);
  console.log(toDate);
  console.log(bottletypes);
  console.log("req rec");

  //   let sqlString1 = `SELECT date(Time_Stamp) as TimeStamp ,SUM(count) as TotalCount FROM (SELECT Time_Stamp, Defect_Type,COUNT(*) as count FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Defect_Type IN (?,?,?,?,?)  GROUP BY Defect_Type,Time_Stamp) GROUP BY date(Time_Stamp);`
  // let  sqlString= `SELECT Defect_Type,COUNT(*) as count FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Defect_Type IN (?,?,?,?,?)  GROUP BY Defect_Type;`
  // let barDataQuary = `SELECT Defect_Type,COUNT(*) as count FROM Defect_Log Where Time_Stamp BETWEEN ? AND ? AND Defect_type IN(?,?,?,?,?)  GROUP BY Defect_Type;`

  // below old
  let sqlString1 = `SELECT  date(Time_Stamp) as TimeStamp ,SUM(count) as TotalCount FROM (SELECT Time_Stamp, Defect_Type,COUNT(*) as count FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN (?,?,?) AND Defect_Type IN (?,?,?,?,?,?,?)  GROUP BY Defect_Type,Time_Stamp) GROUP BY Time_Stamp;`;
  let sqlString = `SELECT Defect_Type,COUNT(*) as count FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN (?,?,?) AND Defect_Type IN (?,?,?,?,?,?,?)  GROUP BY Defect_Type;`;
  let barDataQuary = `SELECT Defect_Type,Bottle_Type,COUNT(*) as count FROM Defect_Log Where Time_Stamp BETWEEN ? AND ? AND Bottle_Type IN (?,?,?) AND Defect_type IN(?,?,?,?,?,?,?)  GROUP BY Defect_Type,Bottle_Type;`;
  // let sqlString1 = `SELECT date(Time_Stamp) as TimeStamp ,SUM(count) as TotalCount FROM (SELECT Time_Stamp, Defect_Type,COUNT(*) as count FROM Defect_Log WHERE Time_Stamp BETWEEN ? AND ? AND Defect_Type IN (?,?,?,?,?)  GROUP BY Defect_Type,Time_Stamp) GROUP BY date(Time_Stamp);`
  // above old

  db.serialize(() => {
    let queryResult = [];
    db.all(
      sqlString,
      [`${fromDate}`, `${toDate + 1}`, ...bottletypes],
      async (err, rows) => {
        if (err) {
          console.log("1");
          console.log(err);
        }
        queryResult.push([...rows]);
        // console.log("2" + rows)
      }
    )
      .all(
        sqlString1,
        [`${fromDate}`, `${toDate + 1}`, ...bottletypes],
        async (err, rows) => {
          if (err) {
            console.log(err);
          }

          queryResult.push([...rows]);
        }
      )
      .all(
        barDataQuary,
        [`${fromDate}`, `${toDate + 1}`, ...bottletypes],
        async (err, rows) => {
          if (err) {
            console.log(err);
          }
          queryResult.push([...rows]);
          res.send(queryResult);
          console.log(queryResult);
        }
      );
  });
});
  
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
// app.use("/", express.static(getDir() + process.env.Build_Folder));

// app.get("/*", function (req, res) {
//   res.sendFile(getDir() + (process.env.Build_Folder + "/index.html"));
// });

//Using a function to set default app path

function getDir() {
  if (process.pkg) {
    return path.resolve(process.execPath + "/..");
  } else {
    return path.join(require.main ? require.main.path : process.cwd());
  }
}
