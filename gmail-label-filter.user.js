// ==UserScript==
// @name         Gmail Label Filter
// @namespace    http://mattmolo.com/
// @version      0.2
// @description  Filter by labels in gmail
// @author       Matt Molo
// @match        https://mail.google.com/mail/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    const CSS_ID = "labels-css";
    const BUTTON_CONTAINER_ID = "labels-buttons";
    const BUTTON_CLASS = "labels-button";

    const GMAIL_LABEL_CLASS = "av";
    const GMAIL_MAIN_CONTAINER_ID = ":5";
    const GMAIL_INPUT_ID = "gb_bf";
    const GMAIL_SEARCH_ID = "gb_df";

    const NO_LABEL_TEXT = "None";
    const NO_LABEL_SEARCH_TERM = "-has:userLabels";

    const CSS_STYLING = `
        #${BUTTON_CONTAINER_ID} {
            min-height: 28px;
        }
        .${BUTTON_CLASS} {
            border: none;
            margin: 5px 10px 5px 0px;
            font-size: .75rem;
            letter-spacing: .3px;
            line-height: .75rem;
            height: 18px;
            border-radius: 4px
        }
        .${BUTTON_CLASS}:hover {
            cursor: pointer;
            outline: none;
            /* Turn button darker on active */
            box-shadow: inset 0 0 0 99999px rgba(0,0,0,0.1);
        }
        .${BUTTON_CLASS}:active {
            /* Turn button whiter on active */
            box-shadow: inset 0 0 0 99999px rgba(255,255,255,0.2);
        }
    `;

    function isIn(array, text) {
        for (let element of array) {
            if (element.text === text) {
                return true;
            }
        }

        return false;
    }

    function addStyle() {
        let cssStyle = document.getElementById(CSS_ID);
        if (!cssStyle) {
            cssStyle = document.createElement("style");
            cssStyle.type = "text/css";
            cssStyle.id = CSS_ID;
            cssStyle.innerHTML = CSS_STYLING;
            let head = document.getElementsByTagName("head")[0];
            head.appendChild(cssStyle);
        }
    }

    function toSearchTerm(labelName) {
        if (labelName === NO_LABEL_TEXT) {
            return NO_LABEL_SEARCH_TERM;
        }

        labelName = labelName.replace("/", "-");
        labelName = labelName.replace(" ", "-");
        labelName = labelName.toLowerCase();
        return `label:${labelName}`;
    }

    function createLabels() {
        addStyle();

        let labels = [].slice.call(
            document.getElementsByClassName(GMAIL_LABEL_CLASS)
        );
        let list = [];

        let input = document.getElementsByClassName(GMAIL_INPUT_ID)[0]

        for (var i = 0; i < labels.length; i++) {
            if (
                !isIn(list, labels[i].innerHTML) &&
                labels[i].innerHTML !== "Inbox" &&
                labels[i].offsetParent !== null &&
                input.value
                    .toLowerCase()
                    .indexOf(toSearchTerm(labels[i].innerHTML)) < 0
            ) {
                list.push({
                    text: labels[i].innerHTML,
                    color: labels[i].style.color,
                    backgroundColor: labels[i].parentElement.style.borderColor
                });
            }
        }

        list = list.sort((a, b) => {
            return a.text.localeCompare(b.text);
        });

        if (list.length > 0) {
            list.push({
                text: NO_LABEL_TEXT,
                color: '#ffffff',
                backgroundColor: '#ff0000'
            });
        }

        let div = document.getElementById(BUTTON_CONTAINER_ID);

        if (!div) {
            div = document.createElement("div");
            let parent = document.getElementById(GMAIL_MAIN_CONTAINER_ID)
                .parentElement;
            parent.insertBefore(div, parent.children[1]);
            div.id = BUTTON_CONTAINER_ID;
        }

        div.innerHTML = "";

        let buttons = list.map(label => {
            let button = document.createElement("button");
            button.innerHTML = label.text;
            button.style.color = label.color;
            button.style.backgroundColor = label.backgroundColor;
            button.classList = [BUTTON_CLASS];

            let searchTerm = toSearchTerm(label.text);

            button.onclick = function() {
                if (
                    input.value === "" &&
                    location.href.indexOf("#inbox") >= 0
                ) {
                    input.value = "in:inbox ";
                }

                if (input.value.toLowerCase().indexOf(searchTerm) < 0) {
                    input.value += searchTerm;
                }

                document.getElementsByClassName(GMAIL_SEARCH_ID)[0].click();
            };
            return button;
        });

        for (let button of buttons) {
            div.append(button);
        }
    }

    window.addEventListener("popstate", () => {
        let div = document.getElementById(BUTTON_CONTAINER_ID);
        if (div) div.innerHTML = "";
        createLabels();
        setTimeout(createLabels, 100);
        setTimeout(createLabels, 500);
        setTimeout(createLabels, 1000);
    });

    const pushUrl = href => {
        history.pushState({}, "", href);
        window.dispatchEvent(new Event("popstate"));
    };
})();
