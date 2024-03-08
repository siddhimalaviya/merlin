import { ethers } from "ethers";
import { stakeContractABI, taxTokenAbi, LPTokenABI, routerContractABI } from "./ABI";


export const LPTokenAddress = '0x7Ac4C8b8735Fb4AA918aD81f0D9FA7069C9D653f'
export const StakingContractAddress = '0x2C1EB5A23b5D8BeEd8Eb4552cEf92770FdFA602a'
export const TaxTokenAddress = '0x590d42A72612b1DE3000CDB684Ff971Cb7024C1c'
export const DECIMAL = 10 ** 18
export const SECONDS_IN_YEAR = 31536000
export const FIXED_PERCENTAGE = 5
export const routerContractAddress = '0xb3603E81B7CE14404280589BFE4864a618b74D99'
export const WBTCAddress = '0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF'

const provider = new ethers.providers.Web3Provider(window.ethereum);


export const stakecontractInstance = async () => {
    const contract = new ethers.Contract(StakingContractAddress, stakeContractABI, provider.getSigner());
    return contract;
}

export const LPTokenContractInstance = async () => {
    const contract = new ethers.Contract(LPTokenAddress, taxTokenAbi, provider.getSigner());
    return contract;
}

export const rewardTokenInstance = async () => {
    const contract = new ethers.Contract(TaxTokenAddress, stakeContractABI, provider)
    return contract
}

export const getTotalSupply = async () => {
    let contract = await stakecontractInstance()
    let toatalSupply = await contract.toatalSupply()
    return Number(toatalSupply)
}

export const getStakingLiquidity = async () => {
    try {
        console.log("Getting balance of lp token of staking contract...");
        const LPContract = await LPTokenContractInstance()
        const balanceOfLpToken = await LPContract.balanceOf(StakingContractAddress) / DECIMAL
        console.log("Balance of LPToken of Stake Contract : ", Number(balanceOfLpToken));

        console.log("getting Reserve Data from LPToken Contract...");
        const lpContract = new ethers.Contract(LPTokenAddress, LPTokenABI, provider)
        const reserve = await lpContract.getReserves()
        const reserve0 = Number(reserve[0]) / DECIMAL
        const reserve1 = Number(reserve[1]) / DECIMAL
        console.log("Successfully getting reserve data : ");
        console.log("Reserve 0 : ", reserve0);
        console.log("Reserve 1 : ", reserve1)

        console.log("getting total LPToken...");
        const totalLPToken = (await LPContract.totalSupply()) / DECIMAL
        console.log("Total LP token Supply : ", Number(totalLPToken));

        console.log("Calculating reserve0 amount per LPToken...", totalLPToken);
        const reserve0PerLP = reserve0 / totalLPToken
        console.log("Reserve0 per LPToken (1 LP token =) : ", reserve0PerLP);

        console.log("Calculating reserve1 amount per LPToken...");
        const reserve1PerLP = reserve1 / totalLPToken
        console.log("Reserve1 per LPToken (1 LP token =) : ", reserve1PerLP);

        console.log("Getting price of token using getAmountsOut...");
        const routerContract = new ethers.Contract(routerContractAddress, routerContractABI, provider)
        let path = [TaxTokenAddress, WBTCAddress]
        const amountInWei = ethers.utils.parseEther('1');
        const routerAmountData = await routerContract.getAmountsOut(amountInWei, path)
        const BTCPerToken0 = Number(routerAmountData[1]) / DECIMAL
        const BTCPerToken1 = 1
        console.log("BTC per Token0 : ", BTCPerToken0);
        console.log("BTC per Token1 : ", BTCPerToken1);

        console.log("Getting Price of BTC in USD...");
        const USDPerBTC = await fetchPrice()
        console.log("1 BTC to USD : ", USDPerBTC);

        console.log("Calculating token value in USD...");
        const priceInUsdOfToken0 = (BTCPerToken0 * USDPerBTC) * reserve0PerLP
        console.log("Price of token0 in USD (1 LP token = token0 = ? USD): ", priceInUsdOfToken0);
        const priceInUsdOfToken1 = USDPerBTC * reserve1PerLP
        console.log("Price of token1 in USD (1 LP token = token1 = ? USD): ", priceInUsdOfToken1);

        console.log("Calculating total value per LP token...", reserve1PerLP);
        const totalValuePerOneLPToken = (priceInUsdOfToken0) + (priceInUsdOfToken1)
        console.log("Total value of 1 LP token : ", totalValuePerOneLPToken);

        console.log("calculating total value of Liquidity...");
        const totalLiquidityValue = totalValuePerOneLPToken * balanceOfLpToken
        console.log("Total Liquidity value in USD : ", totalLiquidityValue);

        const APYPercentage = await getAPYValue(priceInUsdOfToken0, totalLiquidityValue)
        return { totalLiquidityValue, APYPercentage }
    }
    catch (e) {
        console.log("Error calculating stake Liquidity: ", e);
    }

}

async function getAPYValue(priceInUsdOfToken0, totalLiquidityValue) {
    try {
        console.log("Calculating APY...");
        const contract = await stakecontractInstance()
        const rewardRateData = await contract.rewardRate()
        const rewardRate = Number(rewardRateData) / DECIMAL
        console.log("Reward rate : ", rewardRate);
        const rewardLiquidity = rewardRate * SECONDS_IN_YEAR
        console.log("Reward Liquidity : ", rewardLiquidity);
        const rewardLiquidityInUSD = (rewardLiquidity) * (priceInUsdOfToken0)
        console.log("Reaward Liquidity in USD : ", rewardLiquidityInUSD);
        const APYPercentage = (rewardLiquidityInUSD / (totalLiquidityValue)) * 100
        console.log("APY : ", APYPercentage, "%");
        return APYPercentage
    }
    catch (e) {
        console.log("Error calculating APY.");
    }
}

async function fetchPrice() {
    const url = "https://api.merlinswap.org/api/v1/token_info/price_info/?t=BTC"
    const Prices = await fetch(url);
    const data = await Prices.json();
    const priceOfToken = data.data.BTC
    return priceOfToken
}

export async function stakeToken(account, stakeAmountInEther) {
    try {
        console.log("started staking amount...", stakeAmountInEther);
        const contract = await stakecontractInstance()
        const stakeAMountInWei = ethers.utils.parseEther(stakeAmountInEther)
        const LPContract = await LPTokenContractInstance()
        const allowance = await LPContract.allowance(account, StakingContractAddress)
        const userBalance = await LPContract.balanceOf(account)
        if (Number(stakeAMountInWei) > Number(userBalance)) {
            console.log("Insufficient staking token balance.");
            throw ("Insufficient staking token balance.")
        }
        if (allowance < stakeAMountInWei) {
            await LPContract.approve(StakingContractAddress, stakeAMountInWei)
        }

        console.log("stake amount in wei : ", stakeAMountInWei);
        const stakeTx = await contract.stake(stakeAMountInWei)

        await stakeTx.wait()
        console.log("staking token succsessfuly.");
    }
    catch (e) {
        console.log("Error staking token.", e);
    }
}

export async function unStakeToken(account, UnstakeAmountInEther) {
    try {
        console.log("started Unstaking amount...");
        const contract = await stakecontractInstance()
        const UnstakeAMountInWei = ethers.utils.parseEther(UnstakeAmountInEther)
        const userBalance = await contract.balanceOf(account)
        if (Number(UnstakeAMountInWei) > Number(userBalance)) {
            console.log("Insufficient unstaking token balance of user.");
            throw ("Insufficient unstaking token balance of user.")
        }

        console.log("stake amount in wei : ", UnstakeAMountInWei);
        const UnstakeTx = await contract.withdraw(UnstakeAMountInWei)
        await UnstakeTx.wait()
        console.log("withdraw token succsessfuly.");
    }
    catch (e) {
        console.log("Error withdraw token.", e);
    }
}

export async function harvestToken(account) {
    try {
        console.log("started Unstaking amount...");
        const contract = await stakecontractInstance()
        const userEarned = Number(await contract.earned(account))
        if (userEarned <= 0) {
            console.log("No reward token earned.");
            throw ("No reward token earned.")
        }
        console.log("Reward amount in wei : ", userEarned);
        const harvestTx = await contract.getReward()
        await harvestTx.wait()
        console.log("Withdraw reward token succsessfuly.");
    }
    catch (e) {
        console.log("Error withdraw token.", e);
    }
}