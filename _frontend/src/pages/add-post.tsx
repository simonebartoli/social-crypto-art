import React, {ReactElement} from 'react';
import Layout from "@/components/library/layout";
import RequireLogin from "@/components/library/auth/require-login";
import 'react-quill/dist/quill.snow.css';
import AddContent from "@/components/add-post/tabs/add-content";
import PreviewContent from "@/components/add-post/tabs/preview-content";

const AddPost = () => {
    return (
        <div className="flex font-main flex-col gap-12 items-center justify-center w-full text-white">
            <h1 className="text-4xl font-bold">Add a New Post</h1>
            <div className="flex flex-row gap-12 w-full items-start justify-center">
                <AddContent/>
                <PreviewContent/>
            </div>
        </div>
    );
};

AddPost.getLayout = function getLayout(page: ReactElement) {
    return (
        <RequireLogin>
            <Layout left={true} top={false}>
                {page}
            </Layout>
        </RequireLogin>
    )
}

export default AddPost;