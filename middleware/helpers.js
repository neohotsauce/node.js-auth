const catchErr = (err, res) => {
  if (err.kind === "ObjectId") {
    return res.status(400).json({ errors: [{ msg: "Post not found" }] });
  }
  return res.status(400).json({ errors: [{ msg: err.message }] });
};

const customErr = (err, res) => {
  return res.status(400).json({ errors: [{ msg: err }] });
};

module.exports = { catchErr, customErr };
