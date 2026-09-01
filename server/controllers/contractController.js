const { ethers } = require("ethers");
const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");

// Minimal Human-Readable ABIs (ethers v5 format)
const counterAbi = [
  "function getCount() view returns (uint256)",
  "function getNAme() view returns (string)",
];

const realEstateAbi = [
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

const escrowAbi = [
  "function getBalance() view returns (uint256)",
  "function isListed(uint256 nftID) view returns (bool)",
  "function purchasePrice(uint256 nftID) view returns (uint256)",
  "function escrowAmount(uint256 nftID) view returns (uint256)",
  "function buyer(uint256 nftID) view returns (address)",
  "function inspectionPassed(uint256 nftID) view returns (bool)",
];

// Helper to initialize read-only JsonRpcProvider
const getProvider = () => {
  const rpcUrl = process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

// GET /api/contract/counter
exports.getCounterState = asyncErrorHandler(async (req, res, next) => {
  const address = process.env.COUNTER_CONTRACT_ADDRESS;
  if (!address) {
    return res.status(503).json({ success: false, message: "COUNTER_CONTRACT_ADDRESS is not configured." });
  }
  const provider = getProvider();
  const contract = new ethers.Contract(address, counterAbi, provider);

  const [count, name] = await Promise.all([
    contract.getCount(),
    contract.getNAme(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      count: count.toString(),
      name,
      contractAddress: address,
    },
  });
});

// GET /api/contract/real-estate/supply
exports.getRealEstateSupply = asyncErrorHandler(async (req, res, next) => {
  const address = process.env.REAL_ESTATE_CONTRACT_ADDRESS;
  if (!address) {
    return res.status(503).json({ success: false, message: "REAL_ESTATE_CONTRACT_ADDRESS is not configured." });
  }
  const provider = getProvider();
  const contract = new ethers.Contract(address, realEstateAbi, provider);

  const totalSupply = await contract.totalSupply();

  res.status(200).json({
    success: true,
    data: {
      totalSupply: totalSupply.toString(),
      contractAddress: address,
    },
  });
});

// GET /api/contract/real-estate/token/:id
exports.getRealEstateToken = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const address = process.env.REAL_ESTATE_CONTRACT_ADDRESS;
  if (!address) {
    return res.status(503).json({ success: false, message: "REAL_ESTATE_CONTRACT_ADDRESS is not configured." });
  }
  const provider = getProvider();
  const contract = new ethers.Contract(address, realEstateAbi, provider);

  const [tokenURI, owner] = await Promise.all([
    contract.tokenURI(id),
    contract.ownerOf(id),
  ]);

  res.status(200).json({
    success: true,
    data: {
      tokenId: id,
      tokenURI,
      owner,
      contractAddress: address,
    },
  });
});

// GET /api/contract/escrow/balance
exports.getEscrowBalance = asyncErrorHandler(async (req, res, next) => {
  const address = process.env.ESCROW_CONTRACT_ADDRESS;
  if (!address) {
    return res.status(503).json({ success: false, message: "ESCROW_CONTRACT_ADDRESS is not configured." });
  }
  const provider = getProvider();
  const contract = new ethers.Contract(address, escrowAbi, provider);

  const balance = await contract.getBalance();

  res.status(200).json({
    success: true,
    data: {
      balanceWei: balance.toString(),
      balanceEth: ethers.utils.formatEther(balance),
      contractAddress: address,
    },
  });
});

// GET /api/contract/escrow/property/:id
exports.getEscrowProperty = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const address = process.env.ESCROW_CONTRACT_ADDRESS;
  if (!address) {
    return res.status(503).json({ success: false, message: "ESCROW_CONTRACT_ADDRESS is not configured." });
  }
  const provider = getProvider();
  const contract = new ethers.Contract(address, escrowAbi, provider);

  const [isListed, price, escrowAmount, buyer, inspectionPassed] = await Promise.all([
    contract.isListed(id),
    contract.purchasePrice(id),
    contract.escrowAmount(id),
    contract.buyer(id),
    contract.inspectionPassed(id),
  ]);

  res.status(200).json({
    success: true,
    data: {
      propertyId: id,
      isListed,
      purchasePriceEth: ethers.utils.formatEther(price),
      escrowAmountEth: ethers.utils.formatEther(escrowAmount),
      buyer,
      inspectionPassed,
      contractAddress: address,
    },
  });
});
