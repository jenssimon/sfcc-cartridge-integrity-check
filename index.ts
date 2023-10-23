import fs from 'node:fs'

import shell from 'shelljs'
import chalk from 'chalk'
import { table, getBorderCharacters } from 'table'


type IntegrityData = {
  [index: string]: string
}

type CartrideIntegrityCheckParams = {
  readOnlyCartridges: string[]
  integrityData: IntegrityData
  customizationProject: boolean
}

type CartridgeIntegrityCheckReturn = {
  checkCartridgeIntegrity: () => void
  generateCartridgeIntegrityDataFile: (filename: string) => void
}


const getDirHashes = (readOnlyCartridges: string[]) => readOnlyCartridges
  .reduce<{ [index: string]: string }>(
  (acc, cartridge) => {
    const res = shell.exec(`git rev-list -1 HEAD -- cartridges/${cartridge}/`, { silent: true })
    acc[cartridge] = res.stdout.trim()
    return acc
  },
  {},
)


const getUncommitted = (cartridge: string) => [
  shell.exec(`git diff --name-only cartridges/${cartridge}/`, { silent: true }),
  shell.exec(`git diff --name-only --cached cartridges/${cartridge}/`, { silent: true }),
]
  .flatMap(({ stdout }) => stdout.trim().split('\n'))
  .filter((line) => !!line.trim())
  .length


const listNotAllowedCommitsForCartridge = (cartridge: string, hash: string) => shell.exec(
  `git log --color --format="%C(auto)%H %Cgreen%aN <%aE> %C(auto)%s" ${hash}..HEAD -- cartridges/${cartridge}/`,
  { silent: true },
).stdout


const checkCartridgeIntegrity = (
  readOnlyCartridges: string[],
  currIntegrityData: IntegrityData,
  customizationProject: boolean,
): void => {
  if (customizationProject) {
    const hashes = getDirHashes(readOnlyCartridges)

    const modifiedCartridges = []
    const uncommittedChanges = []

    const integrityData: { [index: string]: { hash: string, uncommitted: number }} = {}

    Object.entries(hashes).forEach(([cartridge, hash]) => {
      integrityData[cartridge] = {
        hash,
        uncommitted: getUncommitted(cartridge),
      }
    })

    Object.entries(integrityData).forEach(([cartridge, { hash, uncommitted }]) => {
      const ok = hash === currIntegrityData[cartridge]
      const isUncommitted = !!uncommitted

      process.stdout.write(`Integrity for ${cartridge} - ${
        ok ? chalk.bold.green('OK ✅') : chalk.bold.red('FAIL ❌')

        // eslint-disable-next-line sonarjs/no-nested-template-literals
      }${uncommitted ? ` - ${chalk.bold.yellow(`${uncommitted} uncommitted file(s)`)}` : ''}\n`)

      if (!ok) {
        modifiedCartridges.push(cartridge)
        process.stdout.write(`\n${listNotAllowedCommitsForCartridge(cartridge, currIntegrityData[cartridge])}\n`)
      }

      if (isUncommitted) {
        uncommittedChanges.push(cartridge)
      }
    })

    if (modifiedCartridges.length > 0) {
      process.stdout.write(chalk.bold.red('\n🛑 Some read only cartridges are modified!!!\n'))
    }

    if (uncommittedChanges.length > 0) {
      process.stdout.write(chalk.bold.yellow('✋ You have uncommitted changes in read-only cartridge(s)!\n'))
      process.stdout.write(chalk.yellow('\nDo you really want to modify these cartridge(s)?\n'))
    }
  } else {
    // eslint-disable-next-line max-len
    process.stdout.write(chalk.bold.yellow('🙈 Ignoring cartridge integrity check since this is not a customization project.\n'))
  }
}


const generateCartridgeIntegrityDataFile = function (readOnlyCartridges: string[], filename: string) {
  const hashes = getDirHashes(readOnlyCartridges)

  process.stdout.write('Generated hashes for:\n')
  const data: [string, string][] = []
  Object.entries(hashes).forEach(([cartridge, hash]) => {
    data.push([chalk.bold.whiteBright(cartridge), hash])
  })

  process.stdout.write(table(data, {
    border: getBorderCharacters('void'),
    columnDefault: {
      paddingLeft: 0,
      paddingRight: 1,
    },
    drawHorizontalLine: () => false,
  }))

  fs.writeFileSync(filename, `${JSON.stringify(hashes, undefined, 2)}\n`)
}


export = ({
  readOnlyCartridges,
  integrityData,
  customizationProject,
}: CartrideIntegrityCheckParams): CartridgeIntegrityCheckReturn => ({
  checkCartridgeIntegrity: checkCartridgeIntegrity.bind(null, readOnlyCartridges, integrityData, customizationProject),
  generateCartridgeIntegrityDataFile: generateCartridgeIntegrityDataFile.bind(null, readOnlyCartridges),
});
