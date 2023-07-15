# EJS With Layouts

Render [EJS][ejs] templates with Nested Layouts. Supports [Express][express] servers.


## Usage
The module is set up for use with express servers.

Assume you have an Express app with a folder structure that looks like this:

```bash
├── server.js
├── views
│   ├── pages
│   │   └── index.ejs
│   │
│   └── layouts
│       ├── head.ejs
│       └── app-shell.ejs
│
├── README.md
├── package.json
└── .gitignore
```

First, set this module's exported function as the view engine for your app's EJS templates.

```js
// server.js
const app = require('express')();
const path = require('path');
const ejsRenderer = require('ejs-with-layouts');

app.engine('ejs', ejsRenderer); // add this line
app.set('view engine', 'ejs');
//...
```

Then in your request handlers, call `res.render()` as you normally would.

```js
// ...
// server.js
app.set('views', path.join(__dirname, 'views'));

app.get('/', function (req, res) {
	res.render('pages/index', {
		name: 'Tinky Winky',
		path: req.path,
	});
});

const port = 3000;
app.listen(port);
```

Finally, in your views, call the `extend` function
to have the view rendered within the layout you specify.

```ejs
<%# views/pages/index.ejs %>

<% extend('../layouts/app-shell', { title: 'Hello, world!' }) %>

<h1>Hello, <%= name || 'World' %>!</h1>
<p>You are here: <i><%= path %></i></p>
```

```ejs
<%# views/layouts/app-shell.ejs %>

<% extend('./head', { name: 'Laa Laa' }) %>

<main>
	<%- content %>
</main>

<footer>
	<address>
		Goodbye, <%= name %>.
		💖, <a href="https://feranmi.dev">Dipsy</a>.
	</address>
</footer>
```

```ejs
<%# views/layouts/head.ejs %>

<!DOCTYPE html>
<html>
	<head>
		<title>
			<%= title %>
		</title>
		<meta name="description" content="Greetings for <%= name %>.">
	</head>
	<body>
		<%- content %>
	</body>
</html>
```

That's all. Now when your server receives a get request
at the root path `/`, it will respond with the following HTML.

```html
<!-- Final Output -->
<!DOCTYPE html>
<html>
	<head>
		<title>
			Hello, world!
		</title>
		<meta name="description" content="Greetings for Laa Laa.">
	</head>

	<body>
		<main>
			<h1>Hello, Tinky Winky!</h1>
			<p>You are here: <i>/</i></p>
		</main>

		<footer>
			<address>
				Goodbye, Tinky Winky.
				💖, <a href="https://feranmi.dev">Dipsy</a>.
			</address>
		</footer>
	</body>
</html>
```

### Passing Data to Layouts
The example above demonstrates how data is passed to all layouts in the chain.
* The data passed when calling `res.render()` will be available to all layouts in the chain.
* Any additional data passed when extending a particular layout will be available within that layout and any higher-level layout it extends, all the way to the top of the chain.
* Values passed when calling `extend()` will override any preexisting value of the same name, and persist further up the chain. This explains why the `name` variable resolved to _"Laa Laa"_ in `head.ejs`, but rendered _"Tinky Winky"_ in the lower two templates.

### Notes:
* The call to `extend()` in your `.ejs` templates can be surrounded with
any combination of (`<%` or `<%-`) and (`%>` or `-%>`), since it does not return a value.
* The `content` variable should always be rendered with **`<%- content %>`** in all layout templates. This prevents the HTML tags from being escaped.
* The signature of `extend` is: `extend(layout[, data])`, where `layout` is a string containing the path to the layout template, and `data` is an object containing additional variables to be made available to the layout template.


## How It Works
This module exports a single function, which can be used to render EJS templates. It is ready to be used as an Express engine. It has the following signature.

```js
/**
 * @param {string} viewPath - The file path of the view to be rendered.
 * @param {object} viewData - Object containing variables to be exposed to the template(s).
 * @param {function(Error, string?)} onRenderingCompleted - Callback function used to pass the
 *  rendered HTML string to the Express Server after rendering is completed.
 */
function renderEjsWithLayouts(viewPath, viewData, onRenderingCompleted) {
  //...
}
```

It injects a function named `extend` into the view.
The `extend` function takes the rendered content of the current view
and passes it into the specified layout as a variable named `content`.
So the layout template can render the content of the view wrapped in some boilerplate HTML.

If the layout also calls `extend`, then the higher-level layout will be applied recursively.
This allows for the creation of nested layouts.

Currently, only one layout is supported per file.
If `extend` is called more that once in a single file, only the last call will be used.

<!-- Edit -->
## License

This project is released under the [MIT license](./LICENSE.txt).


[ejs]: http://ejs.co
[express]: http://expressjs.com
