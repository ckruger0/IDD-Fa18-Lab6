/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hello, I am KeyBoardBot, here to make sure your number keys are working properly!"); //We start with the introduction;
    setTimeout(timedQuestion, 4000, socket, "What is your name?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data,socket,questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

/// These are the main statements that make up the conversation.
  if (questionNum == 0) {
    answer= 'Hello ' + input + ' :-)';// output response
    waitTime = 1000;
    question = 'Press the number 1';          
  } else if (questionNum == 1) {
    if (input === '1' || input === 1){
      answer = 'Perfect!';
      waitTime = 1000;
      question = 'Press the number 2';
    } else {
      answer = 'Please enter the right number...'; // load next question
      questionNum--;
      waitTime = 2000;
    }
  } else if (questionNum == 2) {
    answer = 'Cool! I have never been to ' + input+'.';
    waitTime = 5000;
    question = 'Whats your favorite color?';
  } else if (questionNum == 3) {
    answer = 'Ok, ' + input+' it is.';
    socket.emit('changeBG', input.toLowerCase());
    waitTime = 5000;
    question = 'Can you still read the font?';
  } else if (questionNum == 4) {
    if (input.toLowerCase() === 'yes' || input === 1){
      answer = 'Perfect!';
      waitTime = 5000;
      question = 'Whats your favorite place?';
    } else if (input.toLowerCase() === 'no' || input === 0){
      socket.emit('changeFont','white'); // We really should look up the inverse of what we said before.
      answer = 'How about now?'
      question = '';
      waitTime = 0;
      questionNum--; // Here we go back in the question number this can end up in a loop!
    } else {
      question = 'Can you still read the font?'; // load next question
      answer = 'I did not understand you. Could you please answer "yes" or "no"?'
      questionNum--;
      waitTime = 5000;
    }
  // load next question
  } else {
    answer= 'I have nothing more to say!';// output response
    waitTime = 0;
    question = '';
  }


  /// We take the changed data and distribute it to the required objects.
  socket.emit('answer',answer);
  setTimeout(timedQuestion, waitTime,socket,question);
  return (questionNum+1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
