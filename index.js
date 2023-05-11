// Requires

const fs = require("fs");
const prettier = require("prettier");
const path = require("path")

// Code

class Editor {
    /**
     * @description Initialise the Editor with the filename of the JSON file you want to edit.
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
     * @description Set something as something in your JSON file.
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
    /**
     * @description Get a the value of a certain key out of your JSON file.
     * @param {String} key - The key you want to get the value from.
     * @param {Boolean} [ignore=false] - If you want to ignore the point seperator in your key set this to true!
     * @returns Returns the element you wanted to get or undefined
     */
    get(key, ignore) {
        let json = JSON.parse(fs.readFileSync(this.file, {"encoding": "utf8"}).toString());
        if (ignore === true) {
              return json[key];
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
    /**
     * @description Get the whole JSON object out of the Editor file.
     * @param {Boolean} [stringify=false] - If you would like to get the whole object in stringified set this to true.
     * @returns Returns the whole object out of the JSON file.
     */
    all(stringify) {
        let json = JSON.parse(fs.readFileSync(this.file, {"encoding": "utf-8"}).toString());
        if (stringify === true) {
            return JSON.stringify(json);
        } else {
            return json;
        }
    };
    delete(key, ignore) {
        let json = JSON.parse(fs.readFileSync(this.file, { "encoding": "utf-8" }).toString());
        if (ignore === true) {
            delete json[String(key)];
            fs.writeFile(this.file, prettier.format(JSON.stringify(json), {"parser": "json-stringify"}), () => {return json});
        } else {
            let file = this.file;
            function deleteKey(obj, key) {
                var keys = key.split('.'); // Teile den Key an den Punkten auf

                // Überprüfe, ob das Objekt den ersten Key enthält
                if (obj.hasOwnProperty(keys[0])) {
                    // Überprüfe, ob der Key weitere Punkte enthält
                    if (keys.length > 1) {
                        // Das Objekt enthält weitere verschachtelte Objekte
                        deleteKey(obj[keys[0]], keys.slice(1).join('.'));
                    } else {
                        // Der Key ist der letzte im Pfad, lösche ihn
                        delete obj[keys[0]];
                        fs.writeFile(file, prettier.format(JSON.stringify(json), {"parser": "json-stringify"}), () => {return json});
                    }
                }
            };
            deleteKey(json, key);
        }
    };
    // Array Functions
    /**
     * @description Push a certain value to an array within your JSON.
     * @param {String} key - The key where the array you want the element to push to is located.
     * @param {String} value - The value you would like to push to the end of the array
     * @param {Boolean} [ignore=false] - If you want to ignore the point seperator in your key set this to true!
     * @returns Returns you the whole array with pushed value
     */
    push(key, value, ignore) {
        let json = JSON.parse(fs.readFileSync(this.file, {"encoding": "utf-8"}).toString());
        if (ignore === true) {
            let elem = json[String(key)];
            if (typeof elem === Array) {
                elem.push(value);
                this.set(key, elem, true);
                return elem;
            } else {
                return new Error("TypeError: The path does not lead to an array");
            }
        } else {
            for (var i = 0; i < keys.length; i++) {
                var keys = key.split('.');
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
    /**
     * @description Pop the last value of an array within your JSON.
     * @param {String} key - The key where the array you want the element to pop from is located.
     * @param {*} [ignore=false] - If you want to ignore the point seperator in your key set this to true!
     * @returns Returns you the whole array without the poped value
     */
    pop(key, ignore) {
        let json = JSON.parse(fs.readFileSync(this.file, {"encoding": "utf-8"}).toString());
        if (ignore === true) {
            let elem = json[String(key)];
            if (typeof elem === Array) {
                elem.pop(value);
                this.set(key, elem, true);
                return elem;
            } else {
                return new Error("TypeError: The path does not lead to an array");
            }
        } else {
            for (var i = 0; i < keys.length; i++) {
                var keys = key.split('.');
                if (json && json.hasOwnProperty(keys[i])) {
                    json = json[keys[i]];
                } else {
                    return undefined
                }
            };
            if (typeof json === Array) {
                json.pop(value);
                this.set(key, json, false);
                return json;
            } else {
                return new Error("TypeError: The path does not lead to an array");
            }
        }
    }
    // Number Functions
    /**
     * @description Subtract a value with a subtracting.
     * @param {String} key - The key where the array you want the element to pop from is located.
     * @param {*} [subtracting=1] - The number you want to substract the value behind the key with-
     * @param {*} [ignore=false] - If you want to ignore the point seperator in your key set this to true!
     * @returns Returns the difference of the value and the subtracting
     */
    substract(key, subtracting, ignore) {
        let json = JSON.parse(fs.readFileSync(this.file, {"encoding": "utf-8"}).toString());
        if (ignore === true) {
            let elem = json[String(key)];
            if (typeof elem === Number) {
                if (typeof subtracting === Number) {
                    elem = elem - subtracting;
                } else {
                    elem--;
                };
                this.set(key, elem, true);
                return elem;
            } else {
                return new Error("TypeError: The path does not lead to an array");
            }
        } else {
            for (var i = 0; i < keys.length; i++) {
                var keys = key.split('.');
                if (json && json.hasOwnProperty(keys[i])) {
                    json = json[keys[i]];
                } else {
                    return undefined
                }
            };
            if (typeof json === Number) {
                if (typeof subtracting === Number) {
                    json = json - subtracting;
                } else {
                    json--;
                };
                this.set(key, json, false);
                return json;
            } else {
                return new Error("TypeError: The path does not lead to an array");
            }
        }
    };
};
module.exports = Editor;
// const fs = require('fs-extra');

// class Editor {
//   constructor(filePath, options = {}) {
//     if (!fs.exists(filePath)) {
//         throw new Error(`No such file or directory: ${filePath}`)
//     } else {
//         this.filePath = filePath;
//         this.options = options;
//     }
//   }

//   async read() {
//     const data = await fs.readJSON(this.filePath);
//     return this._ignoreKeys(data);
//   }

//   async set(path, value) {
//     const data = await this.read();
//     this._set(data, path, value);
//     await fs.writeJSON(this.filePath, data, this.options);
//   }

//   async get(path) {
//     const data = await this.read();
//     return this._get(data, path);
//   }

//   async delete(path) {
//     const data = await this.read();
//     this._delete(data, path);
//     await fs.writeJSON(this.filePath, data, this.options);
//   }

//   _ignoreKeys(data) {
//     if (this.options.ignoreKeys) {
//       const keys = this.options.ignoreKeys.split('.');
//       keys.forEach(key => {
//         const [match, index] = key.match(/\[(\d+)\]/) || [];
//         if (match) {
//           data = data.map(item => {
//             item[index] = this._ignoreKeys(item[index]);
//             return item;
//           });
//         } else {
//           data = data[key];
//         }
//       });
//     }
//     return data;
//   }

//   _set(data, path, value) {
//     const keys = path.split('.');
//     let obj = data;
//     keys.forEach((key, index) => {
//       if (index === keys.length - 1) {
//         obj[key] = value;
//       } else {
//         if (!obj[key]) {
//           obj[key] = {};
//         }
//         obj = obj[key];
//       }
//     });
//   }

//   _get(data, path) {
//     const keys = path.split('.');
//     let obj = data;
//     keys.forEach(key => {
//       obj = obj[key];
//     });
//     return obj;
//   }

//   _delete(data, path) {
//     const keys = path.split('.');
//     let obj = data;
//     keys.forEach((key, index) => {
//       if (index === keys.length - 1) {
//         delete obj[key];
//       } else {
//         obj = obj[key];
//       }
//     });
//   }
// }

// module.exports = Editor;