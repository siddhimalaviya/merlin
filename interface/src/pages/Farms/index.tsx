/* eslint-disable */
import React, { useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useState } from 'react';
import { useWalletModalToggle } from '../../state/application/hooks';
import { ButtonSecondary } from '../../components/Button'
import { darken, lighten } from 'polished';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { Activity } from 'react-feather'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import styled, { css, keyframes } from 'styled-components'
import { useActionModalToggle, useActiontModalOpen } from '../../state/actionButton/hooks';
import ActionModal from '../../components/ActionButton';
import {
  stakecontractInstance ,
  StakingContractAddress ,
  LPTokenContractInstance ,
  getStakingLiquidity ,
  DECIMAL,
  FIXED_PERCENTAGE,
  FIAT_FIXED_PERCENTAGE,
  stakeToken,
  unStakeToken,
  harvestToken,
  BRAND_NAME
  } from './stakeConstant'
import { useActiveWeb3React } from '../../hooks'
import Loader from '../../components/Loader';
import { ethers } from "ethers";

export default function Farms() {

  const [accordionOpen, setAccordionOpen] = useState<number | null>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [actionValue, setActionValue] = useState('');
  const [inputStakeValue, setStakeInputValue] = useState('');
  const [inputUnStakeValue, setUnStakeInputValue] = useState('');

  const { account } = useActiveWeb3React()

  //error states
  const [stakeError ,setStakeError] = useState('')
  const [unStakeError , setUnStakeError] =useState('')
  const [harvestError , setHarvestError] = useState('')
  const [harvestDisable , setHarvestDisable] = useState(true)       
  const [actionButtonEnable , setActionButtonEnable ] = useState(false)
  const [actionError , setActionError ] = useState('')

  //LOadewr state
  const [refreshFlag ,setRefreshFlag] =useState(false)
  const [isLoading , setIsLoading] = useState(false)
  const [isLoading2 , setIsLoading2] = useState(true)
  const [isLoadingW ,setIsLoadingW ] = useState(false)
  
  //data of staking in contract 
  const [totalTokenSupply, setTotalTokenSupply ] = useState(0)
  const [stakedAmountOfToken , setstakedAmountOfToken] = useState(0)
  const [availableReward , setAvailableReward ] = useState(0)
  const [totalLPToken ,setTotalLPToken ] = useState(0)
  const [balanceOfStakingAmount , setBalanceOfStakingAmount] = useState(0)
  const [totalStackLiquidityInUSD ,setTotalStackLiquidityInUSD] = useState(0)
  const [apyPercentage ,setAPYPercentage] = useState(0)

  useEffect(()=>{
    getAllData()
  },[account ,refreshFlag])

  async function getAllData(){
    setIsLoading2(true)
    await getTotalSupplyData()
    await getStakedAmount()
    await getAvailableReward()
    await getTotalLPToken()
    await getBalanceOfStakingAmount()
    await getTotalLiquidityValue()
    setIsLoading2(false)
  }

  async function getTotalSupplyData(){
    try{
      setIsLoading(true)
      const contract = await stakecontractInstance()
      const data = await contract.totalSupply()
      setTotalTokenSupply(Number(data))
    }
    catch(e){
      console.log("Error getting data");
      setIsLoading(false)
    }
    finally{
      setIsLoading(false)
    }
    
  }

  async function getStakedAmount(){
    try{
      setIsLoading(true)
      const contract = await stakecontractInstance()
      const data = await contract.balanceOf(account)
      setstakedAmountOfToken(Number(data))
    }
    catch(e){
      console.log("Error getting data");
      setIsLoading(false)
    }
    finally{
      setIsLoading(false)
    }
  }

  async function getAvailableReward(){
    try{
      setIsLoading(true)
      const contract = await stakecontractInstance()
      const data = await contract.earned(account)
      if(Number(data) <=0)
      {
        setHarvestError('No reward available')
        setHarvestDisable(true)
      }
      else {
        setHarvestError('')
        setHarvestDisable(false)
      }
      setAvailableReward(Number(data))
    }
    catch(e){
      console.log("Error getting data");
      setIsLoading(false)
    }
    finally{
      setIsLoading(false)
    }
  }

  async function getTotalLiquidityValue(){
    try{
      setIsLoading(true)
      const data = await getStakingLiquidity()
      setTotalStackLiquidityInUSD(Number(data?.totalLiquidityValue))
      setAPYPercentage(Number(data?.APYPercentage))
    }
    catch(e){
      console.log("Error getting Liquidity value : ",e);
      setIsLoading(false)
    }
    finally{
      setIsLoading(false)
    }
  }

  async function getTotalLPToken(){
    try{
      setIsLoading(true)
      const contract = await LPTokenContractInstance()
      const data = await contract.balanceOf(StakingContractAddress)
      setTotalLPToken(Number(data))
    }
    catch(e){
      console.log("Error getting data");
      setIsLoading(false)
    }
    finally{
      setIsLoading(false)
    }
  }

  async function getBalanceOfStakingAmount(){
    try{
      setIsLoading(true)
      const contract = await LPTokenContractInstance()
      const data = await contract.balanceOf(account)
      setBalanceOfStakingAmount(Number(data))
    }
    catch(e){
      console.log("Error getting data");
      setIsLoading(false)
    }
    finally{
      setIsLoading(false)
    }
  }

  async function handleStakeToken(amount : any){
    try{
      if(balanceOfStakingAmount < Number(ethers.utils.parseEther(amount)))
      {
        setStakeError('Insufficient balance')
        throw("insufficient balance")
      }
        setStakeError('')
        setIsLoadingW(true)
        await stakeToken(account , amount)
        setRefreshFlag(!refreshFlag)
    }
    catch(e)
    {
      console.log("Error staking token :" ,e);
      setIsLoadingW(false)
    }
    finally{
      setIsLoadingW(false)
    }
  }

  async function handleUnStakeToken(amount : any ){
    try{
      if(stakedAmountOfToken < Number(ethers.utils.parseEther(amount))){
        setUnStakeError('Not enough amount staked.')
        throw("Not enough amount staked.")
      }
      setUnStakeError('')
      setIsLoadingW(true)
      await unStakeToken(account , amount)
      setRefreshFlag(!refreshFlag)
    }
    catch(e)
    {
      console.log("Error unstaking token :" ,e);
      setIsLoadingW(false)
    }
    finally{
      setIsLoadingW(false)
    }
  }

  async function handleHarvestToken(){
    try{
      setIsLoadingW(true)
      if(availableReward <=0){
        throw('No reward available.')
      }
      await harvestToken(account)
      setRefreshFlag(!refreshFlag)
    }
    catch(e)
    {
      console.log("Error withdrawing reward token :" ,e);
      setIsLoadingW(false)
    }
    finally{
      setIsLoadingW(false)

    }
  }
  
  async function handleTogleClose(){
    setStakeInputValue('')
    setUnStakeInputValue('')
    setStakeError('')
    setHarvestError('')
    setUnStakeError('')
    setActionButtonEnable(false)
    toggleActionModal()
  }

//styles 

  const Container = styled.div`
    width:180vh;
    margin:auto;
    @media (max-width: 1440px) {
      width: 160vh; /* Adjust padding for smaller screens */
    }
    @media (max-width: 1024px) {
      width: 150vh; /* Adjust padding for smaller screens */
    }
    @media (max-width: 955px) {
      width: auto; /* Adjust padding for smaller screens */
    }
  `;
 
  const AccordionContentWrapper = styled.div`
    display: flex;
    padding: 1.5rem;
    align-items: center;
    cursor: pointer;
  `;

  const StyledTable = styled.table`
    width: 100%;
    padding-left:40px;

    th {
      padding-left:10px;
      font-size: 12px;
      font-weight:500;
      color: ${({ theme }) => theme.primary1}
    },
    td {
      padding-left:10px
      text-align: center;
      font-weight:500;

    }
  `;

  const Card = styled.div`
    background-color: ${({ theme }) => (theme.bg1)};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-radius: 3rem;
    margin-bottom: 1rem;
  `;

  const StyledPercentageBadge = styled.div`
    border: 1px solid #aaaaaa;
    border-radius: 10px;
    padding: 2px;
  `;

  const fadeIn = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `;

  const fadeOut = keyframes`
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  `;

  const StyledBlackBorderDiv = styled.div<{ open: boolean }>`
  background-color :${({ theme }) => (theme.bg2)}
    padding: 10px;
    border-radius:3rem;
    opacity: ${({ open }) => (open ? '1' : '0')};
    // {animation: ${({ open }) => (open ? fadeIn : fadeOut)} 0.5s ease}
  `;

  const StyledWidthDiv = styled.div`
    width: 200px;
    padding-left: 10px;
    font-weight:bold;
    color : ${({ theme }) => theme.primary1}
  `;

  const StyledFetchFont = styled.div`
    padding-left: 10px;
    font-weight:bold;
    font-size:20px;
    color : ${({ theme }) => theme.primary1}
  `;

  const StyledContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
  
  `;
  
  const StyledRightColumn = styled.div`
    width: 100%;
    border: 2px solid ${({ theme }) => (theme.text3)};
    border-radius: 10px;
    padding: 10px 15px;
    border-radius:3rem
  `;

  const StyledButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
  `;

  const StyledParagraph = styled.p`
    margin-bottom: 0; /* Remove default bottom margin for paragraphs */
    font-weight: bold;
    color:${({ theme }) => (theme.text2)}
  `;

  const StyledMobileWidthDiv = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;

`;

  const StyledMobilePercentageBadge = styled.div`
  border: 1px solid #aaaaaa;
  border-radius: 10px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
`;

  const MobileCard = styled.div`
  background-color: transparent;
  padding:20px;
`;

  const MobileMainCard = styled.div`
  border-radius: 3rem;
  background-color :${({ theme }) => (theme.bg1)}
  width:40rem;
  @media (max-width: 768px) {
    width: 40rem; /* Adjust padding for smaller screens */
  }
  @media (max-width: 695px) {
    width: 35rem; /* Adjust padding for smaller screens */
  }
  @media (max-width: 567px) {
    width: 28rem; /* Adjust padding for smaller screens */
  }
  @media (max-width: 465px) {
    width: 22rem; /* Adjust padding for smaller screens */
  }
  @media (max-width: 425px) {
    width: 18rem; /* Adjust padding for smaller screens */
  }
`;

  const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`;

  const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`;

  const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`;

  const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`;

  const Web3StatusConnect = styled(Web3StatusGeneric) <{ faded?: boolean }>`
  background-color: ${({ theme }) => theme.primary1};
  border: none;
  color: ${({ theme }) => theme.primaryText1};
  font-weight: 500;
  width:30%;
  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
    color: ${({ theme }) => theme.primaryText1};
  }

  ${({ faded }) =>
      faded &&
      css`
      background-color: ${({ theme }) => theme.primary1};
      border: 1px solid ${({ theme }) => theme.primary1};
      color: ${({ theme }) => theme.bg1};

      :hover,
      :focus {
      background-color: ${({ theme }) => theme.primary1};
        border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
        color: ${({ theme }) => darken(0.05, theme.bg1)};
      }
    `}
`;

  const ActionButton = styled(Web3StatusGeneric) <{ faded?: boolean }>`
background-color: ${({ theme }) => theme.primary1};
border: none;
color: ${({ theme }) => theme.bg1};
font-weight: 500;
width:100%;
margin:10px;
:hover,
:focus {
  background-color: ${({ theme }) => theme.primary1};
  font-weight: 500;
  color: ${({ theme }) => theme.bg1};
}

${({ faded }) =>
      faded &&
      css`
    background-color: ${({ theme }) => theme.primary1};
    border: 1px solid ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.bg1};

    :hover,
    :focus {
    background-color: ${({ theme }) => theme.primary1};
      border: 1px solid ${({ theme }) => darken(0.05, theme.primary1)};
      color: ${({ theme }) => darken(0.05, theme.bg1)};
    }
  `}
`;


  const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

  const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

  const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`;

  const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  font-size:18px;
  display:flex;
  justify-content:center;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

  const RewardRow = styled.div`
${({ theme }) => theme.flexRowNoWrap};
padding: 1rem 1rem;
font-weight: 500;
font-size:18px;
color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 1rem;
`};
`

  const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  padding: 1rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

  const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

  const StyledInput = styled.input`
  border-radius: 10px;
  padding: 12px;
  margin: 20px 0px;
  background-color: ${({ theme }) =>  theme.bg1};
  color: ${({ theme }) =>  theme.text1};
  width: 100%;
  font-size: 17px;
  border: 1px solid gray;
  :focus {
    border: none;
  }
`;

// Button styled component
  const Button = styled.div`
  background: ${({ theme }) => (theme.bg3)};
  border: 0;
  border-radius: 7px;
  color:${({ theme }) => (theme.text1)};
  display: flex;
  padding: 5px 10px;
`;

  // Wrapper for form submission
  const FormWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

  const ActionButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;

   ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: center;
  `}
`;

  const ButtonContainer = styled.div`
  display: flex;
  width: 40%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    margin-bottom: 10px;
  `}
`;

  const SingleButtonContainer = styled.div`
  display: flex;
  width: 20%;

   ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `}
`;

  const MaxButton = styled.div`
background: ${({ theme }) => (theme.primary1)};
  border: 0;
  border-radius: 7px;
  color:${({ theme }) => (theme.bg1)};
  position:absolute;
  top:28px;
  right:8px;
  padding: 5px 10px;
  cursor:pointer;
  :focus {
    background-color: ${({ theme }) => (lighten(0.05, theme.bg1))};
  }
`;

 
  function Web3StatusInner() {
    const { t } = useTranslation()
    const { account,  error } = useWeb3React()

    const toggleWalletModal = useWalletModalToggle()

    if (account) {
      return (
        <ActionButtonContainer>
          <ButtonContainer>
            <ActionButton onClick={() => handleModal('Stake')}>Stake</ActionButton>
            <ActionButton onClick={() => handleModal('Unstack')}>Unstack</ActionButton>
          </ButtonContainer>
          <SingleButtonContainer>
            <ActionButton onClick={() => handleModal('Harvest')}>Harvest</ActionButton>
          </SingleButtonContainer>
        </ActionButtonContainer>
      )
    } else if (error) {
      return (
        <Web3StatusError onClick={toggleWalletModal}>
          <NetworkIcon />
          <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
        </Web3StatusError>
      )
    } else {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal} faded={!account}>
            <Text>{t('Connect to a wallet')}</Text>
          </Web3StatusConnect>
        </div>
      )
    }
  }

  const toggleAccordion = (index: number) => {
    setAccordionOpen((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

 
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const isMobilewidth = windowWidth < 956;

    setIsMobile(isMobilewidth);

  }, [windowWidth])

  const actionModalOpen = useActiontModalOpen()
  const toggleActionModal = useActionModalToggle()
  const handleModal = (action: string) => {
    toggleActionModal()
    setActionValue(action)
  }


  const handleMaxClick = (actionValue :any) => {
    if(actionValue === 'Stake')
      setStakeInputValue((balanceOfStakingAmount/DECIMAL).toString());
    else  
      setUnStakeInputValue((stakedAmountOfToken/DECIMAL).toString())

  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>,actionvalue : any) => {
    const inputValue = e.target.value;
    const isNumeric = /^\d*\.?\d*$/.test(inputValue);
    
    if (isNumeric) {
        if (actionvalue === 'Stake')
          {
            setStakeInputValue(inputValue);
            console.log(balanceOfStakingAmount ,Number(ethers.utils.parseEther(inputValue || '0')) ,inputValue);
            
            if(Number(inputValue) > 0)
            {
              if(balanceOfStakingAmount > Number(ethers.utils.parseEther(inputValue)))
              {
                console.log('button enable');
                setActionError('')
                setActionButtonEnable(true)
                
              }
              else{
                console.log('button disable');
                setActionError('Insufficient amount')
                setActionButtonEnable(false)
              }

            }
            else{
              console.log('button disable');
              setActionError('')
              setActionButtonEnable(false)
            }
          } 

        else
        {
          setUnStakeInputValue(inputValue);
          console.log(balanceOfStakingAmount ,Number(ethers.utils.parseEther(inputValue || '0')) ,inputValue);
          
          if(Number(inputValue) > 0)
          {
            if(stakedAmountOfToken >= Number(ethers.utils.parseEther(inputValue)))
            {
              console.log('button enable');
              setActionError('')
              setActionButtonEnable(true)
              
            }
            else{
              console.log('button disable');
              setActionError('Insufficient staked amount')
              setActionButtonEnable(false)
            }

          }
          else{
            console.log('button disable');
            setActionError('')
            setActionButtonEnable(false)
          }
        } 

    }
    
  };

  const handleCloseDialog = () =>{
    setStakeInputValue('')
    toggleActionModal()
  }

  function getModalContent() {
    return (
      <UpperSection>
        <CloseIcon onClick={handleTogleClose}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow>{actionValue}</HeaderRow>

        {actionValue === 'Harvest' ?
          <ContentWrapper>
            <RewardRow>Available Reward :{availableReward/DECIMAL}</RewardRow>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ActionButton disabled={harvestDisable} onClick={()=>handleHarvestToken()}>{!harvestError ?isLoadingW?<Loader stroke={'#000000'}/> : actionValue:harvestError}</ActionButton>
            </div>
          </ContentWrapper>
          :
          <ContentWrapper>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button>Available : {actionValue=== 'Stake' ? (balanceOfStakingAmount/DECIMAL).toFixed(FIXED_PERCENTAGE) :(stakedAmountOfToken/DECIMAL).toFixed(FIXED_PERCENTAGE)}</Button>
            </div>
            <FormWrapper>
              <MaxButton onClick={()=>{handleMaxClick(actionValue)}}>Max</MaxButton>
              <StyledInput placeholder={`Enter ${actionValue} Amount`} value={actionValue ==='Stake'? inputStakeValue : inputUnStakeValue} onChange={(e)=>{handleChange(e,actionValue)}} />
            </FormWrapper>
            {/* <span style={{color:"red" , margin : "10px"}}>{actionValue ==='Stake' ? stakeError : unStakeError}</span> */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ActionButton  disabled={!actionButtonEnable} onClick={()=> {actionValue ==='Stake' ? handleStakeToken(inputStakeValue) : handleUnStakeToken(inputUnStakeValue)} }>{!actionError ? isLoadingW?<Loader stroke={'#000000'}/> : actionValue : actionError}</ActionButton>
            </div>
          </ContentWrapper>}
      </UpperSection>
    )
  }

  return (
    <Container>
    
      {isMobile ?
        
        <MobileMainCard>
          {isLoading2 ?  <>
            <div style={{display:'flex',justifyContent:'center', margin: '10px', padding :'40px'}}>
              <Loader size='80px'/>
            </div>
            <div style={{display:'flex',justifyContent:'center', margin: '10px', padding :'40px'}}>
            <StyledFetchFont>Fetching Data...</StyledFetchFont>
            </div>
           </> : 
          <div onClick={() => toggleAccordion(0)}>
            <MobileCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <StyledMobileWidthDiv>{BRAND_NAME} V2 LP</StyledMobileWidthDiv>

                <StyledMobilePercentageBadge>0.3%</StyledMobilePercentageBadge>
                <div  >
                  {accordionOpen !== 0 ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                </div>
              </div>
              {accordionOpen === 0 && (
                <StyledBlackBorderDiv open={accordionOpen === 0}>
                  <div style={{ margin: '10px' }}>
                    <div style={{ margin: '10px' }}>APY : Up to {account ? parseInt(apyPercentage.toString()) : ''} %</div>
                    <div style={{ margin: '10px' }}>Staked Liquidity : ${account ? totalStackLiquidityInUSD.toFixed(FIAT_FIXED_PERCENTAGE) : ''}</div>
                    <div style={{ margin: '10px' }}>Available LP : {account ? (balanceOfStakingAmount/DECIMAL).toFixed(FIXED_PERCENTAGE): '00'}</div>
                    <div style={{ margin: '10px' }}>Available Reward : {account ?(availableReward /DECIMAL).toFixed(FIXED_PERCENTAGE): '00'}</div>
                    <div style={{ margin: '10px' }}>Staked LP : {account ?(stakedAmountOfToken/DECIMAL).toFixed(FIXED_PERCENTAGE):'00'}</div>
                  </div>
                  <StyledContainer>
                    <StyledRightColumn>
                      <StyledButtonContainer>
                        <StyledParagraph>START FARMING</StyledParagraph>
                        <Web3StatusInner />
                      </StyledButtonContainer>
                    </StyledRightColumn>
                  </StyledContainer>
                </StyledBlackBorderDiv>
              )
              }
            </MobileCard>
          </div>
          }
        </MobileMainCard> :
       
       
       
       <Card>
          {isLoading2 
           ?
           <>
            <div style={{display:'flex',justifyContent:'center', margin: '10px', padding :'40px'}}>
              <Loader size='80px'/>
            </div>
            <div style={{display:'flex',justifyContent:'center', margin: '10px', padding :'40px'}}>
            <StyledFetchFont>Fetching Data...</StyledFetchFont>
            </div>
           </>
          :
          <>
          <AccordionContentWrapper onClick={() => toggleAccordion(0)}>
            <StyledWidthDiv>{BRAND_NAME} V2 LP</StyledWidthDiv>
            <StyledPercentageBadge >
              0.3%
            </StyledPercentageBadge>
            <StyledTable>
              <thead>
                <tr>
                  <th>APY</th>
                  <th>Staked Liquidity</th>
                  <th>Available LP</th>
                  <th>Available Reward</th>
                  <th>Staked LP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Up to {account? parseInt(apyPercentage.toString()):''} %</td>
                  <td>${account ?totalStackLiquidityInUSD.toFixed(FIAT_FIXED_PERCENTAGE): ''}</td>
                  <td>{account ? (balanceOfStakingAmount/DECIMAL).toFixed(FIXED_PERCENTAGE): '00'}</td>
                  <td>{account ?(availableReward/DECIMAL).toFixed(FIXED_PERCENTAGE) : '00'}</td>
                  <td>{account ? (stakedAmountOfToken/ DECIMAL).toFixed(FIXED_PERCENTAGE):'00'}</td>
                </tr>
              </tbody>
            </StyledTable>
            <div  >
              {accordionOpen !== 0 ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </div>
          </AccordionContentWrapper>
          {accordionOpen === 0 && (
            <StyledBlackBorderDiv open={accordionOpen === 0}>
              <StyledContainer>
                <StyledRightColumn>
                  <StyledButtonContainer>
                    <StyledParagraph>START FARMING</StyledParagraph>
                    <Web3StatusInner />
                  </StyledButtonContainer>
                </StyledRightColumn>
              </StyledContainer>
            </StyledBlackBorderDiv>
          )}
          </>}
        </Card>
      }
    
      <ActionModal isOpen={actionModalOpen} onDismiss={handleCloseDialog} minHeight={false} maxHeight={90}>
        <Wrapper>{getModalContent()}</Wrapper>
      </ActionModal>


    </Container >
  );
}
