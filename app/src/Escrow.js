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

function concatonateAddress(address) {
  return address.substring(0, 6) + "..." + address.substring(38, 42);
}

function convertToEther(value) {
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
}) {
  const [status, setStatus] = useState("None");

  async function handleApproveClick(e) {
    e.preventDefault();
    setStatus("Approving");
    try {
      await approve(escrowContract, signer);
      setStatus("Approved");
    } catch (error) {
      console.error(error);
      setStatus("None");
    }
  }

  async function handleRejectClick(e) {
    e.preventDefault();
    setStatus("Rejecting");
    try {
      await reject(escrowContract, signer);
      setStatus("Rejected");
    } catch (error) {
      console.error(error);
      setStatus("None");
    }
  }

  return (
    <TableRow
      key={address}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell align="left">{id}</TableCell>
      <TableCell align="left">{concatonateAddress(arbiter)}</TableCell>
      <TableCell align="left">{concatonateAddress(beneficiary)}</TableCell>
      <TableCell align="left">{convertToEther(value)}</TableCell>
      <TableCell align="right">
      {status === "None" &&
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
      {status === "Approving" &&
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
      {status === "Approved" &&
        <Chip label="Approved" color="success" variant="contained" />
      }
      {status === "Rejecting" &&
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
      {status === "Rejected" &&
        <Chip label="Rejected" color="error" variant="outlined" />
      }

      </TableCell>
    </TableRow>
  );
}
