(function () {
  var button = document.querySelector("[data-read-aloud]");
  var content = document.querySelector("[data-readable-post]");

  if (!button || !content) {
    return;
  }

  var label = button.querySelector("[data-read-label]");
  var status = document.querySelector("[data-read-status]");
  var canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var utterance = null;

  if (!canSpeak) {
    button.hidden = true;
    return;
  }

  function setState(text, pressed, statusText) {
    var ariaLabels = {
      Listen: "Read this post aloud",
      Pause: "Pause reading",
      Resume: "Resume reading"
    };

    if (label) {
      label.textContent = text;
    }

    button.setAttribute("aria-label", ariaLabels[text] || text);
    button.setAttribute("aria-pressed", pressed ? "true" : "false");

    if (status) {
      status.textContent = statusText || "";
    }
  }

  function postText() {
    var title = document.querySelector(".post-header h1");
    var clone = content.cloneNode(true);
    var sourceTrail = Array.prototype.find.call(clone.querySelectorAll("h2"), function (heading) {
      return heading.textContent.trim().toLowerCase() === "source trail";
    });

    if (sourceTrail) {
      var node = sourceTrail.nextSibling;
      while (node && !(node.nodeType === 1 && node.tagName.toLowerCase() === "h2")) {
        var next = node.nextSibling;
        node.parentNode.removeChild(node);
        node = next;
      }
      sourceTrail.parentNode.removeChild(sourceTrail);
    }

    return [title ? title.textContent : "", clone.innerText || clone.textContent || ""]
      .join(". ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function reset() {
    utterance = null;
    setState("Listen", false, "");
  }

  button.addEventListener("click", function () {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setState("Resume", true, "Paused");
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState("Pause", true, "Reading");
      return;
    }

    var text = postText();
    if (!text) {
      return;
    }

    window.speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = document.documentElement.lang || "en";
    utterance.rate = 0.95;
    setState("Pause", true, "Reading");
    utterance.onstart = function () {
      setState("Pause", true, "Reading");
    };
    utterance.onend = reset;
    utterance.onerror = reset;
    window.speechSynthesis.speak(utterance);
  });

  window.addEventListener("beforeunload", function () {
    window.speechSynthesis.cancel();
  });
})();
