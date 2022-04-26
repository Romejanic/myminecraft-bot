import https from "https";
import { Config } from "./conf";

interface HashResponse {
    hash: string;
};

export default function imgServer(config: Config) {

    return {

        getUrlFor: (imageData: string) => {
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
                    let hash: string = "";
                    res.on("data", (d) => {
                        hash += d.toString();
                    });
                    res.on("end", () => {
                        hash = (JSON.parse(hash) as HashResponse).hash;
                        if(res.statusCode !== 200) {
                            reject(hash);
                        } else {
                            resolve(`https://${config.imageServer.host}/${hash}`);
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