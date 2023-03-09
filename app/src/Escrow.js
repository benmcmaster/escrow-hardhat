import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { ethers } from 'ethers';
import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Chip from '@mui/material/Chip';
import SendIcon from '@mui/icons-material/Send';
import EscrowArtifact from './artifacts/contracts/Escrow.sol/Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

function concatonateAddress(address) {
  return address.substring(0, 6) + "..." + address.substring(38, 42);
}

function convertToEther(_value) {
  const value = ethers.BigNumber.from(_value.toString());
  return ethers.utils.formatEther(value);
}

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

export async function reject(escrowContract, signer) {
  const rejectTxn = await escrowContract.connect(signer).reject();
  await rejectTxn.wait();
}

async function saveContractDecision(id, decision) {
  const response = await fetch(process.env.REACT_APP_SERVER_URL + "/contracts/" + id, {
    method: 'PUT', 
    mode: 'cors', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({decision}),
  })
  const responseJson = await response.json();
  console.log("saveContractDecision: responseJson: ", responseJson);
}

export default function Escrow({
  id,
  address,
  escrowContract,
  depositor,
  arbiter,
  beneficiary,
  value,
  signer,
  signerAddress,
  decision,
})
{
  console.error("Escrow: id: ", id);
  const [status, setStatus] = useState();

  if (!escrowContract) {
    escrowContract = new ethers.Contract(address, EscrowArtifact.abi, provider);
  }

  async function setContractStatus() {
    console.log("setContractStatus: id: ", id);
    const approved = await escrowContract.isApproved();
    const rejected = await escrowContract.isRejected();
    const status = await escrowContract.status();
  
    if (approved || status === "approved") {
      setStatus("approved");
    } else if (rejected || status === "rejected") {
      setStatus("rejected");
    } else {
      setStatus("none");
    }
  }

  setContractStatus();

  async function handleApproveClick(e) {
    e.preventDefault();
    setStatus("approving");
    try {
      await approve(escrowContract, signer);
      setStatus("approved");
    } catch (error) {
      console.error(error);
      setStatus("none");
    }
  }

  async function handleRejectClick(e) {
    e.preventDefault();
    setStatus("rejecting");
    try {
      await reject(escrowContract, signer);
      setStatus("rejected");
    } catch (error) {
      console.error(error);
      setStatus("none");
    }
  }

  return (
    <TableRow
      key={id}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell align="left">{id}</TableCell>
      <TableCell align="left">{concatonateAddress(arbiter)}</TableCell>
      <TableCell align="left">{concatonateAddress(beneficiary)}</TableCell>
      <TableCell align="left">{convertToEther(value)}</TableCell>
      <TableCell align="right">
      {status === "none" &&
        <span>
          <IconButton 
            color="success" 
            aria-label="approve" 
            size="small" 
            onClick={handleApproveClick}
            disabled={signerAddress !== arbiter}
          >
            <ThumbUpIcon/>
          </IconButton>
          <IconButton 
            color="error" 
            aria-label="reject" 
            size="small" 
            onClick={handleRejectClick}
            disabled={signerAddress !== arbiter}
          >
            <ThumbDownIcon/>
          </IconButton>
        </span>
      }
      {status === "approving" &&
        <LoadingButton
          size="small"
          endIcon={<SendIcon />}
          loading={true}
          loadingPosition="end"
          variant="contained"
        >
          <span>Approving</span>
        </LoadingButton>
      }
      {status === "approved" &&
        <Chip label="Approved" color="success" variant="contained" />
      }
      {status === "rejecting" &&
        <LoadingButton
        size="small"
        endIcon={<SendIcon />}
        loading={true}
        loadingPosition="end"
        variant="contained"
      >
          <span>Rejecting</span>
        </LoadingButton>
      }
      {status === "rejected" &&
        <Chip label="Rejected" color="error" variant="outlined" />
      }

      </TableCell>
    </TableRow>
  );
}