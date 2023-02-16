import React, {ReactElement} from 'react';
import Layout from "@/components/library/layout";
import Post from "@/components/library/post/post";
import OptionalLogin from "@/components/library/auth/optional-login";

const Home = () => {
    return (
        <div className="font-main flex flex-col gap-12 items-center justify-center w-full">
            {
                new Array(2).fill([]).map((_, index) =>
                    <Post nft={index % 2 === 0} key={index}/>
                )
            }
        </div>
    );
};

Home.getLayout = function getLayout(page: ReactElement) {
    return (
        <OptionalLogin>
            <Layout left={true} top={true}>
                {page}
            </Layout>
        </OptionalLogin>
    )
}

export default Home;