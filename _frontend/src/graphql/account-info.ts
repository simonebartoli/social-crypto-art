import {gql} from "@/__generated__/gql";

export const GET_WEB3_ACCOUNTS = gql(`
    query GET_WEB3_ACCOUNTS {
        getWeb3Accounts {
            address
            name
            packet
        }
    }
`)

export const GET_USER = gql(`
    query GET_USER{
        getUser {
            nickname
            email
            accounts {
                name
                address
                packet
            }
        }
    }
`)

export const GET_LIST_OF_USERS = gql(`
    query GET_LIST_OF_USERS($data: Input_SearchForUsers!) {
        getListOfUsers(data: $data) {
            nickname
        }
    }
`)