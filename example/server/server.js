// native dependencies
const fs = require("fs");
const https = require("https");
const path = require("path");
const url = require("url");

// coset server dependency
const coset = require("../../packages/@coset/server");

// create options object
const httpsOptions = {
  cert: fs.readFileSync("localhost.crt"),
  key: fs.readFileSync("localhost.key"),
};

// create https server
const httpsServer = https.createServer(httpsOptions, (req, res) => {
  // parse URL
  const parsedUrl = url.parse(req.url);

  // extract URL path
  let pathname = `.${parsedUrl.pathname}`;

  // maps file extention to MIME types
  const mimeType = {
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".eot": "appliaction/vnd.ms-fontobject",
    ".ttf": "aplication/font-sfnt",
  };

  // 404 on file not found
  if (!fs.existsSync(pathname)) {
    res.statusCode = 404;
    res.end(`File ${pathname} not found!`);

    return;
  }

  // if is a directory, then look for index.html
  if (fs.statSync(pathname).isDirectory()) {
    pathname += "/index.html";
  }

  // try to read file
  try {
    const data = fs.readFileSync(pathname);

    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
    const ext = path.parse(pathname).ext;

    // if the file is found, set Content-type and send data
    res.setHeader("Content-type", mimeType[ext] || "text/plain");
    res.end(data);
  } catch (err) {
    res.statusCode = 500;
    res.end(`Error getting the file: ${err}.`);
    return;
  }
});

// create new coset server
const cosetServer = new coset.Server(httpsServer);

// listen to new connections
cosetServer.on("connection", client => {
  // register serialization strategy
  client.Serialize(5, { floatNumber: 7, integerNumber: 4 });

  // register handler for type
  client.Handler(5, data => console.dir(data));

  // disconnect handler
  client.on("disconnect", () => console.log(client.Id() + " disconnected!"));
});

// listen to server
httpsServer.listen(8443, () => console.log("Listening to Port 8443"));
