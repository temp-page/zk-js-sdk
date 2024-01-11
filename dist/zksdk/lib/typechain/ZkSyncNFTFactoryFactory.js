"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZkSyncNFTFactoryFactory = void 0;
const ethers_1 = require("ethers");
class ZkSyncNFTFactoryFactory extends ethers_1.ContractFactory {
    constructor(signer) {
        super(_abi, _bytecode, signer);
    }
    deploy(name, symbol, zkSyncAddress, overrides) {
        return super.deploy(name, symbol, zkSyncAddress, overrides || {});
    }
    getDeployTransaction(name, symbol, zkSyncAddress, overrides) {
        return super.getDeployTransaction(name, symbol, zkSyncAddress, overrides || {});
    }
    attach(address) {
        return super.attach(address);
    }
    connect(signer) {
        return super.connect(signer);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.ZkSyncNFTFactoryFactory = ZkSyncNFTFactoryFactory;
const _abi = [
    {
        inputs: [
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                internalType: "string",
                name: "symbol",
                type: "string",
            },
            {
                internalType: "address",
                name: "zkSyncAddress",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "approved",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "ApprovalForAll",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "creator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "creatorAccountId",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "serialId",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "contentHash",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "MintNFTFromZkSync",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "baseURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "getApproved",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_tokenId",
                type: "uint256",
            },
        ],
        name: "getContentHash",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "getCreatorAccountId",
        outputs: [
            {
                internalType: "uint32",
                name: "",
                type: "uint32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "getCreatorAddress",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_tokenId",
                type: "uint256",
            },
        ],
        name: "getCreatorFingerprint",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "getSerialId",
        outputs: [
            {
                internalType: "uint32",
                name: "",
                type: "uint32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
        ],
        name: "isApprovedForAll",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "creator",
                type: "address",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "uint32",
                name: "creatorAccountId",
                type: "uint32",
            },
            {
                internalType: "uint32",
                name: "serialId",
                type: "uint32",
            },
            {
                internalType: "bytes32",
                name: "contentHash",
                type: "bytes32",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "mintNFTFromZkSync",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "ownerOf",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes4",
                name: "interfaceId",
                type: "bytes4",
            },
        ],
        name: "supportsInterface",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "tokenByIndex",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "tokenOfOwnerByIndex",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "tokenURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const _bytecode = "0x60806040523480156200001157600080fd5b50604051620021fd380380620021fd833981810160405260608110156200003757600080fd5b81019080805160405193929190846401000000008211156200005857600080fd5b9083019060208201858111156200006e57600080fd5b82516401000000008111828201881017156200008957600080fd5b82525081516020918201929091019080838360005b83811015620000b85781810151838201526020016200009e565b50505050905090810190601f168015620000e65780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156200010a57600080fd5b9083019060208201858111156200012057600080fd5b82516401000000008111828201881017156200013b57600080fd5b82525081516020918201929091019080838360005b838110156200016a57818101518382015260200162000150565b50505050905090810190601f168015620001985780820380516001836020036101000a031916815260200191505b5060405260200151915083905082620001b86301ffc9a760e01b62000245565b8151620001cd906006906020850190620002ca565b508051620001e3906007906020840190620002ca565b50620001f66380ac58cd60e01b62000245565b62000208635b5e139f60e01b62000245565b6200021a63780e9d6360e01b62000245565b5050600c80546001600160a01b0319166001600160a01b039290921691909117905550620003769050565b6001600160e01b03198082161415620002a5576040805162461bcd60e51b815260206004820152601c60248201527f4552433136353a20696e76616c696420696e7465726661636520696400000000604482015290519081900360640190fd5b6001600160e01b0319166000908152602081905260409020805460ff19166001179055565b828054600181600116156101000203166002900490600052602060002090601f0160209004810192826200030257600085556200034d565b82601f106200031d57805160ff19168380011785556200034d565b828001600101855582156200034d579182015b828111156200034d57825182559160200191906001019062000330565b506200035b9291506200035f565b5090565b5b808211156200035b576000815560010162000360565b611e7780620003866000396000f3fe608060405234801561001057600080fd5b506004361061012d5760003560e01c80636352211e116100b35780636352211e146103a85780636c0360eb146103c557806370a08231146103cd57806395d89b41146103f3578063a1b8aa26146103fb578063a22cb46514610418578063a30b4db914610446578063b88d4fde14610463578063b90ea3ec14610527578063c87b56dd14610544578063e985e9c514610561578063ffbdc8cb1461058f5761012d565b806301ffc9a71461013257806306fdde031461016d578063081812fc146101ea578063095ea7b31461022357806318160ddd14610251578063234ce5901461026b57806323b872dd146102bd5780632f745c59146102f3578063328c3a4a1461031f57806342842e0e146103555780634f6ccce71461038b575b600080fd5b6101596004803603602081101561014857600080fd5b50356001600160e01b0319166105ac565b604080519115158252519081900360200190f35b6101756105cf565b6040805160208082528351818301528351919283929083019185019080838360005b838110156101af578181015183820152602001610197565b50505050905090810190601f1680156101dc5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102076004803603602081101561020057600080fd5b5035610665565b604080516001600160a01b039092168252519081900360200190f35b61024f6004803603604081101561023957600080fd5b506001600160a01b0381351690602001356106c7565b005b6102596107a2565b60408051918252519081900360200190f35b61024f600480360360c081101561028157600080fd5b506001600160a01b03813581169160208101359091169063ffffffff604082013581169160608101359091169060808101359060a001356107b3565b61024f600480360360608110156102d357600080fd5b506001600160a01b038135811691602081013590911690604001356108ac565b6102596004803603604081101561030957600080fd5b506001600160a01b038135169060200135610903565b61033c6004803603602081101561033557600080fd5b503561092e565b6040805163ffffffff9092168252519081900360200190f35b61024f6004803603606081101561036b57600080fd5b506001600160a01b03813581169160208101359091169060400135610951565b610259600480360360208110156103a157600080fd5b503561096c565b610207600480360360208110156103be57600080fd5b5035610982565b6101756109aa565b610259600480360360208110156103e357600080fd5b50356001600160a01b0316610a0b565b610175610a73565b6102596004803603602081101561041157600080fd5b5035610ad4565b61024f6004803603604081101561042e57600080fd5b506001600160a01b0381351690602001351515610ae6565b6102076004803603602081101561045c57600080fd5b5035610be7565b61024f6004803603608081101561047957600080fd5b6001600160a01b03823581169260208101359091169160408201359190810190608081016060820135600160201b8111156104b357600080fd5b8201836020820111156104c557600080fd5b803590602001918460018302840111600160201b831117156104e657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550610c02945050505050565b61033c6004803603602081101561053d57600080fd5b5035610c60565b6101756004803603602081101561055a57600080fd5b5035610c7c565b6101596004803603604081101561057757600080fd5b506001600160a01b0381358116916020013516610efd565b610259600480360360208110156105a557600080fd5b5035610f2b565b6001600160e01b0319811660009081526020819052604090205460ff165b919050565b60068054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281526060939092909183018282801561065b5780601f106106305761010080835404028352916020019161065b565b820191906000526020600020905b81548152906001019060200180831161063e57829003601f168201915b5050505050905090565b600061067082610f3d565b6106ab5760405162461bcd60e51b815260040180806020018281038252602c815260200180611d6c602c913960400191505060405180910390fd5b506000908152600460205260409020546001600160a01b031690565b60006106d282610982565b9050806001600160a01b0316836001600160a01b031614156107255760405162461bcd60e51b8152600401808060200182810382526021815260200180611df06021913960400191505060405180910390fd5b806001600160a01b0316610737610f4a565b6001600160a01b03161480610758575061075881610753610f4a565b610efd565b6107935760405162461bcd60e51b8152600401808060200182810382526038815260200180611cbf6038913960400191505060405180910390fd5b61079d8383610f4e565b505050565b60006107ae6002610fbc565b905090565b600c546001600160a01b03166107c7610f4a565b6001600160a01b031614610806576040805162461bcd60e51b81526020600482015260016024820152603d60f91b604482015290519081900360640190fd5b6108108582610fc7565b6000818152600a6020526040812083905561082c878686610fe5565b6000838152600b6020908152604091829020839055815163ffffffff808a1682528816918101919091528082018690526060810185905290519192506001600160a01b0380891692908a16917f6f9f9796c253c64d832328af44bc2ec5e2dad7f948ee013003be6a082532a14a919081900360800190a350505050505050565b6108bd6108b7610f4a565b82611014565b6108f85760405162461bcd60e51b8152600401808060200182810382526031815260200180611e116031913960400191505060405180910390fd5b61079d8383836110b8565b6001600160a01b03821660009081526001602052604081206109259083611204565b90505b92915050565b6000818152600b602052604081205461094a8160c060e0611210565b9392505050565b61079d83838360405180602001604052806000815250610c02565b60008061097a600284611278565b509392505050565b600061092882604051806060016040528060298152602001611d216029913960029190611294565b60098054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281526060939092909183018282801561065b5780601f106106305761010080835404028352916020019161065b565b60006001600160a01b038216610a525760405162461bcd60e51b815260040180806020018281038252602a815260200180611cf7602a913960400191505060405180910390fd5b6001600160a01b038216600090815260016020526040902061092890610fbc565b60078054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281526060939092909183018282801561065b5780601f106106305761010080835404028352916020019161065b565b6000908152600b602052604090205490565b610aee610f4a565b6001600160a01b0316826001600160a01b03161415610b50576040805162461bcd60e51b815260206004820152601960248201527822a9219b99189d1030b8383937bb32903a379031b0b63632b960391b604482015290519081900360640190fd5b8060056000610b5d610f4a565b6001600160a01b03908116825260208083019390935260409182016000908120918716808252919093529120805460ff191692151592909217909155610ba1610f4a565b6001600160a01b03167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c318360405180821515815260200191505060405180910390a35050565b6000818152600b602052604081205461094a818360a0611210565b610c13610c0d610f4a565b83611014565b610c4e5760405162461bcd60e51b8152600401808060200182810382526031815260200180611e116031913960400191505060405180910390fd5b610c5a848484846112a1565b50505050565b6000818152600b602052604081205461094a8160a060c0611210565b6060610c8782610f3d565b610cc25760405162461bcd60e51b815260040180806020018281038252602f815260200180611dc1602f913960400191505060405180910390fd5b60008281526008602090815260408083208054825160026001831615610100026000190190921691909104601f810185900485028201850190935282815292909190830182828015610d555780601f10610d2a57610100808354040283529160200191610d55565b820191906000526020600020905b815481529060010190602001808311610d3857829003601f168201915b505050505090506000610d666109aa565b9050805160001415610d7a575090506105ca565b815115610e3b5780826040516020018083805190602001908083835b60208310610db55780518252601f199092019160209182019101610d96565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310610dfd5780518252601f199092019160209182019101610dde565b6001836020036101000a03801982511681845116808217855250505050505090500192505050604051602081830303815290604052925050506105ca565b80610e45856112f3565b6040516020018083805190602001908083835b60208310610e775780518252601f199092019160209182019101610e58565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310610ebf5780518252601f199092019160209182019101610ea0565b6001836020036101000a0380198251168184511680821785525050505050509050019250505060405160208183030381529060405292505050919050565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b6000908152600a602052604090205490565b60006109286002836113ce565b3390565b600081815260046020526040902080546001600160a01b0319166001600160a01b0384169081179091558190610f8382610982565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000610928826113da565b610fe18282604051806020016040528060008152506113de565b5050565b6001600160a01b03831663ffffffff60a01b60a084901b161763ffffffff60c01b60c083901b16179392505050565b600061101f82610f3d565b61105a5760405162461bcd60e51b815260040180806020018281038252602c815260200180611c93602c913960400191505060405180910390fd5b600061106583610982565b9050806001600160a01b0316846001600160a01b031614806110a05750836001600160a01b031661109584610665565b6001600160a01b0316145b806110b057506110b08185610efd565b949350505050565b826001600160a01b03166110cb82610982565b6001600160a01b0316146111105760405162461bcd60e51b8152600401808060200182810382526029815260200180611d986029913960400191505060405180910390fd5b6001600160a01b0382166111555760405162461bcd60e51b8152600401808060200182810382526024815260200180611c6f6024913960400191505060405180910390fd5b611160838383611430565b61116b600082610f4e565b6001600160a01b038316600090815260016020526040902061118d908261145e565b506001600160a01b03821660009081526001602052604090206111b0908261146a565b506111bd60028284611476565b5080826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b6000610925838361148c565b60008261ffff168261ffff1611611253576040805162461bcd60e51b8152602060048201526002602482015261717160f01b604482015290519081900360640190fd5b50600161ffff82811682901b60001990810191851692831b01188416901c9392505050565b600080808061128786866114f0565b9097909650945050505050565b60006110b084848461156b565b6112ac8484846110b8565b6112b884848484611635565b610c5a5760405162461bcd60e51b8152600401808060200182810382526032815260200180611c3d6032913960400191505060405180910390fd5b60608161131857506040805180820190915260018152600360fc1b60208201526105ca565b8160005b811561133057600101600a8204915061131c565b60008167ffffffffffffffff8111801561134957600080fd5b506040519080825280601f01601f191660200182016040528015611374576020820181803683370190505b50859350905060001982015b83156113c557600a840660300160f81b828280600190039350815181106113a357fe5b60200101906001600160f81b031916908160001a905350600a84049350611380565b50949350505050565b6000610925838361179d565b5490565b6113e883836117b5565b6113f56000848484611635565b61079d5760405162461bcd60e51b8152600401808060200182810382526032815260200180611c3d6032913960400191505060405180910390fd5b6001600160a01b03821661079d576000908152600a60209081526040808320839055600b9091528120555050565b600061092583836118e2565b600061092583836119a8565b60006110b084846001600160a01b0385166119f2565b815460009082106114ce5760405162461bcd60e51b8152600401808060200182810382526022815260200180611c1b6022913960400191505060405180910390fd5b8260000182815481106114dd57fe5b9060005260206000200154905092915050565b8154600090819083106115345760405162461bcd60e51b8152600401808060200182810382526022815260200180611d4a6022913960400191505060405180910390fd5b600084600001848154811061154557fe5b906000526020600020906002020190508060000154816001015492509250509250929050565b600082815260018401602052604081205482816116065760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b838110156115cb5781810151838201526020016115b3565b50505050905090810190601f1680156115f85780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5084600001600182038154811061161957fe5b9060005260206000209060020201600101549150509392505050565b6000611649846001600160a01b0316611a89565b611655575060016110b0565b6000611763630a85bd0160e11b61166a610f4a565b88878760405160240180856001600160a01b03168152602001846001600160a01b0316815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156116d15781810151838201526020016116b9565b50505050905090810190601f1680156116fe5780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052906001600160e01b0319166020820180516001600160e01b038381831617835250505050604051806060016040528060328152602001611c3d603291396001600160a01b0388169190611a8f565b9050600081806020019051602081101561177c57600080fd5b50516001600160e01b031916630a85bd0160e11b1492505050949350505050565b60009081526001919091016020526040902054151590565b6001600160a01b038216611810576040805162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f2061646472657373604482015290519081900360640190fd5b61181981610f3d565b1561186a576040805162461bcd60e51b815260206004820152601c60248201527b115490cdcc8c4e881d1bdad95b88185b1c9958591e481b5a5b9d195960221b604482015290519081900360640190fd5b61187660008383611430565b6001600160a01b0382166000908152600160205260409020611898908261146a565b506118a560028284611476565b5060405181906001600160a01b038416906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b6000818152600183016020526040812054801561199e578354600019808301919081019060009087908390811061191557fe5b906000526020600020015490508087600001848154811061193257fe5b60009182526020808320909101929092558281526001898101909252604090209084019055865487908061196257fe5b60019003818190600052602060002001600090559055866001016000878152602001908152602001600020600090556001945050505050610928565b6000915050610928565b60006119b4838361179d565b6119ea57508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610928565b506000610928565b600082815260018401602052604081205480611a5757505060408051808201825283815260208082018481528654600181810189556000898152848120955160029093029095019182559151908201558654868452818801909252929091205561094a565b82856000016001830381548110611a6a57fe5b906000526020600020906002020160010181905550600091505061094a565b3b151590565b60606110b0848460008585611aa385611a89565b611af4576040805162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015290519081900360640190fd5b600080866001600160a01b031685876040518082805190602001908083835b60208310611b325780518252601f199092019160209182019101611b13565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d8060008114611b94576040519150601f19603f3d011682016040523d82523d6000602084013e611b99565b606091505b5091509150611ba9828286611bb4565b979650505050505050565b60608315611bc357508161094a565b825115611bd35782518084602001fd5b60405162461bcd60e51b81526020600482018181528451602484015284518593919283926044019190850190808383600083156115cb5781810151838201526020016115b356fe456e756d657261626c655365743a20696e646578206f7574206f6620626f756e64734552433732313a207472616e7366657220746f206e6f6e20455243373231526563656976657220696d706c656d656e7465724552433732313a207472616e7366657220746f20746865207a65726f20616464726573734552433732313a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4552433732313a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734552433732313a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e456e756d657261626c654d61703a20696e646578206f7574206f6620626f756e64734552433732313a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4552433732314d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76616c20746f2063757272656e74206f776e65724552433732313a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564a2646970667358221220c5e4ba0f42e895a8ddb335b28a317016f7f0d500452c36216d8b8097203c444764736f6c63430007060033";
