// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./libraries/EcDSA.sol";

contract VerifySignature {
    using ECDSA for bytes32;

    function getMessageHash(address _from, address _to, string memory _date, string memory _ip)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_from, _to, _date, _ip));
    }

    function verifySignature(
        address _from,
        address _to,
        string memory _date,
        string memory _ip,
        bytes memory sig
    ) external pure returns (bool) {
        bytes32 ethMessageHashed = getMessageHash(_from, _to, _date, _ip).toEthSignedMessageHash();
        return ethMessageHashed.recover(sig) == _from;
    }

    function getAddressFromSignature(
        address _from,
        address _to,
        string memory _date,
        string memory _ip,
        bytes memory sig
    ) external pure returns (address) {
        bytes32 ethMessageHashed = getMessageHash(_from, _to, _date, _ip).toEthSignedMessageHash();
        return ethMessageHashed.recover(sig);
    }
}

