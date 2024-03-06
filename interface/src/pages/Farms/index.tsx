import React, { useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useState } from 'react';
import AppBody from '../AppBody'
import { Link } from 'react-router-dom';
import { useWalletModalOpen, useWalletModalToggle } from '../../state/application/hooks';
import { ButtonSecondary } from '../../components/Button'
import { darken, lighten } from 'polished';
import { useTranslation } from 'react-i18next';
import useENSName from '../../hooks/useENSName';
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks';
import { useHasSocks } from '../../hooks/useSocksBalance';
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { TransactionDetails } from '../../state/transactions/reducer';
import { shortenAddress } from '../../utils';
import { AbstractConnector } from '@web3-react/abstract-connector'
import { fortmatic, injected, portis, walletconnect, walletlink } from '../../connectors';
import Identicon from '../../components/Identicon';
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg'
import FortmaticIcon from '../../assets/images/fortmaticIcon.png'
import PortisIcon from '../../assets/images/portisIcon.png'
import { Activity } from 'react-feather'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import styled, { css, keyframes } from 'styled-components'
import Modal from '../../components/Modal';
import { useActionModalToggle, useActiontModalOpen } from '../../state/actionButton/hooks';
import Input from '../../components/NumericalInput';
import { Button } from '../../theme';
import { ethers } from 'ethers';
import ActionModal from '../../components/ActionButton';

export default function Farms() {
  const [accordionOpen, setAccordionOpen] = useState<number | null>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [actionValue, setActionValue] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [inputValue, setInputValue] = useState('');

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

  const AccordionHeader = styled.p`
    font-size: 1rem;
  `;

  const StyledLabel = styled.label`
    cursor: pointer;
    position: relative;
    inline-flex;
    items-center;
    justify-center;
    padding: 0.25rem;
    border-radius: 0.375rem;
    background-color: #1a202c;
  `;

  const AccordionButton = styled.button`
    background-color: #00b5eb;
    color: #fff;
    padding: 0.5rem 1rem;
    margin-left: 0.5rem;
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
    border-radius:10px;
    opacity: ${({ open }) => (open ? '1' : '0')};
    // {animation: ${({ open }) => (open ? fadeIn : fadeOut)} 0.5s ease}
    &:last-child {
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  `;

  const StyledWidthDiv = styled.div`
    width: 200px;
    padding-left: 10px;
    font-weight:bold;
    color : ${({ theme }) => theme.primary1}
  `;

  const StyledContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
  `;

  const StyledLeftColumn = styled.div`
    width: 30%;
    padding-left: 50px;
  `;

  const StyledRightColumn = styled.div`
    width: 100%;
    border: 2px solid ${({ theme }) => (theme.text3)};
    border-radius: 10px;
    padding: 10px 15px;
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

  const StyledButton = styled.button`
    text-align: center;
    margin-top: 15px;
    border-radius: 10px;
    font-size:18px;
    cursor:pointer;
    background: ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.bg1}
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

  const DataContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

  const DataItem = styled.div`
  flex: 0 0 50%; /* Two items per row, adjust as needed */
  margin-bottom: 0.5rem;
`;

  const StyledMobileQuestionMark = styled.span`
  border: 1px solid black;
  border-radius: 50%;
  padding: 0.25rem;
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
`

  const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

  const Web3StatusConnected = styled(Web3StatusGeneric) <{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg2)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg3)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.text1)};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ pending, theme }) => (pending ? darken(0.05, theme.primary1) : lighten(0.05, theme.bg2))};

    :focus {
      border: 1px solid ${({ pending, theme }) => (pending ? darken(0.1, theme.primary1) : darken(0.1, theme.bg3))};
    }
  }
`

  const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

  const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

  const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

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
`
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
`

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
`

  const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

  const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

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
  width: 100%;
  font-size: 17px;
  border: 1px solid gray;
  :hover,
  :focus {
    background-color: ${({ theme }) => (lighten(0.05, theme.bg2))};
  }
`;

  function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
    return b.addedTime - a.addedTime
  }

  const SOCK = (
    <span role="img" aria-label="has socks emoji" style={{ marginTop: -4, marginBottom: -4 }}>
      🧦
    </span>
  )

  function StatusIcon({ connector }: { connector: AbstractConnector }) {
    if (connector === injected) {
      return <Identicon />
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt={''} />
        </IconWrapper>
      )
    } else if (connector === walletlink) {
      return (
        <IconWrapper size={16}>
          <img src={CoinbaseWalletIcon} alt={''} />
        </IconWrapper>
      )
    } else if (connector === fortmatic) {
      return (
        <IconWrapper size={16}>
          <img src={FortmaticIcon} alt={''} />
        </IconWrapper>
      )
    } else if (connector === portis) {
      return (
        <IconWrapper size={16}>
          <img src={PortisIcon} alt={''} />
        </IconWrapper>
      )
    }
    return null
  }
  const actionModalOpen = useActiontModalOpen()
  const toggleActionModal = useActionModalToggle()

  const handleModal = (action: string) => {
    toggleActionModal()
    setActionValue(action)
  }

  const Input = styled.input`
  border: 0;
  border-radius: 10px;
  color: white;
  padding: 20px;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: white;
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
  top:30px;
  right:10px;
  padding: 5px 10px;
  cursor:pointer;
`;



  function Web3StatusInner() {
    const { t } = useTranslation()
    const { account, connector, error } = useWeb3React()

    const { ENSName } = useENSName(account ?? undefined)

    const allTransactions = useAllTransactions()

    const sortedRecentTransactions = useMemo(() => {
      const txs = Object.values(allTransactions)
      return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
    }, [allTransactions])

    const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)

    const hasPendingTransactions = !!pending.length
    const hasSocks = useHasSocks()
    const toggleWalletModal = useWalletModalToggle()

    if (account) {
      return (
        // <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
        //   {hasPendingTransactions ? (
        //     <RowBetween>
        //       <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
        //     </RowBetween>
        //   ) : (
        //     <>
        //       {hasSocks ? SOCK : null}

        //     </>
        //   )}
        //   {/* {!hasPendingTransactions && connector && <StatusIcon connector={connector} />} */}
        // </Web3StatusConnected>
        <ActionButtonContainer>
          <ButtonContainer>
            <ActionButton onClick={() => handleModal('Stack')}>Stack</ActionButton>
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
    const address = '0xc8cD058Cb7B46fe9e2d12cF23Add61434Bad9d30';
    const getBalance = async () => {
      try {
        // Initialize ethers provider using MetaMask
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        // Fetch balance
        const balanceWei = await provider.getBalance(address);
        // Convert balance from Wei to Ether
        const formattedBalance = ethers.utils.formatEther(balanceWei);
        console.log(formattedBalance);

        setBalance(formattedBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance("0");
      }
    };

    getBalance();
  }, [address]);


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

  console.log('Current window width:', windowWidth);

  const walletModalOpen = useWalletModalOpen()

  const handleMaxClick = () => {
    setInputValue(balance);

  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Set focus to Max button after input change
  };

  const handleCloseDialog = () =>{
    setInputValue('')
    toggleActionModal()
  }

  function getModalContent() {
    return (
      <UpperSection>
        <CloseIcon onClick={toggleActionModal}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow>{actionValue}</HeaderRow>

        {actionValue === 'Harvest' ?
          <ContentWrapper>
            <RewardRow>Availabel Reward :</RewardRow>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ActionButton>{actionValue}</ActionButton>
            </div>
          </ContentWrapper>
          :
          <ContentWrapper>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button>Availabel : {Number(balance).toFixed(5)}</Button>
            </div>
            {/* <Input placeholder="Enter something..." /> */}
            <FormWrapper>
              <MaxButton onClick={handleMaxClick}>Max</MaxButton>
              <StyledInput placeholder={`Enter ${actionValue} Amount`} value={inputValue} onChange={handleChange} />
            </FormWrapper>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ActionButton>{actionValue}</ActionButton>
            </div>
          </ContentWrapper>}
      </UpperSection>
    )
  }

  return (
    <Container>
      {/* <AccordionHeader>FILTER BY</AccordionHeader>
        <StyledLabel className="themeSwitcherTwo  inline-flex  select-none  rounded-xl p-1">
          <input type="checkbox" className="sr-only" checked={false} />
          <AccordionButton>Active</AccordionButton>
          <AccordionButton>Inactive</AccordionButton>
        </StyledLabel> */}

      {isMobile ?
        <MobileMainCard>
          <div onClick={() => toggleAccordion(0)}>
            <MobileCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <StyledMobileWidthDiv>CAKE-BNB LP</StyledMobileWidthDiv>

                <StyledMobilePercentageBadge>0.25%</StyledMobilePercentageBadge>
                <div  >
                  {accordionOpen !== 0 ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                </div>
              </div>
              {accordionOpen === 0 && (
                <StyledBlackBorderDiv open={accordionOpen === 0}>
                  <div style={{ marginBottom: '10px' }}>
                    <div>TVL : 0</div>
                    <div>APY : Up to 30.7%</div>
                    <div>Stack Liquidity : $304,961</div>
                    <div>Availabel LP Token : 0.9x</div>
                    <div>Reward Available : OLP</div>
                    <div>Staked Amount : OLP</div>
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
          <hr />
          <div onClick={() => toggleAccordion(1)}>
            <MobileCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <StyledMobileWidthDiv>CAKE-BNB LP</StyledMobileWidthDiv>

                <StyledMobilePercentageBadge>0.25%</StyledMobilePercentageBadge>
                <div  >
                  {accordionOpen !== 1 ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                </div>
              </div>
              {accordionOpen === 1 && (
                <StyledBlackBorderDiv open={accordionOpen === 1}>
                  <DataContainer>
                    <DataItem>
                      <div>Earned: StakeIndex</div>
                      <div>APR: Long-Term</div>
                      <div>Stake Liquidity: StakeIndex</div>
                      <div>Multiplier: Long-Term</div>
                      {/* <div><StyledMobileQuestionMark>?</StyledMobileQuestionMark></div> */}
                    </DataItem>
                    <DataItem>
                      <div>Available: 10</div>
                      <div>StakedReward: 500</div>
                    </DataItem>
                  </DataContainer>
                </StyledBlackBorderDiv>
              )
              }
            </MobileCard>
          </div>
        </MobileMainCard> :
        <Card>
          <AccordionContentWrapper onClick={() => toggleAccordion(0)}>
            <StyledWidthDiv>CAKE-BNB LP</StyledWidthDiv>
            <StyledPercentageBadge >
              0.25%
            </StyledPercentageBadge>
            <StyledTable>
              <thead>
                <tr>
                  <th>TVL</th>
                  <th>APY</th>
                  <th>Stack Liquidity</th>
                  <th>Availabel LP Token</th>
                  <th>Reward Available</th>
                  <th>Staked Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0</td>
                  <td>Up to 30.7%</td>
                  <td>$304,961</td>
                  <td>0.9x</td>
                  <td>OLP</td>
                  <td>OLP</td>
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
          <hr />
          <AccordionContentWrapper onClick={() => toggleAccordion(1)}>
            <StyledWidthDiv>CAKE-BNB LP</StyledWidthDiv>
            <StyledPercentageBadge >
              0.25%
            </StyledPercentageBadge>
            <StyledTable>
              <thead>
                <tr>
                  <th>TVL</th>
                  <th>APY</th>
                  <th>Stack Liquidity</th>
                  <th>Availabel LP Token</th>
                  <th>Reward Available</th>
                  <th>Staked Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0</td>
                  <td>Up to 30.7%</td>
                  <td>$304,961</td>
                  <td>0.9x</td>
                  <td>OLP</td>
                  <td>OLP</td>
                </tr>
              </tbody>
            </StyledTable>
            <div  >
              {accordionOpen !== 1 ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </div>
          </AccordionContentWrapper>
          {accordionOpen === 1 && (
            <StyledBlackBorderDiv open={accordionOpen === 1}>
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
          <hr />
          <AccordionContentWrapper onClick={() => toggleAccordion(2)}>
            <StyledWidthDiv>CAKE-BNB LP</StyledWidthDiv>
            <StyledPercentageBadge >
              0.25%
            </StyledPercentageBadge>
            <StyledTable>
              <thead>
                <tr>
                  <th>TVL</th>
                  <th>APY</th>
                  <th>Stack Liquidity</th>
                  <th>Availabel LP Token</th>
                  <th>Reward Available</th>
                  <th>Staked Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0</td>
                  <td>Up to 30.7%</td>
                  <td>$304,961</td>
                  <td>0.9x</td>
                  <td>OLP</td>
                  <td>OLP</td>
                </tr>
              </tbody>
            </StyledTable>
            <div  >
              {accordionOpen !== 2 ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </div>
          </AccordionContentWrapper>
          {accordionOpen === 2 && (
            <StyledBlackBorderDiv open={accordionOpen === 2}>
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
          {/* { <hr />} */}
        </Card>
      }

      <ActionModal isOpen={actionModalOpen} onDismiss={handleCloseDialog} minHeight={false} maxHeight={90}>
        <Wrapper>{getModalContent()}</Wrapper>
      </ActionModal>


    </Container >
  );
}
