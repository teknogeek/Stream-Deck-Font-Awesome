const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const yargs = require('yargs');
const { registerFont, createCanvas } = require('canvas');

registerFont(require.resolve('@fortawesome/fontawesome-free/webfonts/fa-regular-400.ttf'), { family: 'Font Awesome 6 Regular' });
registerFont(require.resolve('@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf'), { family: 'Font Awesome 6 Brands' });
registerFont(require.resolve('@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf'), { family: 'Font Awesome 6 Free' });

let iconsMetadata = yaml.load(fs.readFileSync(require.resolve('@fortawesome/fontawesome-free/metadata/icons.yml')));

const argv = yargs()
  .parserConfiguration({
    'dot-notation': false,
    'duplicate-arguments-array': false
  })
  .version(false)
  .strict(true)
  .showHelpOnFail(true)
  .alias('help', 'h')
  .option('icon-name', {
    alias: 'n',
    type: 'string',
    describe: 'icon name'
  })
  .option('all', {
    alias: 'A',
    type: 'boolean',
    describe: 'generate all icons'
  })
  .option('icon-style', {
    alias: 's',
    type: 'string',
    choices: ['regular', 'solid', 'brands'],
    describe: 'icon style',
  })
  .option('background-color', {
    alias: 'b',
    demandOption: true,
    type: 'string',
    default: '000000',
    describe: 'background color (hex)'
  })
  .option('icon-color', {
    alias: 'i',
    demandOption: true,
    type: 'string',
    default: 'FFFFFF',
    describe: 'icon color (hex)',
  })
  .option('icon-size', {
    alias: 'z',
    type: 'number',
    default: 256,
    describe: 'icon size',
  })
  .option('output-path', {
    alias: 'o',
    type: 'string',
    describe: 'output folder for icons, or output filename when used with --icon-name. defaults to ./streamdeck-fontawesome-{icon-size} or ./{icon-name}.{icon-style}.png when used with --icon-name',
  })
  .option('force', {
    type: 'boolean',
    describe: 'force output to overwrite any existing files'
  })
  .conflicts('all', 'icon-name')
  .check((argv, options) => {
    let { iconName, all, iconStyle, force, backgroundColor, iconColor, iconSize } = argv

    if (!all && (iconName === undefined || iconName.length === 0)) {
      throw new Error('--icon-name cannot be empty without using --all');
    }

    if (!all && !iconsMetadata.hasOwnProperty(iconName)) {
      throw new Error(`Unknown icon: ${iconName}`);
    }

    if (!backgroundColor.match(/^(?:[a-fA-F0-9]{3}){1,2}$/)) {
      throw new Error('Invalid background color, must be in hex format');
    }

    if (!iconColor.match(/^(?:[a-fA-F0-9]{3}){1,2}$/)) {
      throw new Error('Invalid icon color, must be in hex format');
    }

    if (!all) {
      let iconMeta = iconsMetadata[iconName];
      if (iconStyle === undefined && iconMeta.styles.length === 1) {
        iconStyle = (argv.iconStyle = iconMeta.styles[0]);
      }

      if (iconStyle === undefined) {
        throw new Error(`--icon-style must be provided with --icon-name. Valid styles for '${iconName}': ${iconMeta.styles.join(', ')}`);
      }

      if (iconMeta.styles.find(s => s == iconStyle) === undefined) {
        throw new Error(`Unable to find style '${iconStyle}' for icon '${iconName}'. Valid options: ${iconMeta.styles.join(', ')}`);
      }
    }

    // set default outputPath
    if (argv.outputPath === undefined) {
      argv.outputPath = all ? `./streamdeck-fontawesome-${iconSize}` : `./${iconName}.${iconStyle}.png`;
    }

    let outputPath = (argv.outputPath = path.resolve(path.normalize(argv.outputPath)));

    if (fs.existsSync(outputPath) && !force) {
      throw new Error(`Output path already exists (${outputPath}), please resolve or use --force (WARNING: --force will overwrite any exisiting output files)`);
    }

    if (fs.existsSync(outputPath) && force && fs.lstatSync(outputPath).isDirectory() && !all) {
      throw new Error(`Output path exists but cannot be overwritten because it is a directory`);
    }

    if (fs.existsSync(outputPath) && force && !fs.lstatSync(outputPath).isDirectory() && all) {
      throw new Error('Output path exists but is not a directory');
    }

    return true;
  })
  .parse(process.argv.slice(2));

if (argv.all) {
  if (!fs.existsSync(argv.outputPath)) {
    fs.mkdirSync(argv.outputPath);
  }

  for(let [name, info] of Object.entries(iconsMetadata)) {
    let unicodeIcon = String.fromCodePoint(parseInt(info.unicode, 16));

    for(let style of info.styles) {
      let iconFileName = `${name}.${style}.png`;
      console.log(`Generating ${iconFileName}...`);

      let iconBuffer = drawIcon(unicodeIcon, argv.iconSize, style, argv.backgroundColor, argv.iconColor);
      fs.writeFileSync(path.join(argv.outputPath, iconFileName), iconBuffer);
    }
  }
} else {
  let iconMeta = iconsMetadata[argv.iconName];
  console.log(`Generating ${argv.outputPath}...`);

  let unicodeIcon = String.fromCodePoint(parseInt(iconMeta.unicode, 16));
  let iconBuffer = drawIcon(unicodeIcon, argv.iconSize, argv.iconStyle, argv.backgroundColor, argv.iconColor);

  fs.writeFileSync(argv.outputPath, iconBuffer);
}

function drawIcon(unicode, size, style, backgroundColor, iconColor) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#${backgroundColor}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#${iconColor}`;
  ctx.globalAlpha = 1;

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  let fontFamily = 'Font Awesome 6 Free';
  switch (style) {
    case 'regular':
      fontFamily = 'Font Awesome 6 Regular';
      break;
    case 'brands':
      fontFamily = 'Font Awesome 6 Brands';
      break;
    case 'solid':
    default:
      fontFamily = 'Font Awesome 6 Free';
      break;
  }

  ctx.font = `180px '${fontFamily}'`;

  const textMetrics = ctx.measureText(unicode);
  const realFontSize = Math.min(180, 180 * ((180 + 5) / textMetrics.width));
  ctx.font = `${realFontSize}px '${fontFamily}'`;

  ctx.fillText(unicode, 128, 128);

  return canvas.toBuffer('image/png');
}
