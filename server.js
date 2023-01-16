const express = require('express')
const hbs = require("hbs");
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const app = express()
const PORT = 5000

// app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.get('/', (req, res) => {
res.send('hello world')
})
app.listen(PORT, () => {
console.log(`Express is listening on localhost:${PORT}`)
})
