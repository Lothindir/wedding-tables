import chalk from 'chalk';
import cliProgress from 'cli-progress';
import Gradient from 'javascript-color-gradient';

let progressBar;
let colorGradient;
let marginArray;
let combinations = new Map();
let usedCoefficients = new Set();
let nbRedundantCombinations = 0;
let initialized = false;

/** Initialization */
function init() {
  progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  colorGradient = new Gradient().setColorGradient('#00ff00', '#ff0000').setMidpoint(7).getColors();
  marginArray = [0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 1];
  initialized = true;
}

function combinator(tables, desiredLength, errorMargin, canSmaller) {
  if (!initialized) {
    console.error('You must call init() before calling combinator()');
    return;
  }
  combinations.clear();
  usedCoefficients.clear();
  nbRedundantCombinations = 0;
  const maxTables = Math.ceil(desiredLength / tables[0]);
  const nbPossibleCombinations = Math.pow(maxTables + 1, tables.length);

  console.log(chalk.yellow(`Computing ${nbPossibleCombinations} possible combinations...`));
  progressBar.start(nbPossibleCombinations, 0);

  findCombination(tables, new Array(tables.length).fill(0), 0, desiredLength, errorMargin, maxTables, canSmaller);
  progressBar.stop();
  let combinationsArr = Array.from(combinations).sort((a, b) => a[0] - b[0]);

  console.log(chalk.green(`Found ${combinationsArr.length} optimal combinations (removed ${nbRedundantCombinations} possibilities):`));
  for (let i = 0; i < combinationsArr.length; i++) {
    let line = `${i + 1}:`;
    for (let j = 0; j < tables.length; j++) {
      line += ` ${tables[j]} x ${combinationsArr[i][1][j]},`;
    }
    line += `\b = ${combinationsArr[i][0]} cm`;
    console.log(chalk.hex(colorizeCombination(combinationsArr[i][0], desiredLength))(line));
  }
}

function findCombination(tables, coefficients, currentIndex, desiredLength, margin, maxTables, canSmaller) {
  if (currentIndex === tables.length) {
    if (!usedCoefficients.has(coefficients.join(','))) {
      usedCoefficients.add(coefficients.join(','));
      let totalLength = 0;
      for (let i = 0; i < tables.length; i++) {
        totalLength += tables[i] * coefficients[i];
      }
      if (Math.abs(totalLength - desiredLength) <= margin) {
        if (canSmaller || totalLength >= desiredLength)
          if (!combinations.has(totalLength)) {
            combinations.set(totalLength, [...coefficients]);
          }
          else if (coefficients.reduce((acc, val) => acc + val, 0) < combinations.get(totalLength).reduce((acc, val) => acc + val, 0)) {
            combinations.set(totalLength, [...coefficients]);
          }
          else {
            nbRedundantCombinations++;
          }
      }
    }
    progressBar.increment();
    return;
  }
  for (let i = 0; i <= maxTables; i++) {
    coefficients[currentIndex] = i;
    findCombination(tables, coefficients, currentIndex + 1, desiredLength, margin, maxTables, canSmaller);
  }
}

function colorizeCombination(totalLength, desiredLength) {
  const index = marginArray.findIndex((margin, index) => {
    return totalLength <= desiredLength * (1 + margin) && totalLength >= desiredLength * (1 - margin)
  });
  return colorGradient[index];
}

export { init, combinator };