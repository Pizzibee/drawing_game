let signUpPage = $("#signUpPage");
let signInPage = $("#signInPage");
let dessinPage = $("#dessinPage");
let choixPage = $("#choixPage");
let jouerPage = $("#jouerPage");
signUpPage.hide();
dessinPage.hide();
choixPage.hide();
jouerPage.hide();
$("#alertSignIn").hide();

$("#signIn").on("click", function() {
  let username = $("#username").val();
  let password = $("#password").val();
  if (username == "" || password == ""){
    $("#alertSignIn").show();
    $("#messageSignIn").text("Veuillez remplir tous les champs");
  }else{
    $.ajax({
      url: '/dessin',
      type: 'POST',
      data: { action: "signIn", username:username, password:password},
      success: function(reponse) {
        if (reponse=="true"){
          signInPage.hide();
          choixPage.show();
        }else{
          $("#alertSignIn").show();
          $("#messageSignIn").text("Le nom et mot de passe ne correspondent pas ou vous n'êtes pas inscrits");
        }
      },
      error: function(e) {
        console.log(e.message);
      }
    });
  }
});
$("#goToSignUp").on("click", function() {
  signInPage.hide();
  signUpPage.show();
  $("#alertSignUp").hide();
  $("#successSignUp").hide();
});
$("#goToSignIn").on("click", function() {
  signInPage.show();
  signUpPage.hide();
  $("#alertSignIn").hide();
});

$("#dessiner").click(function(){
  choixPage.hide();
  dessinPage.show();
});

$("#jouer").click(function(){
  choixPage.hide();
  jouerPage.show();
  $("#alertVictoire").hide();
  $("#alertPerte").hide();
  drawRandomDessin();
})

$("#signUp").on("click", function() {
  let username = $("#usernameUp").val();
  let password = $("#passwordUp").val();
  let password2 = $("#passwordUp2").val();
  console.log(password);
  console.log(password2);
  if (password != password2){
    $("#alertSignUp").show();
    $("#messageSignUp").text("Les deux mots de passe ne correspondent pas");
  }else if (username === "" || password === "" || password2 === ""){
    $("#alertSignUp").show();
    $("#messageSignUp").text("Veuillez remplir tous les champs");
  }else{
    $.ajax({
      url: '/dessin',
      type: 'POST',
      data: { action: "signUp", username:username, password:password},
      success: function(reponse) {
        if (reponse=="true"){
          $("#alertSignUp").hide();
          $("#successSignUp").text("Vous avez été inscrit");
          $("#successSignUp").show();
        }else{
          $("#alertSignUp").text("Erreur lors de l'inscription");
          $("#alertSignUp").show();
        }
      },
      error: function(e) {
        console.log(e.message);
      }
    });
  }
});

let context = document.getElementById('canvas').getContext("2d");
let context2 = document.getElementById('canvas2').getContext("2d");
let clickX = new Array();
let clickY = new Array();
let clickDrag = new Array();
let paint;

$('#canvas').mousedown(function(e){
  let mouseX = e.pageX - this.offsetLeft;
  let mouseY = e.pageY - this.offsetTop;

  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

$('#canvas').mousemove(function(e){
  if(paint){
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    redraw();
  }
});

$('#canvas').mouseup(function(e){
  paint = false;
});

$('#canvas').mouseleave(function(e){
  paint = false;
});

$("#clearCanvas").click(function(){
  clickX = new Array();
  clickY = new Array();
  clickDrag = new Array();
  paint = false;
  $("#tagDessin").val("");
  $("#nameDessin").val("");
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
});


function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

  context.strokeStyle = "#000000";
  context.lineJoin = "round";
  context.lineWidth = 5;

  for(var i=0; i < clickX.length; i++) {
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}

$("#saveDessin").click(function(){
  let dessin = {};
  dessin["clickX"] = clickX;
  dessin["clickY"] = clickY;
  dessin["clickDrag"] = clickDrag;
  dessin["tags"] = $("#tagDessin").val().split(" ");
  let dessinJSON = JSON.stringify(dessin, null, 4);
  let nom = $("#nameDessin").val();
  $("#clearCanvas").click();
  $.ajax({
    url: '/dessin',
    type: 'POST',
    data: { action: "saveDessin", dessinName:nom, dessin:dessinJSON},
    success: function(reponse) {
    },
    error: function(e) {
      console.log(e.message);
    }
  });
});

let currentDessin;
let guessed = false;

$("#recommencer").click(function(){
  $("#alertVictoire").hide();
  $("#alertPerte").hide();
  drawRandomDessin();
});

function drawRandomDessin(){
  let nbrDessin;
  $.ajax({
    url: '/dessin',
    type: 'POST',
    data: { action: "getNbrDessin"},
    success: function(reponse) {
      nbrDessin = reponse;
    },
    error: function(e) {
      console.log(e.message);
    }
  });
  $.ajax({
    url: '/dessin',
    type: 'POST',
    data: { action: "getDessins"},
    success: function(reponse) {
      let dessins = JSON.parse(reponse);
      currentDessin = JSON.parse(dessins[randomNb(0, nbrDessin-1)]);
      drawInterval(currentDessin["clickX"], currentDessin["clickY"], currentDessin["clickDrag"]);
    },
    error: function(e) {
      console.log(e.message);
    }
  });
}

$("#deviner").click(function(){
  $("#alertVictoire").hide();
  $("#alertPerte").hide();
  let tags = currentDessin["tags"];
  let userGuess = $("#guess").val();
  let flag = false;
  for (let i = 0; i < tags.length; i++) {
    if (tags[i] === userGuess){
      flag = true;
    }
  }
  if (flag===true){
    guessed = true;
    $("#alertVictoire").show();
  }else{
    $("#alertPerte").show();
  }
  $("#guess").val("");
});


function randomNb(min, max) {
  let random_number = Math.random() * (max-min) + min;
  return Math.round(random_number);
}

function drawInterval(xs, ys, drags){
  context2.clearRect(0, 0, context2.canvas.width, context2.canvas.height); // Clears the canvas
  context2.strokeStyle = "#000000";
  context2.lineJoin = "round";
  context2.lineWidth = 5;
  let i = 0;
  let id = setInterval(drawLine,40);
  function drawLine(){
    context2.beginPath();
    if(drags[i] && i){
      context2.moveTo(xs[i-1], ys[i-1]);
    }else{
      context2.moveTo(xs[i]-1, ys[i]);
    }
    context2.lineTo(xs[i], ys[i]);
    context2.stroke();
    context2.closePath();
    if (i == xs.length || guessed === true){
      clearInterval(id);
      drawNoInterval(xs, ys, drags);
      guessed = false;
    }else{
      i++;
    }
  }
}
function drawNoInterval(xs, ys, drags){
  context2.clearRect(0, 0, context2.canvas.width, context2.canvas.height); // Clears the canvas

  context2.strokeStyle = "#000000";
  context2.lineJoin = "round";
  context2.lineWidth = 5;

  for(var i=0; i < xs.length; i++) {
    context2.beginPath();
    if(drags[i] && i){
      context2.moveTo(xs[i-1], ys[i-1]);
     }else{
       context2.moveTo(xs[i]-1, ys[i]);
     }
     context2.lineTo(xs[i], ys[i]);
     context2.closePath();
     context2.stroke();
  }
}
