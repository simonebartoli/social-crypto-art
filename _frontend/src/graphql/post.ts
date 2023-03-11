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
    query GET_POST_FROM_USER($nickname: String!, $data: Input_GetPosts) {
        getPostFromUser(nickname: $nickname, data: $data){
            post_id
            visibility
            created_at
            ipfs
            content{
                post_content_id
                type
                text
                position
                nft_id
            }
            interactions{
                upvote_total
                downvote_total
                upvote_users{
                    nickname
                }
                downvote_users{
                    nickname
                }
                comment_total
            }
            user{
                nickname
            }
        }
    }
`)
export const VALIDATE_NFT_CREATION = gql(`
    mutation VALIDATE_NFT_CREATION($data: Input_VerifyNft!){
        validateNftCreation(data: $data)
    }
`)
export const GET_POSTS = gql(`
    query GET_POSTS($data: Input_GetPosts) {
        getPosts(data: $data){
            post_id
            visibility
            created_at
            ipfs
            content{
                post_content_id
                type
                text
                position
                nft_id
            }
            interactions{
                upvote_total
                downvote_total
                comment_total
                upvote_users{
                    nickname
                }
                downvote_users{
                    nickname
                }
            }
            user{
                nickname
            }
        }
    }
`)

export const ADD_UPVOTE_DOWNVOTE = gql(`
    mutation ADD_UPVOTE_DOWNVOTE($data: Input_AddNewInteraction!) {
        addUpvoteDownvote(data: $data){
            post_id
            interactions{
                upvote_total
                downvote_total
                upvote_users{
                    nickname
                }
                downvote_users{
                    nickname
                }
            }
        }
    }
`)

export const REMOVE_UPVOTE_DOWNVOTE = gql(`
    mutation REMOVE_UPVOTE_DOWNVOTE($data: Input_AddNewInteraction!) {
        removeUpvoteDownvote(data: $data){
            post_id
            interactions{
                upvote_total
                downvote_total
                upvote_users{
                    nickname
                }
                downvote_users{
                    nickname
                }
            }
        }
    }
`)