const express = require("express");
const app = express();


app.set('view engine', 'ejs');
app.use(express.static("public"));


const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended:false}));

let mysql = require('mysql2');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'travelguide'
});

/*
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  connection.query("SELECT * FROM bus", function (err, result, fields) {
    console.log(result);
  });
});
*/

let user="";
let pwd="";
let email="";
let searchblogs="";
let searchdests="";
let searchloc="";
let title="";
let dest="";
let pwdcorrect = 1;
let count=0;
let blogexists=0;
let destexists=0;

app.get("/", function(req,res){
  count+=1;
  res.render("login",{pwdcorrect:pwdcorrect});

  if(count>0)
    pwdcorrect=1;
});

app.post("/", function(req,res){
  user = req.body.username;
  pwd = req.body.pwd;

  connection.connect(function(err) {
    count=0;
    if (err) {
      return console.error('error: ' + err.message);
    }
    
    connection.query("SELECT COUNT(user) FROM authen WHERE user='"+user+"' and pwd = '"+pwd+"';", function (err, result, fields) {
      if(result[0]["COUNT(user)"]==1){
        pwdcorrect=1;
        res.redirect("/home");
      }
      else{
        pwdcorrect = 0;
        res.redirect("/");
      }
    });

  });
});

app.get("/create", function(req,res){
  res.render("create");
});

app.post("/create", function(req,res){
  user = req.body.username;
  pwd = req.body.pwd;
  email = req.body.email;

  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    connection.query("INSERT INTO authen values ('"+user+"','"+email+"','"+pwd+"')", function (err, result, fields) {
      console.log(1);
    });
  });

  res.redirect("/");
});

app.get("/home", function(req,res){
  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    let query="";

    query = "SELECT * FROM blogs order by count DESC LIMIT 3";
    connection.query(query, function (err, result, fields) {
      res.render("home",{blogs:result});
      searchblogs="";
    });
  });
});

app.post("/home", function(req,res){
  res.redirect("/home");
});

app.get("/blogs",function(req,res){

  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    let query="";

    if(searchblogs!="")
      query = "SELECT * FROM blogs WHERE content LIKE '%"+searchblogs+"%' order by count desc;";
    else
      query = "SELECT * FROM blogs order by count desc"

    connection.query(query, function (err, result, fields) {
      res.render("blogs",{blogs:result});
      searchblogs="";
    });
  });
});

app.get("/blogs/:id", function(req,res){
  title = req.params['id'].replace(/_/g, " ");

  query = "UPDATE blogs SET count=count+1 WHERE title='"+title+"';"
  console.log(title);
  connection.query(query, function (err, result, fields) {

  });
  res.redirect("/blog");
});

app.post("/blogs", function(req,res){
  searchblogs= req.body.search1;
  res.redirect("/blogs");
});


app.get("/blog",function(req,res){
  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    let query="";
    query = "SELECT * FROM blogs WHERE title = '"+title+"';";

    connection.query(query, function (err, result, fields) {

      res.render("blog_onclick.ejs",{blog:result});
      searchblogs="";
    });
  });

});

app.get("/blogcreate",function(req,res){
  res.render("bloginsert.ejs",{blogexists:blogexists});
  blogexists = 0;
});

app.post("/blogcreate", function(req,res){
  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    let query="";
    query = "INSERT INTO blogs VALUES('"+req.body.name+"', '"+req.body.date+"', '"+req.body.content+"', '"+req.body.title+"', '"+req.body.dest+"', 0);";

    connection.query(query, function (err, result, fields) {
      if (err) {
        blogexists = 1;
        //return console.error('error: ' + err.message);
      }
      searchblogs="";
    });
  });

  res.redirect("/blogcreate");
});

app.get("/destinations",function(req,res){

  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    let query="";

    if(searchdests!="")
      query = "SELECT * FROM dest WHERE location LIKE '%"+searchdests+"%' order by count desc;";
    else
      query = "SELECT * FROM dest order by count desc";

    connection.query(query, function (err, result, fields) {
      res.render("destinations.ejs",{destinations:result});
      searchdests="";
    });
  });
});

app.get("/home_to_dest/:id", function(req,res){
  searchdests = req.params['id'].replace(/_/g, " ");

  res.redirect("/destinations");
});

app.get("/destinations/:id", function(req,res){
  dest = req.params['id'].replace(/_/g, " ");

  query = "UPDATE dest SET count=count+1 WHERE destination LIKE '"+dest+"';"
  console.log(dest);
  connection.query(query, function (err, result, fields) {

  });

  res.redirect("/destination");
});


app.post("/destinations", function(req,res){
  searchdests= req.body.search1;
  res.redirect("/destinations");
});

app.get("/destination",function(req,res){
  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    let query="";
    query = "SELECT * FROM dest WHERE destination = '"+dest+"';";

    connection.query(query, function (err, result, fields) {

      res.render("destination_onclick.ejs",{dest:result});
      searchblogs="";
    });
  });
});

app.get("/destinationcreate",function(req,res){
  res.render("destinationinsert.ejs",{destexists:destexists});
  destexists = 0;
});

// app.post("/destinationcreate", function(req,res){
//   connection.connect(function(err) {
//     if (err) {
//       return console.error('error: ' + err.message);
//     }
//     let query="";
//
//     var dandd = "";
//     var temp = req.body.dandd .split(".");
//
//     temp.forEach(function(t,i){
//       dandd+= t +".<br>";
//     });
//     console.log(dandd);
//
//     query = "INSERT INTO dest VALUES('"+user+"', '"+req.body.gmap+"', "+req.body.phone_no+", "+req.body.entry_fee+", '"+dandd+"', '"+req.body.rest+"', ' ', 0, '"+req.body.destination+"', '"+req.body.location+"');";
//
//     connection.query(query, function (err, result, fields) {
//
//     });
//   });
//
//   res.redirect("/destinationcreate");
// });

app.post("/destinationcreate", function(req,res){
  connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    let query="";
    // var dandd = "";
    // var temp = req.body.dandd .split(".");
    //
    // temp.forEach(function(t,i){
    //   dandd+= t +".\n";
    // });
    // console.log(dandd);
    query = "INSERT INTO dest VALUES('"+user+"', '"+req.body.gmap+"', '"+req.body.phone_no+"', "+req.body.entry_fee+", '"+req.body.dandd+"', '"+req.body.rest+"', ' ', 0, '"+req.body.destination+"', '"+req.body.location+"');";

    connection.query(query, function (err, result, fields) {
      if (err) {
        destexists = 1;
        //return console.error('error: ' + err.message);
      }
    });
  });

  res.redirect("/destinationcreate");
});


app.listen(3000, function(){
 console.log("Server running on localhost 3000");
});
