import JSBI from 'jsbi'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  SEPOLIA = 11155111,
  MERLIN = 686868

}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

<<<<<<< HEAD
export const FACTORY_ADDRESS = '0x8389aa7F4a976aA52d5cef8b64e2b43F9E592769'

export const INIT_CODE_HASH = '0x50fbfd0aba24be48bcc112e070c40f8a851dcbcdd910778ccf9a27e71cee9fae'
=======
export const FACTORY_ADDRESS = '0x935D9652dB87A999c0A6b39B3c97755de6f5Be59'

export const INIT_CODE_HASH = '0x1e39d0c25c602bbe58ac6efcc6a103a1ec211559192228ea6c49c28016324bd7'
>>>>>>> master-sub

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}
