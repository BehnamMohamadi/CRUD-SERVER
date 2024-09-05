const {
  createServer
} = require("node:http");
const {
  writeFile,
  access,
  constants,
  readFile
} = require("node:fs/promises");
const {
  readFileSync
} = require("node:fs");
const {
  join
} = require("node:path");
const {
  requestHandler,
  notFoundContent
} = require("./modules/requestHandler");

const serverHost = "127.0.0.1";
const serverPort = 3001;

const tableHTML = readFileSync(join(__dirname, "/table/index.html"));
const tableAssetsJS = readFileSync(
  join(__dirname, "/table/javascripts/assets.js")
);
const tableMainJS = readFileSync(join(__dirname, "/table/javascripts/main.js"));
const tablModaltsJS = readFileSync(
  join(__dirname, "/table/javascripts/modal.js")
);

const tableModalCSS = readFileSync(
  join(__dirname, "/table/stylesheets/modal.css")
);
const tableStyleCSS = readFileSync(
  join(__dirname, "/table/stylesheets/style.css")
);
const tableTableCSS = readFileSync(
  join(__dirname, "/table/stylesheets/table.css")
);
const users = readFileSync(join(__dirname, "/users-data.json"))


const server = createServer((request, response) => {
  const {
    method,
    url: pathname
  } = request;

  console.info(`${method} ${pathname}`);

  if (method === "GET") {
    switch (pathname) {
      case "/":
        requestHandler(response, "Root ");
        break;

      case "/home":
        requestHandler(response, "Root Route");
        break;

      case "/table":
        requestHandler(response, tableHTML, "text/html");
        break;

      case "/users-data":
        requestHandler(response, users, "application/json");
        break;

      case "/modal.css":
        requestHandler(response, tableModalCSS, "text/css");
        break;
      case "/style.css":
        requestHandler(response, tableStyleCSS, "text/css");
        break;
      case "/table.css":
        requestHandler(response, tableTableCSS, "text/css");
        break;

      case "/assets.js":
        requestHandler(response, tableAssetsJS, "text/javascript");
        break;
      case "/main.js":
        requestHandler(response, tableMainJS, "text/javascript");
        break;
      case "/modal.js":
        requestHandler(response, tablModaltsJS, "text/javascript");
        break;

      default:
        requestHandler(response, notFoundContent, "text/html", 404);
        break;
    }
  } else if (method === "POST") {
    if (pathname === "/table") {
      const body = []

      request.on("data", (chunk) => {
        body.push(chunk)
      })

      request.on("end", async () => {
        const requestBody = Buffer.concat(body).toString()
        const {
          action,
          uid,
          data
        } = JSON.parse(requestBody)

        const usersAsText = await readFile(
          join(__dirname, '/users-data.json'),
          'utf-8'
        );
        let users = JSON.parse(usersAsText);

        switch (action) {
          case "delete":

            const userIndex = users.findIndex(user => uid === user.uid)
            users = users.toSpliced(userIndex, 1);

            await access(join(__dirname, "./users-data.json"), constants.F_OK)
            await writeFile(join(__dirname, "./users-data.json"), JSON.stringify(users))

            requestHandler(response, JSON.stringify({
                status: 'user deleted',
                data: users
              }),
              'application/json')
            break;

          case "update":

            const userToUpdate = users.find(user => user.uid === uid);
            if (!userToUpdate) {
              return requestHandler(response, JSON.stringify({
                status: 'user not found'
              }), 'application/json', 404);
            }

            for (const input of data) {
              if (input.id === 'uid') {
                userToUpdate[input.id] = Number(input.value);
                continue;
              }
              userToUpdate[input.id] = input.value;
            }

            const updateUserIndex = users.findIndex((user) => user.uid === uid)
            users = users.toSpliced(updateUserIndex, 1, userToUpdate)

            await access(join(__dirname, "./users-data.json"), constants.F_OK)
            await writeFile(join(__dirname, "./users-data.json"), JSON.stringify(users));

            requestHandler(response, JSON.stringify({
                status: 'user updated',
                data: users
              }),
              'application/json');
            break;

          case "create":
            const newUser = {};

            for (const input of data) {
              if (
                input.id === 'uid' &&
                !!users.find((user) => user.uid === Number(input.value))
              ) {
                return requestHandler(response, JSON.stringify({
                  status: 'duplicated uid!'
                }), 'application/json', 404);
              }

              if (input.id === 'uid') {
                newUser[input.id] = Number(input.value);
                continue;
              }

              newUser[input.id] = input.value;
            }

            await access(join(__dirname, "./users-data.json"), constants.F_OK)
            await writeFile(join(__dirname, "./users-data.json"), JSON.stringify(users));

            requestHandler(response, JSON.stringify({
                status: 'user added',
                data: newUser
              }),
              'application/json');
            break;

          default:
            requestHandler(response, "invalid action", "text/plain", 400)
            break;
        }
      })
    }
  } else {
    requestHandler(response, notFoundContent, "text/html", 404);
  }
});

server.listen(serverPort, serverHost, () => {
  console.info(`Listening on ${serverHost}:${serverPort} ...`);
});