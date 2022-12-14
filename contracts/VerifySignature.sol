// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./libraries/EcDSA.sol";

contract VerifySignature {
    using ECDSA for bytes32;

    function getMessageHash(address _to, string memory _date)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_to, _date));
    }

    function verify(
        address _to,
        string memory _date,
        address _signer,
        bytes memory sig
    ) external pure returns (bool) {
        bytes32 ethMessageHashed = getMessageHash(_to, _date).toEthSignedMessageHash();
        return ethMessageHashed.recover(sig) == _signer;
    }
}

