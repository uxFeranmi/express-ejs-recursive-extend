const express = require('express');
// const ejsRenderer = require('../index');
const ejsRenderer = require('ejs-with-layouts');
const path = require('path');

const app = express();
const port = 4000;

app.engine('ejs', ejsRenderer);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('*', (req, res) => {
	res.render('home', {
		name: 'Dear User',
		message: 'This is the home view.',
		pageTitle: 'Welcome',
		footerText: 1334,
	});
});

app.listen(port, () => console.log(`Server listening on port ${port}.`))
