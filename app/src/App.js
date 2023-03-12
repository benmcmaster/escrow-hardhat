import { ethers } from 'ethers';
import { useEffect } from 'react';
import useState from 'react-usestateref'
import deploy from './deploy';
import Escrow from './Escrow';
import { Button, Container } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import EscrowContract from './artifacts/contracts/Escrow.sol/Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const modalFormStyle = {
  margin: "20px 0px 0px 0px",
}

export async function approve(escrowContract, signer) {
  try {
    const approveTxn = await escrowContract.connect(signer).approve();
    const approveTxReceipt = await approveTxn.wait();
    console.log("approve: approveTxn: ", approveTxn);
    console.log("approve: approveTxReceipt: ", approveTxReceipt);

    // Check the status of the transaction receipt
    if (approveTxReceipt.status === 1) {
      console.log('Transaction succeeded!');

      // Get the status of the contract
      const status = await escrowContract.status();
      console.log("approve: status: ", status);
      if (status === "approved") {
        console.log("approved: status === approved");
      } else {
        console.log('Approve Transaction failed!');
        throw new Error('Approve Transaction Status is incorrect. should be approved, got ' + status + '!');
      }
    } else {
      console.log('Approve Transaction failed!');
      throw new Error('Approve Transaction failed!');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function reject(escrowContract, signer) {
  try {
    const rejectTxn = await escrowContract.connect(signer).reject();
    const rejectTxReceipt = await rejectTxn.wait();
    console.log("reject: rejectTxn: ", rejectTxn);
    console.log("reject: rejectTxReceipt: ", rejectTxReceipt);

    // Check the status of the transaction receipt
    if (rejectTxReceipt.status === 1) {
      console.log('Reject Transaction succeeded!');

      // Get the status of the contract
      const status = await escrowContract.status();
      console.log("reject: status: ", status);
      if (status === "rejected") {
        console.log("reject: status === rejected");
      } else {
        console.log('Reject Transaction failed!');
        throw new Error('Reject Transaction Status is incorrect. should be rejected, got ' + status + '!');
      }
    } else {
      console.log('Reject Transaction failed!');
      throw new Error('Reject Transaction failed!');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function saveContractDecision(address, decision) {
  const response = await fetch(process.env.REACT_APP_SERVER_URL + "/contracts/" + address, {
    method: 'PUT', 
    mode: 'cors', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({decision}),
  })
  const responseJson = await response.json();
  console.log("saveContractDecision: responseJson: ", responseJson);
}

function getContractFromAddress(address, provider) {
  return new ethers.Contract(address, EscrowContract.abi, provider);
}

// async function setContractStatus() {
//   console.log("setContractStatus: id: ", id);
//   const approved = await escrowContract.isApproved();
//   const rejected = await escrowContract.isRejected();
//   const status = await escrowContract.status();

//   if (approved || status === "approved") {
//     setStatus("approved");
//   } else if (rejected || status === "rejected") {
//     setStatus("rejected");
//   } else {
//     setStatus("none");
//   }
// }

async function saveEscrowContract({address, depositor, arbiter, beneficiary, value}) {
  const response = await fetch(process.env.REACT_APP_SERVER_URL + "/contracts", {
    method: 'POST', 
    mode: 'cors', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({address, depositor, arbiter, beneficiary, value, decision: "none"}),
  })
  const responseJson = await response.json();
  console.log(responseJson);
}

function App() {
  const [escrows, setEscrows, escrowsRef] = useState([]);
  // const [account, setAccount] = useState();
  // const [signer, setSigner] = useState();
  const [signerAddress, setSignerAddress] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  async function getAndSetSignerAddress() {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setSignerAddress(address);
  }

  window.ethereum.on('accountsChanged', async function (accounts) {
    console.log("accountsChanged: accounts: ", accounts);
    getAndSetSignerAddress();
  })

  useEffect(() => {
    console.log("App: useEffect: ");
    async function getEscrows() {
      const response = await fetch(process.env.REACT_APP_SERVER_URL);
      let escrows = await response.json();
      console.log("App: getEscrows: ", escrows);
      escrows = escrows.map((escrow) => {
        escrow.handleApproveClick = handleApproveClick;
        escrow.handleRejectClick = handleRejectClick;
        return escrow;
      });
      setEscrows([...escrows]);
    }

    getAndSetSignerAddress();

    getEscrows();

  }, []);

  async function handleApproveClick(address) {
    console.log("handleApproveClick: address: ", address);
    console.log("handleApproveClick: escrows: ", escrows);
    console.log("handleApproveClick: escrowsRef.current: ", escrowsRef.current);
    console.log("handleApproveClick: signerAddress: ", signerAddress);
    const escrowContract = getContractFromAddress(address, provider);
    console.log("handleApproveClick: escrowContract: ", escrowContract);

    const signer = provider.getSigner();
    const escrowsCopy = [...escrowsRef.current];
    const escrow = escrowsCopy.find(escrow => escrow.address === address);
    console.log("handleApproveClick: escrow: ", escrow);
    escrow.decision = "approving";
    setEscrows([...escrowsCopy]);
  
    try {
      await approve(escrowContract, signer);
      escrow.decision = "approved";
    } catch (error) {
      console.error(error);
      escrow.decision = "none";
    }
    saveContractDecision(address, escrow.decision);
    setEscrows([...escrowsCopy]);
  }
  
  async function handleRejectClick(address) {
    const escrowContract = getContractFromAddress(address, provider);
    const signer = provider.getSigner();
    const escrowsCopy = [...escrowsRef.current];
    const escrow = escrowsCopy.find(escrow => escrow.address === address);
    escrow.decision = "rejecting";
    setEscrows([...escrowsCopy]);
    
    try {
      await reject(escrowContract, signer);
      escrow.decision = "rejected";
    } catch (error) {
      console.error(error);
      escrow.decision = "none";
    }
    saveContractDecision(address, escrow.decision);
    setEscrows([...escrowsCopy]);
  }

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const ethValue = document.getElementById('eth').value;
    const weiValue = ethers.utils.parseEther(ethValue.toString());

    // Try to deploy the contract
    try {
      const signer = provider.getSigner();
      const escrowContract = await deploy(signer, arbiter, beneficiary, weiValue);
      const depositor = await signer.getAddress();

      const escrow = {
        address: escrowContract.address,
        depositor,
        arbiter,
        beneficiary,
        value: weiValue.toString(),
        decision: "none",
        handleApproveClick, 
        handleRejectClick,
      };
      saveEscrowContract(escrow);
      setEscrows([...escrows, escrow]);

    } catch (e) {
      console.error("Caught error when deploying contract: ", e);
    }
    setLoading(false);
    setOpen(false);
  }

  return (
    <Container
      maxWidth="false"
      sx={{
        backgroundImage: "linear-gradient(to right top, #051937, #004d7a, #008793, #00bf72, #a8eb12)",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "50px",
      }}>
      <Container maxWidth="md">
        <Typography id="modal-modal-title" variant="h6" component="h2"
          sx={{
            position: "relative",
            float: "left",
            margin: "10px 0px 10px 0px",
            color: "white",
          }}>
          Escrow Contracts
        </Typography>
        <Button variant="contained"
          onClick={handleOpen}
          sx={{
            position: "relative",
            float: "right",
            margin: "8px 0px 8px 0px",
          }}>

          Add Contract
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              New Contract
            </Typography>
            <TextField fullWidth={true} sx={modalFormStyle} id="arbiter" label="Arbiter Address" variant="standard" />
            <TextField fullWidth={true} sx={modalFormStyle} id="beneficiary" label="Beneficiary Address" variant="standard" />
            <TextField fullWidth={true} sx={modalFormStyle} id="eth" label="Deposit Amount (in ETH)" variant="standard" />
            <LoadingButton
              size="small"
              sx={modalFormStyle}
              onClick={(e) => {
                e.preventDefault();
                setLoading(true);
                newContract();
              }}
              endIcon={<SendIcon />}
              loading={loading}
              loadingPosition="end"
              variant="contained"
            >
              <span>Deploy</span>
            </LoadingButton>
          </Box>
        </Modal>
      </Container>
      <Container maxWidth="md">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Contract</TableCell>
                <TableCell align="left">Arbiter</TableCell>
                <TableCell align="left">Beneficiary</TableCell>
                <TableCell align="left">Value (ETH)</TableCell>
                <TableCell align="right">Approve/Reject</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {escrows.map((escrow, index) => {
                return <Escrow key={escrow.address} signerAddress={signerAddress} {...escrow} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Container>
  );
}

export default App;
