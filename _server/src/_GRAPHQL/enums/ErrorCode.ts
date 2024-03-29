enum ErrorCode {
    ERR_401_001 = "ERR_401_001", // SIGNATURE INVALID
    ERR_401_002 = "ERR_401_002", // EXPIRATION DATE PASSED
    ERR_401_003 = "ERR_401_003", // TIMEOUT PASSED
    ERR_401_004 = "ERR_401_004", // IP NOT CORRESPONDING
    ERR_401_005 = "ERR_401_005", // UA NOT CORRESPONDING
    ERR_401_006 = "ERR_401_006", // TOKEN ID NOT EXISTING
    ERR_401_007 = "ERR_401_007", // TOKEN NOT ENABLED
    ERR_401_008 = "ERR_401_008", // TOKEN NOT COMPATIBLE
    ERR_401_009 = "ERR_401_009", // WRONG TYPE TOKEN
    ERR_401_010 = "ERR_401_010", // NICKNAME NOT EXISTING
    ERR_401_011 = "ERR_401_011", // SOCKET NOT EXISTING
    ERR_401_012 = "ERR_401_012", // ACCESS REQUEST NOT EXISTING
    ERR_401_013 = "ERR_401_013", // ACCESS REQUEST EXPIRED
    ERR_401_014 = "ERR_401_014", // ACCESS TOKEN NOT PROVIDED

    ERR_403_001 = "ERR_403_001", // USER ALREADY EXISTING
    ERR_403_002 = "ERR_403_002", // USER DOES NOT EXIST
    ERR_403_003 = "ERR_403_003", // SIGNATURE IS INVALID
    ERR_403_004 = "ERR_403_004", // ACCOUNT/NAME ALREADY EXISTING
    ERR_403_005 = "ERR_403_005", // DATE FOR SIGNATURE IS INVALID
    ERR_403_006 = "ERR_403_006", // ACCOUNT NOT EXISTING
    ERR_403_007 = "ERR_403_007", // TOKEN EXPIRED
    ERR_403_008 = "ERR_403_008", // CONTENT NOT VISIBLE
    ERR_403_009 = "ERR_403_009", // POST INTERACTION NOT ALLOWED

    ERR_404_001 = "ERR_404_001", // EMAIL NOT EXISTING
    ERR_404_002 = "ERR_404_002", // TOKEN NOT PROVIDED
    ERR_404_003 = "ERR_404_003", // TOKEN NOT FOUND
    ERR_404_004 = "ERR_404_004", // POST NOT FOUND
    ERR_404_005 = "ERR_404_005", // CONTENT NOT FOUND
    ERR_404_006 = "ERR_404_006", // RESTRICTED OPTION NOT VALID
    ERR_404_007 = "ERR_404_007", // USER NOT FOUND

    ERR_501_001 = "ERR_501_001", // FUNCTION ERROR
    ERR_501_002 = "ERR_501_002", // DATABASE ERROR
    ERR_501_003 = "ERR_501_003", // MAIL ERROR
    ERR_501_004 = "ERR_501_004"  // FILE ERROR

}

export default ErrorCode