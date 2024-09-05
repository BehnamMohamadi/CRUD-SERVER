const notFoundContent = '<h1 style="color: red">404: Not Found!</h1>';

const requestHandler = (
  response,
  content = '',
  contentType = 'text/plain',
  statusCode = 200
) => {
  response.writeHead(statusCode, {
    'Content-Type': contentType
  });

  response.write(content);
  response.end();
};

module.exports = { requestHandler, notFoundContent };
