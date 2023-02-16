import React from 'react';
import {NextPage} from "next";
import Navbar from "@/components/library/navbar";
import NavbarTop from "@/components/library/navbar-top";

type Props = {
    children: JSX.Element
    top: boolean
    left: boolean
}

const Layout: NextPage<Props> = ({children, top, left}) => {

    return (
        <div className="w-screen min-h-screen bg-custom-grey">
            {left && <Navbar/>}
            {top && <NavbarTop/>}
            <div className="flex flex-col">
                {top && <div className="h-[10vh]"/>}
                <div className="flex flex-row">
                    {
                        left ?
                        <>
                            <div className="w-[7.5%]"/>
                            <div className="w-[90%] px-8 py-8">
                                {children}
                            </div>
                            <div className="w-[2.5%]"/>
                        </> :
                        <>
                            <div className="w-[100%] px-8 py-8">
                                {children}
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    );
};

export default Layout;