// Requires

const fs = require("fs");
const prettier = require("prettier");
const path = require("path")

// Code

class Editor {
    /**
     * 
     * @param {String} file - The path of the file you want to edit. Must be a .json file
     */
    constructor(file) {
        if (fs.existsSync(file)) {
            if (file.includes(".json")) {
                this.file = file;
                fs.readFile(this.file, (err, data) => {
                    if (data == "") {
                        fs.writeFileSync(this.file, "{}");
                    };
                });
            } else {
                throw new Error("FileError: This file isn't a .json file");
            }
        } else {
            throw new Error("FileError: This file doesnt exist or is provided with the wrong directory");
        };
    };
    /**
     * 
     * @param {String} key - The key you want to set the value as.
     * @param {*} value - The value you want to set the key as.
     * @param {Boolean} [ignore=false] - If you want to ignore the point seperator in your key set this to true!
     */
    set(key, value, ignore) {
        if (ignore === true) {
            fs.readFile(this.file, (err, data) => {
                if (!err) {
                    let json = JSON.parse(data.toString());
                    json[key] = value;
                    if (key != "type" && key != "data") {
                        delete json.type;
                        delete json.data;
                    };
                    fs.writeFile(this.file, prettier.format(JSON.stringify(json), {"parser": "json-stringify"}), () => {return value});
                } else {
                    throw new Error(err.message);
                }
            })
        } else {
            fs.readFile(this.file, (err, data) => {
                if (!err) {
                    let json = JSON.parse(data.toString());
                    if (key != "type" && key != "data" && json.type === "Buffer") {
                        delete json.type;
                        delete json.data;
                    };
                    var keys = key.split('.');
                    // Erzeuge die verschachtelten Objekte für jeden Teil des Keys
                    var tempObj = json;
                    for (var i = 0; i < keys.length - 1; i++) {
                        tempObj[keys[i]] = {};
                        tempObj = tempObj[keys[i]];
                    }
                    // Setze den Wert für den letzten Key
                    tempObj[keys[keys.length - 1]] = value;
                    fs.writeFile(this.file, prettier.format(JSON.stringify(json), {"parser": "json-stringify"}), () => {return value});
                }
            })
        }
    };
    get(key, ignore) {
        let json = JSON.parse(fs.readFileSync(this.file, {"encoding": "utf8"}).toString());
        if (ignore === true) {
                console.log("hallo");
        } else {
            var keys = key.split('.'); // Teile den Key an den Punkten auf
            // Das Objekt, aus dem der Wert gelesen werden soll
            // Durchlaufe das verschachtelte Objekt entsprechend dem Key
            for (var i = 0; i < keys.length; i++) {
                if (json && json.hasOwnProperty(keys[i])) {
                    json = json[keys[i]];
                } else {
                    return undefined
                }
            }
            return json;
        }
    };
    all() {
        let json = JSON.parse(fs.readFileSync(this.file, {"encoding": "utf-8"}).toString());
        return json;
    };
    push(key, value, ignore) {
        let json = JSON.parse(fs.readFileSync(this.file, {"encoding": "utf-8"}).toString());
        if (ignore === true) {
            
        } else {
            for (var i = 0; i < keys.length; i++) {
                if (json && json.hasOwnProperty(keys[i])) {
                    json = json[keys[i]];
                } else {
                    return undefined
                }
            };
            if (typeof json === Array) {
                json.push(value);
                this.set(key, json, false);
                return json;
            } else {
                return new Error("TypeError: The path does not lead to an array");
            }
        };
    };
};