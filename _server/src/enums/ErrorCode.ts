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

    ERR_404_001 = "ERR_404_001", // EMAIL NOT EXISTING
    ERR_404_002 = "ERR_404_002", // TOKEN NOT PROVIDED

    ERR_403_001 = "ERR_403_001", // USER ALREADY EXISTING
    ERR_403_002 = "ERR_403_002", // USER DOES NOT EXIST

}

export default ErrorCode