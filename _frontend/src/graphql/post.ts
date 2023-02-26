import {gql} from "@/__generated__";

export const ADD_POST = gql(`
    mutation ADD_POST($data: Input_AddNewPost!) {
        addPost(data: $data){
            post_id
            ipfs
            visibility
            created_at
        }
    }
`)

export const GET_POST_FROM_USER = gql(`
    query GET_POST_FROM_USER($nickname: String!) {
        getPostFromUser(nickname: $nickname){
            post_id
            visibility
            created_at
            ipfs
            content{
                type
                text
                position
                nft_id
            }
            interactions{
                upvote_total
                downvote_total
                comment_total
            }
        }
    }
`)

export const VALIDATE_NFT_CREATION = gql(`
    mutation VALIDATE_NFT_CREATION($data: Input_VerifyNft!){
        validateNftCreation(data: $data)
    }
`)