const https = require("https");

module.exports = (config) => {

    return {

        getUrlFor: (imageData) => {
            return new Promise((resolve, reject) => {
                let req = https.request({ 
                    hostname: config.imageServer.host,
                    path: "/upload",
                    method: "POST",
                    headers: {
                        "Content-Length": imageData.length,
                        "X-Secret": config.imageServer.secret
                    }
                }, (res) => {
                    let hash = "";
                    res.on("data", (d) => {
                        hash += d.toString();
                    });
                    res.on("end", () => {
                        hash = JSON.parse(hash);
                        if(res.statusCode !== 200) {
                            reject(hash);
                        } else {
                            resolve(`https://${config.imageServer.host}/${hash.hash}`);
                        }
                    });
                });
                req.on("error", reject);
                req.write(imageData);
                req.end();
            });
        }

    };

};