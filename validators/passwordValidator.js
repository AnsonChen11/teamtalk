const passwordValidator = (password) => {
    /^[a-zA-Z0-9_]+$/.test(password);
}
module.exports = passwordValidator;