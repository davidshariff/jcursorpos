jCursorPos
==========
<a href="">JCursorPos</a> is a lightweight (2kb minified), cross browser plugin to get the cursor x / y and top / left coordinates in a textarea or input element. Once initialized, the cursor x / y position will be updated on the element's <code>data-*</code> attribute, and optionally passed to a callback function. 
# Getting Started
To use, simply include <code>jquery.jcursorpos.js</code> and do the following:

```javascript
$('textarea').jCursorPos({
      onChange: function(cursor) {
      
          // the source element where the cursor is active
          var el = $(this);
          
          // the x/y of the cursor relative to the document
          console.log(cursor.offset.left);
          console.log(cursor.offset.top);
          
          // the x/y of the cursor relative to the textarea
          console.log(cursor.position.left);
          console.log(cursor.position.top);

      }
});
```

The cursor position relative to the window will be returned, as well as the position of the cursor relative to the inside of the textarea or input element.

# How to use?
A <a href="http://davidshariff.github.io/jcursorpos/">demo</a> is available <a href="http://davidshariff.github.io/jcursorpos/">here</a>. 

An <code>onChange</code> callback is fired everytime the cursor moves, passing a <code>cursor</code> object as a function parameter.
The <code>cursor</code> object contains the following properties:

<table>
<tbody>
  <tr>
    <td rowspan="2" style="text-align:center">offset</td>
    <td style="text-align:center">top</td>
    <td>Y coordinate of the cursor from the document window</td>
  </tr>
  <tr>
    <td style="text-align:center">left</td>
    <td>X coordinate of the cursor from the document window</td>
  </tr>
<tr>
    <td rowspan="2" style="text-align:center">position</td>
    <td align="center" style="text-align:center">top</td>
    <td>Y coordinate of the cursor from the source element</td>
  </tr>
  <tr>
    <td style="text-align:center">left</td>
    <td>X coordinate of the cursor from the source element</td>
  </tr>
</tbody>
</table>

# License
Copyright (c) 2013 David Shariff Licensed under the MIT license.
