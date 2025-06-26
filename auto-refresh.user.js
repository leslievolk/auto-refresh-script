// ==UserScript==
// @name         Raterhub Task Monitor – Instant Alert + 15s Refresh
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Alerts immediately when "Acquire Task" appears. 2s refresh fallback with countdown box.
// @author       Leslie
// @match        *://*.raterhub.com/*
// @match        *://raterhub.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const REFRESH_INTERVAL = 15; // seconds
    let secondsLeft = REFRESH_INTERVAL;
    let taskFound = false;

    function speak(message) {
        const utterance = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utterance);
    }

    function playAlertSound() {
        const audio = new Audio("https://www.soundjay.com/button/sounds/beep-07.mp3");
        audio.play();
    }

    function notifyUser() {
        playAlertSound("bee");
        speak("Task available!");
        alert("beep");
    }

    function detectTask() {
        const buttons = [...document.querySelectorAll("button, div")];
        return buttons.some(el => el.innerText.trim().toLowerCase() === "acquire task");
    }

    function showCountdownBox() {
        let box = document.getElementById("raterhub-timer");
        if (!box) {
            box = document.createElement("div");
            box.id = "raterhub-timer";
            box.style.position = "fixed";
            box.style.bottom = "10px";
            box.style.right = "10px";
            box.style.padding = "10px 15px";
            box.style.backgroundColor = "#1a1a1a";
            box.style.color = "#fff";
            box.style.fontSize = "16px";
            box.style.borderRadius = "8px";
            box.style.zIndex = "9999";
            box.style.boxShadow = "0 0 8px rgba(0,0,0,0.5)";
            document.body.appendChild(box);
        }
        box.innerText = `Refreshing in ${secondsLeft}s`;
    }

    function startCountdown() {
        const interval = setInterval(() => {
            if (taskFound) {
                clearInterval(interval);
                return;
            }
            secondsLeft--;
            showCountdownBox();
            if (secondsLeft <= 0) {
                clearInterval(interval);
                location.reload();
            }
        }, 1000);
    }

    function monitor() {
        const checkInterval = setInterval(() => {
            if (detectTask()) {
                taskFound = true;
                clearInterval(checkInterval);
                notifyUser();
            }
        }, 2000); // check every 15 seconds
    }

    // Start everything once page loads
    window.addEventListener("load", () => {
        monitor();
        showCountdownBox();
        startCountdown();
    });
})();
