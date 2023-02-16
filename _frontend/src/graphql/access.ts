import { gql } from "@/__generated__/gql"

export const VERIFY_TOKEN = gql(`
    mutation VERIFY_TOKEN($data: Input_RequestToken!) {
        enableToken(data: $data)
    }
`)
export const CREATE_USER = gql(`
    mutation CREATE_USER($data: Input_NewUser!) {
        createUser(data: $data)
    }
`)
export const ADD_NEW_WEB3_ACCOUNT = gql(`
    mutation ADD_NEW_WEB3_ACCOUNT($data: Input_NewWeb3Account!) {
        addNewWeb3Account(data: $data)
    }
`)
export const GET_ACCESS_TOKEN_WEB3_ACCOUNT = gql(`
    mutation GET_ACCESS_TOKEN_WEB3_ACCOUNT($data: Input_Web3Account!) {
        getAccessToken_Web3Account(data: $data)
    }
`)
export const GET_ACCESS_TOKEN_RECOVERY_TOKEN = gql(`
    mutation GET_ACCESS_TOKEN_RECOVERY_TOKEN{
        getAccessToken_RecoveryToken
    }
`)
export const CREATE_NEW_LOGIN_INSTANCE_EMAIL = gql(`
    mutation CREATE_NEW_LOGIN_INSTANCE_EMAIL($data: Input_EmailSocket!){
        createNewLoginInstance_Email(data: $data)
    }
`)

export const GET_IP_ADDRESS = gql(`
    query GET_IP_ADDRESS{
        getIpAddress
    }
`)