const { config } = require("../../../../lib/config");

module.exports = (req, res) => {
  const redirect = `https://github.com/login/oauth/authorize?` +
    `client_id=${config.github.clientId}` +
    `&scope=${config.github.scopes.join(" ")}`;

  res.redirect(redirect);
};
