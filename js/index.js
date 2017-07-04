"use strict";

var max = function(a, b) {
  if (a >= b) {
    return a;
  }
  else {
    return b
  };
}

var maxOfThree = function(a, b, c) { 
  var temp = max(a, b);
  var result = max(temp, c);
  return result;
}

var calculateIsVowel = function(char) {
  if (char.length > 1) {
    document.getElementById("resultV").innerHTML = "Character only";
    return;
  }
  //array of vowels
  var vowels = ["a", "e", "i", "o", "u"];
  function isVowel (array, char) {
    return array.some(function(elem) {
      return char === elem;
    });
  }
  
  if (isVowel(vowels, char)) document.getElementById("resultV").innerHTML = "YES";
  else document.getElementById("resultV").innerHTML = "NO";
  
}

var displayResult = function(a, b) {
  var result = max(a, b);
  //window.alert(result);
  document.getElementById("resultDiv").innerHTML = result;
}

var displayMaxOfThree = function(a, b, c) {
  var result = maxOfThree(a, b, c);
  document.getElementById("resultThree").innerHTML = result;
}

var translateText = function(text) {
  
  
}