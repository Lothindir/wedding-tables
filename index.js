import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import { input, number, confirm, select } from '@inquirer/prompts'
import { init, combinator } from './lib/combinator.js';
import { combinations } from 'mathjs';

init();

clear();

console.log(
  chalk.yellow(
    figlet.textSync('Wedding Tables', { horizontalLayout: 'full' })
  )
);

console.log(chalk.green('Welcome to the Wedding Tables!'));

let tables = await getTables();

let desiredLength = await getDesiredLength();
let { errorMargin, canSmaller } = await getOptions();
console.log(errorMargin, canSmaller, tables);


combinator(tables, desiredLength, errorMargin, canSmaller);

let loop = true;

while (loop) {
  const menu = await select({
    message: 'What do you want to do?',
    choices: [
      { name: 'New combination', value: 'new', description: 'Compute the combination with a new desired length' },
      { name: 'Exit', value: 'exit', description: 'Exit the program' },
      { name: 'Change tables', value: 'change_tables', description: 'Change the tables sizes' },
      { name: 'Change options', value: 'change_options', description: 'Change the other options' }
    ]
  });

  switch (menu) {
    case 'new':
      desiredLength = await getDesiredLength();
      console.log(errorMargin, canSmaller, tables);
      combinator(tables, desiredLength, errorMargin, canSmaller);
      break;
    case 'change_tables':
      tables = await getTables();
      break;
    case 'change_options':
      let { errorMargin: nem, canSmaller: ncs } = await getOptions();
      errorMargin = nem;
      canSmaller = ncs;
      break;
    case 'exit':
      process.exit(0);
    default:
      loop = false;
  }
}

async function getDesiredLength() {
  return await number({ message: 'What is the desired total length [cm]?', min: 100, max: 50000, initial: 1000, float: false });
}

async function getTables() {
  const nbDifferentTables = await number({ message: 'How many different tables do you want to create?', min: 2, max: 10, initial: 2, float: false });
  let tables = [];
  for (let i = 0; i < nbDifferentTables; i++) {
    const tableLength = await number({ message: `Table ${i + 1}: What is the length of the table? [cm]`, min: 100, max: 500, initial: 200, float: false });
    tables.push(tableLength);
  }
  return tables.sort((a, b) => a - b);
}

async function getOptions() {
  const errorMargin = await number({ message: 'What is the length margin allowed [cm]?', min: 0, max: 500, float: false, default: 0 });
  const canSmaller = await confirm({ message: 'Can the total length be smaller than the desired length?', default: false, });

  return { errorMargin, canSmaller };
}