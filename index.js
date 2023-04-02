var ejs  = require('ejs'),
    path = require('path');


/**
 * Express EJS engine with nested layouts support.
 *
 * This function is the only export for the module, and it's
 * ready to be used as an Express engine.
 *
 * It injects a function named `extend` into the view.
 * The `extend` function takes the rendered content of the current view
 * and passes it into the specified layout as a variable named `content`.
 * So the layout template can render the content of the view wrapped in some boilerplate HTML.
 *
 * If the layout also calls `extend`, then the higher-level layout will be applied recursively.
 * This allows for the creation of nested layouts.
 *
 * Currently, only one layout is supported per file.
 * If `extend` is called more that once in a single file, only the last one will be used.
 *
 * @todo Allow multiple calls to `extend` in the same file,
 * to be applied in the same order they were called.
 *
 * @todo Compare paths between each call in the recursion chain to prevent a circular dependency.
 *
 * @param {string} viewPath - The file path of the view to be rendered.
 * @param {object} _viewData - Object containing variables to be exposed to the template(s).
 * @param {function(Error, string?)} onRenderingCompleted - Callback function used to pass the
 *  rendered HTML to the Express Server after rendering is completed.
 */
function renderEjsWithLayouts(viewPath, _viewData, onRenderingCompleted) {
  var layout = null;
  var viewData = { ..._viewData };

  // Inject the `extend` function into the view.
  viewData.extend = function extendEjsLayout(layoutPath, layoutData = {}) {
    console.log('Called `extend`.');
    if (!layoutPath) throw new Error('Missing filepath for EJS layout to extend.');

    // When `extend` is called, simply store the layout path and the data, then let rendering continue.
    layout = {path: layoutPath, data: layoutData};

    // Return null since no HTML is to be rendered where the `extend` call was placed.
    return null;
  };

  // Render the view, with the `extend` function injected.
  ejs.renderFile(viewPath, viewData, function afterViewRendered(error, renderedHtml) {
    console.log('Rendered a view');
    console.log({ layout });
    if (error) return onRenderingCompleted(error);

    // If `extend` was never called in the view, then we simply pass on the view's rendered HTML.
    if (!layout) return onRenderingCompleted(error, renderedHtml);


    // If `extend` was called...

    // Merge the data passed to `extend` and the initial data passed to the view.
    var layoutData = { ...viewData, ...layout.data};

    // Inject the rendered view into the layout.
    layoutData.content = renderedHtml;

    // Resolve the layout path relative to the view path.
    var layoutPath = layout.path;
    if (!path.extname(layoutPath)) layoutPath += '.ejs';
    layoutPath = path.resolve(path.dirname(viewPath), layoutPath);

    // Render the layout with the rendered content of the view,
    // recursively handling any `extend` call within the layout as well.
    // ejs.renderFile(layout, options, callback);
    console.log('Rendering extended layout');
    renderEjsWithLayouts(layoutPath, layoutData, onRenderingCompleted);
  });
};

module.exports = renderEjsWithLayouts;
