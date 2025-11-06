const express = require("express");
const corse = require("cors");
const app = express();
const server = require('http').createServer(app);
const port = 3000;
const mongodb = require("./db");

mongodb().catch((err) => {
 console.log(err)
});


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(corse());

app.use("/api/tasks", require("./route_tasks"));

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
