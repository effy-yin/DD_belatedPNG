DD_belatedPNG
=============

A fork of Drew Diller's fantastic [DD_belatedPNG](http://www.dillerdesign.com/experiment/DD_belatedPNG/) IE6 PNG fix.

## About

DD_belatedPNG 解决IE6下的PNG透明问题。

IE6是不支持透明的PNG的。使IE6支持PNG透明的方法有很多,使用IE特有的滤镜、expression、javascript+透明GIF替代等。但是这些方法都有一个缺点,就是不支持CSS中`backgrond-position`与`background-repeat`。

DD_belatedPNG 支持`backgrond-position`与`background-repeat`。同时DD_belatedPNG还支持`a:hover`属性,以及`<img>`。

You can use PNGs as the SRC of an `<IMG/>` element or as a `background-image` property in CSS.

*[DEMO]()*

## How

DD_belatedPNG使用了微软的VML语言进行绘制,而其他多数解决PNG问题的js插件用的是微软的AlphaImageLoader滤镜。

## Usage

```html
<!--[if lte IE 6]>
<script src="DD_belatedPNG_0.0.8a.js" type="text/javascript"></script>
<script type="text/javascript">
DD_belatedPNG.fix('div, ul, img, li, input , a, .png_bg, a:hover');
/* 将 .png_bg 改成你应用了透明PNG的CSS选择器 */
</script>
<![endif]--> 
```
使用a:hover请留意：如果想要用透明PNG作为a:hover时的背景图片，那么代码中需要以"a:hover"来作为选择器。

解决IE6下背景图闪烁的方法
```html
<!–[if IE 6]>
<script type="text/javascript">
// <![CDATA[
if((window.navigator.appName.toUpperCase().indexOf("MICROSOFT")>=0)&&(document.execCommand))
try{
  document.execCommand("BackgroundImageCache", false, true);
}
catch(e){}
// ]]>
</script>
<![endif]–>
```

## Technical Summary

(Based on the normal usage approach)
- Invoking `DD_belatedPNG.fix()` adds a line of CSS to the document via DOM.
- The selector of this CSS is provided by the first argument for `fix`, which should be a string (such as `#content div`).
- The declaration of this CSS is an MSIE-proprietary [behavior](http://msdn.microsoft.com/en-us/library/ms532147.aspx) - basically a Javascript expression bound to elements on the fly, without walking through a NodeList collection.
- The content of the behavior executes a function with each matched element as its sole argument.
- The first duty of this function is to reset its own `style.behavior` to no longer have a value; allowing behaviors to continue unchallenged is a recipe of for CPU-eating disaster.
- The function then examines the element's dimensions, location, and styles using `offsetWidth`, `offsetHeight`, `offsetLeft`, `offsetTop`, and `currentStyle`
- Using the above information, a VML `<DD_belatedPNG:rect/>` node is constructed and prepended (`insertBefore`) to the element.
- The VML node is absolutely positioned to follow behind the element like a lost little puppy. It copies the matched element's `z-index`.
- To support various positioning and repeat background properties, some of the VML element gets a `style.clip` rectangle.

## Known Issues

- You cannot use 'body' as the CSS selector argument for the `fix()` function. The VML is positioned using sibling DOM relationships! You cannot create a previousSibling of `<body>`, so trying to do so fails (badly). As an alternative, you can wrap the contents of the <body> element with a wrapper element, and apply the background style and fix function to that instead. It is not a question of getting it to work, it is a question of performance.
- `<TR>` and `<TD>` elements do not play nicely yet. Do not attempt.
- This script does not address `background-position: fixed`; functionality.
- "Fixed" `<IMG/>` elements must take on `visibility:hidden`;, and thus become unclickable. I see no workaround other than using clear pixel GIF replacements, and that is code that I am not going to write.
- `<INPUT type="image"/>` nodes are not supported. The node with the original PNG SRC must take on `visibility:hidden`;
- The "clickable elements" example boasted in this document may fail when combined with an alpha (opacity) filter. I don't know of a workaround yet.
- Testing for PNG image presence is done by Javascript string search. If you have a URL that doesn't end in .png, you're not in luck. I suppose I could add a 'force' option - let me know if you need it.

