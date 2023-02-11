import React, {ReactElement} from 'react';
import Layout from "@/components/library/layout";
import Post from "@/components/library/post";

const Home = () => {
    return (
        <div className="font-main flex flex-col gap-12 items-center justify-center w-full">
            {
                new Array(2).fill([]).map((_, index) =>
                    <Post key={index}/>
                )
            }
        </div>
    );
};

Home.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}

export default Home;