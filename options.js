var currentWindowTabs = [];
var allWindowsTabs = [];

function saveAs(blob, fileName) {
  var link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}
// save all tabs in current window and write to .txt file
function saveCurrentWindowTabs() {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    currentWindowTabs = tabs;
    var text = "";
    // print Window saved at with human readable date
    text += "Window saved at " + new Date().toLocaleString() + "\n";
    text +=
      "Number of tabs in current window: " + currentWindowTabs.length + "\n\n";
    for (var i = 0; i < tabs.length; i++) {
      text += tabs[i].url + "\n";
    }
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    // save file as currentWindowTabs-mm-dd-yy.txt
    saveAs(
      blob,
      "currentWindowTabs-" +
        new Date().toLocaleDateString().replace(/\//g, "-") +
        ".txt"
    );
    // close all tabs
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.remove(tabs[i].id);
    }
    document.getElementById("message_line1").innerHTML =
      "Window saved at " + new Date().toLocaleString();
    document.getElementById("message_line2").innerHTML =
      "Number of tabs in current window: " + currentWindowTabs.length;
  });
}

// add click listener to button id "saveCurrentWindow"
document
  .getElementById("saveCurrentWindow")
  .addEventListener("click", saveCurrentWindowTabs);

// open file picker for user to select file and save to variable
function openFilePicker() {
  var input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt";
  input.onchange = function (event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      var text = event.target.result;
      // parse text file into array of urls
      var urls = text.split("\n");
      // remove first two lines of text file
      urls.shift();
      urls.shift();
      // remove last element of array (empty string)
      urls.pop();
      // open each url in new tab
      for (var i = 0; i < urls.length; i++) {
        chrome.tabs.create({ url: urls[i] });
      }
      // create chrome notification with "Tabs restored" message
      chrome.notifications.create("tabsRestored", {
        type: "basic",
        iconUrl: "icon.png",
        title: "Tabs restored",
        message: "Tabs restored from " + file.name,
        priority: 2,
      });
    };
    reader.readAsText(file);
  };
  input.click();
}

document.getElementById("loadTabs").addEventListener("click", openFilePicker);
