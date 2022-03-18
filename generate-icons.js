const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { registerFont, createCanvas } = require('canvas');

registerFont(require.resolve('@fortawesome/fontawesome-free/webfonts/fa-regular-400.ttf'), { family: 'Font Awesome 6 Regular' });
registerFont(require.resolve('@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf'), { family: 'Font Awesome 6 Brands' });
registerFont(require.resolve('@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf'), { family: 'Font Awesome 6 Heavy' });


function drawIcon(unicode, style, backgroundColor, iconColor) {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = iconColor;
  ctx.globalAlpha = 1;

  ctx.textBaseline = 'middle';
  ctx.textAlign = "center";

  let fontFamily = 'Font Awesome 6 Free Solid';
  switch (style) {
    case 'regular':
      fontFamily = 'Font Awesome 6 Free Regular';
      break;
    case 'brands':
      fontFamily = 'Font Awesome 6 Brands Regular';
      break;
    case 'solid':
    default:
      fontFamily = 'Font Awesome 6 Free Solid';
      break;
  }

  ctx.font = `180px "${fontFamily}"`;

  const textMetrics = ctx.measureText(unicode);
  const realFontSize = Math.min(180, 180 * ((180 + 5) / textMetrics.width));
  ctx.font = `${realFontSize}px "${fontFamily}"`;

  ctx.fillText(unicode, 128, 128);

  return canvas.toBuffer('image/png');
}

let iconsMetadata = yaml.load(fs.readFileSync(require.resolve('@fortawesome/fontawesome-free/metadata/icons.yml')));

let ALL_ICONS = true;

let backgroundColor = '#000';
let iconColor = '#000';

// set ALL_ICONS = true, or...

let symbol = 'twitch';
let style = 'brands';

if (ALL_ICONS) {
  let outputDir = './streamdeck-fontawesome';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for(const [name, info] of Object.entries(iconsMetadata)) {
    let unicodeIcon = String.fromCodePoint(parseInt(info.unicode, 16));

    for(let style of info.styles) {
      let iconFileName = `${name}.${style}.png`;
      console.log(`Generating ${iconFileName}...`);

      let iconBuffer = drawIcon(unicodeIcon, style, backgroundColor, iconColor);
      fs.writeFileSync(path.join(outputDir, iconFileName), iconBuffer);
    }
  }
} else {
  if(!iconsMetadata.hasOwnProperty(symbol)) {
    let errorMessage =
      'Symbol not found. Results:' +
      '\n' + Object.keys(searchMap).map(k => (`  - ${k}`)).join('\n');
    console.error(errorMessage);
  } else {
    let iconMeta = iconsMetadata[symbol];
    if (iconMeta.styles.find(s => s == style) === undefined) {
      console.log(`Unable to find style '${style}' for symbol '${symbol}'`)
    } else {
      let outName = `${symbol}.${style}.png`;
      console.log(`Generating ${outName}...`);

      let unicodeIcon = String.fromCodePoint(parseInt(iconMeta.unicode, 16));
      let iconBuffer = drawIcon(unicodeIcon, style, backgroundColor, iconColor);

      fs.writeFileSync(outName, iconBuffer);
    }
  }
}