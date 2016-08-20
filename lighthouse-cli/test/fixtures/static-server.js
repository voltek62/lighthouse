
const http = require('http');
const path = require('path');
const fs = require('fs');
const parseURL = require('url').parse;

function requestHandler(request, response) {
  const filePath = parseURL(request.url).pathname;
  const queryString = parseURL(request.url).search;
  const absoluteFilePath = path.join(__dirname, filePath);

  fs.exists(absoluteFilePath, fsExistsCallback);

  function fsExistsCallback(fileExists) {
    if (!fileExists) {
      return sendResponse(404, `404 - File not found. ${absoluteFilePath}`);
    }
    fs.readFile(absoluteFilePath, 'binary', readFileCallback);
  }

  function readFileCallback(err, file) {
    if (err) {
      console.error(`Unable to read local file ${absoluteFilePath}:`, err);
      return sendResponse(500, '500 - Internal Server Error');
    }
    sendResponse(200, file);
  }

  function sendResponse(statusCode, data) {
    const headers = filePath.endsWith('.js') ?
      {'Content-Type': 'text/javascript'} : undefined;
    response.writeHead(statusCode, headers);

    if (queryString && queryString.includes('delay')) {
      response.write('');
      return setTimeout(finishResponse, 2000, data);
    }
    finishResponse(data);
  }

  function finishResponse(data) {
    response.write(data, 'binary');
    response.end();
  }
}

const serverForOnline = http.createServer(requestHandler);
const serverForOffline = http.createServer(requestHandler);

serverForOnline.on('error', e => console.error(e.code, e));
serverForOffline.on('error', e => console.error(e.code, e));

// Listen
serverForOnline.listen(10200);
serverForOffline.listen(10503);
