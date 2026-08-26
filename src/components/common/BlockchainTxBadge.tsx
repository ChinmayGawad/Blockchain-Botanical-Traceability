import React, { useState } from 'react';
import { Blocks, ExternalLink } from 'lucide-react';
import { TransactionViewerModal } from '../blockchain/TransactionViewerModal';
import { BlockchainTransaction } from '../../types';
import { useBlockchain } from '../../context/BlockchainContext';

interface BlockchainTxBadgeProps {
  txHash: string;
  short?: boolean;
  className?: string;
}

export const BlockchainTxBadge: React.FC<BlockchainTxBadgeProps> = ({
  txHash,
  short = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { transactions } = useBlockchain();

  // Find corresponding transaction or generate simulated view
  const tx: BlockchainTransaction = transactions.find(t => t.txId === txHash) || {
    txId: txHash,
    blockNumber: 10450 + Math.floor(Math.random() * 200),
    timestamp: new Date().toISOString(),
    stage: 'STATE_TRANSITION',
    action: 'chaincode:InvokeBotanicalContract()',
    actor: 'Authorized Stakeholder Node',
    actorRole: 'FARMER',
    payloadHash: '0x' + txHash.substring(2).split('').reverse().join(''),
    endorsingPeers: ['peer0.org1.florachain.org', 'peer0.org2.florachain.org'],
    channelName: 'botanical-provenance-channel',
    chaincode: 'botanical-contract-v2.1',
  };

  const displayText = short
    ? `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`
    : txHash;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 font-mono text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 px-2 py-0.5 rounded-md transition-all group shadow-2xs ${className}`}
        title="View Hyperledger Fabric Transaction Details"
      >
        <Blocks size={12} className="text-emerald-600 group-hover:rotate-12 transition-transform" />
        <span className="font-semibold">{displayText}</span>
        <ExternalLink size={10} className="text-emerald-500 opacity-60 group-hover:opacity-100" />
      </button>

      <TransactionViewerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        transaction={tx}
      />
    </>
  );
};
