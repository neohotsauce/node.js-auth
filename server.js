const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("api running");
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
