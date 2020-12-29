/**
 * DEPRECATED!
 * This was working, but I realized you could stil get the original URL
 * from Discord (therefore exposing my IP address).
 * 
 * I rewrote it as a standalone Heroku app which the bot simply uploads
 * the image data to instead of hosting them itself.
 */

const http = require("http");
const crypto = require("crypto");
const url = require("url");

let cache = {};

function quickHash(str) {
    let hash = crypto.createHash("sha256");
    hash.update(str);
    return hash.digest().toString("base64");
}

// wrote this then realized i could just use the hash :(
// function getUniqueCode() {
//     let flag = true;
//     let code;
//     while(flag) {
//         code = "";
//         for(let i = 0; i < 5; i++) {
//             let rnd = Math.floor(65 + 26 * Math.random());
//             code += String.fromCharCode(rnd);
//         }
//         flag = false;
//         for(let hash in cache) {
//             if(cache[hash].code === code)
//                 flag = true;
//         }
//     }
//     return code;
// }

module.exports = function(config) {

    return {
        start: () => {
            return Promise.resolve().then(() => {
                let server = http.createServer((req, res) => {
                    let hash = url.parse(req.url).path.substring(1);
                    if(cache[hash]) {
                        let imgData = Buffer.from(cache[hash].substring("data:image/png;base64,".length), "base64");
                        res.writeHead(200, "OK", {
                            "Content-Type": "image/png"
                        });
                        res.write(imgData);
                        res.end();
                    } else {
                        res.writeHead(404, "Not Found", {
                            "Content-Type": "application/json"
                        });
                        res.write('{"error":"Invalid hash"}');
                    }
                    res.end();
                });
                server.on("error", (err) => {
                    console.error("[Img] Unexpected error:", err);
                });
                server.listen(config.imageServer.port, () => {
                    console.log("[Img] Image server listening for requests");
                });
            });
        },

        getUrlFor: (image) => {
            let hash = quickHash(image);
            if(cache[hash]) {
                return cache[hash].code;
            }
            cache[hash] = image;
            cache[hash].clear = setTimeout(() => {
                delete cache[hash];
            }, 1000 * 60); // 1 minute
            return `http://${config.imageServer.host}:${config.imageServer.port}/${hash}`;
        }

    };

};