import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { ethers } from 'ethers';
import LoadingButton from '@mui/lab/LoadingButton';
import Chip from '@mui/material/Chip';
import SendIcon from '@mui/icons-material/Send';

function concatonateAddress(address) {
  return address.substring(0, 6) + "..." + address.substring(38, 42);
}

function convertToEther(_value) {
  const value = ethers.BigNumber.from(_value.toString());
  return ethers.utils.formatEther(value);
}

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  signerAddress,
  decision,
  handleApproveClick,
  handleRejectClick,
})
{

  console.log("Escrow: ", address, arbiter, beneficiary, value, signerAddress, decision);
  return (
    <TableRow
      key={address}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell align="left">{concatonateAddress(address)}</TableCell>
      <TableCell align="left">{concatonateAddress(arbiter)}</TableCell>
      <TableCell align="left">{concatonateAddress(beneficiary)}</TableCell>
      <TableCell align="left">{convertToEther(value)}</TableCell>
      <TableCell align="right">
      {decision === "none" &&
        <span>
          <IconButton 
            color="success" 
            aria-label="approve" 
            size="small" 
            onClick={(e) => {
              e.preventDefault();
              handleApproveClick(address);
            }}
            disabled={signerAddress !== arbiter}
          >
            <ThumbUpIcon/>
          </IconButton>
          <IconButton 
            color="error" 
            aria-label="reject" 
            size="small"
            onClick={(e) => {
              e.preventDefault();
              handleRejectClick(address);
            }}
            disabled={signerAddress !== arbiter}
          >
            <ThumbDownIcon/>
          </IconButton>
        </span>
      }
      {decision === "approving" &&
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
      {decision === "approved" &&
        <Chip label="Approved" color="success" variant="contained" />
      }
      {decision === "rejecting" &&
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
      {decision === "rejected" &&
        <Chip label="Rejected" color="error" variant="outlined" />
      }

      </TableCell>
    </TableRow>
  );
}