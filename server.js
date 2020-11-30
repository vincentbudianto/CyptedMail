// load the things we need
const express = require('express');
const app = express();
const port = 8000

// Static file
app.use('/js', express.static(__dirname + '/js'))
app.use('/css', express.static(__dirname + '/css'))
app.use('/bootstrap', express.static(__dirname + '/bootstrap'))
app.use('/font-awesome', express.static(__dirname + '/font-awesome'))

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('', (req, res) => {
    res.render('index')
})

app.listen(port, () => {
    console.log(`App run on port : ${port}`)
});