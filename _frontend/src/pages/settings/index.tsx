import React, {useEffect} from 'react';
import {useRouter} from "next/router";
import Loader from "@/components/library/loader";

const Index = () => {
    const router = useRouter()
    useEffect(() => {
        if(router.isReady){
            router.push("/settings/personal")
        }
    }, [router.isReady])
    return (
        <Loader/>
    );
};

export default Index;