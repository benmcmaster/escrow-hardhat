import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
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

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [signerAddress, setSignerAddress] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  window.ethereum.on('accountsChanged', function (accounts) {
    setAccount(accounts[0]);
  })

  useEffect(() => {
    console.log("App: useEffect: account: ", account);
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
      if (signer) {
        setSignerAddress(await signer.getAddress());
      }
    }

    function getEscrows() {
      console.log("App: getEscrows: ");
      //const escrows = JSON.parse(localStorage.getItem('escrows')) || [];
      fetch(process.env.REACT_APP_SERVER_URL)
      .then(response => response.json())
      .then(data => {
        setEscrows(data);
      });
    }

    getEscrows();
    getAccounts();

  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.BigNumber.from(document.getElementById('wei').value);

    // Try to deploy the contract
    try {
      const escrowContract = await deploy(signer, arbiter, beneficiary, value);
      const depositor = await signer.getAddress();

      const escrow = {
        id: escrows.length + 1,
        address: escrowContract.address,
        escrowContract,
        depositor,
        arbiter,
        beneficiary,
        value: value.toString(),
      };
      saveEscrowContract(escrow);
      setEscrows([...escrows, escrow]);

    } catch (e) {
      console.error("Caught error when deploying contract: ", e);
    }
    setLoading(false);
    setOpen(false);
  }

  async function saveEscrowContract({id, address, depositor, arbiter, beneficiary, value}) {
    const response = await fetch(process.env.REACT_APP_SERVER_URL + "/contracts", {
      method: 'POST', 
      mode: 'cors', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({id, address, depositor, arbiter, beneficiary, value, decision: "none"}),
    })
    const responseJson = await response.json();
    console.log(responseJson);
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
            <TextField fullWidth={true} sx={modalFormStyle} id="wei" label="Deposit Amount (in Wei)" variant="standard" />
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
                <TableCell align="left">Value</TableCell>
                <TableCell align="right">Approve/Reject</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {escrows.map((escrow, index) => {
                return <Escrow key={escrow.id} signer={signer} signerAddress={signerAddress} {...escrow} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Container>
  );
}

export default App;
