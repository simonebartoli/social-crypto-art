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