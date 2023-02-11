import React, {useCallback, useRef, useState} from 'react';
import {NextPage} from "next";
import Navbar from "@/components/library/navbar";
import NavbarTop from "@/components/library/navbar-top";
import {useLayout} from "@/contexts/layout";

type Props = {
    children: JSX.Element
}

const Layout: NextPage<Props> = ({children}) => {
    const {heightPage} = useLayout()
    const [height, setHeight] = useState(0)

    const divHeightControlRef = useCallback((node: HTMLDivElement): void => {
        if (node !== null) {
            setHeight(node.scrollHeight + (heightPage * 0.1))
        }
    },[]);

    return (
        <div style={{height: `${height}px`}} className="w-screen min-h-screen bg-custom-grey">
            <Navbar/>
            <NavbarTop/>
            <div ref={divHeightControlRef} className="absolute top-[10vh] left-[7.5%] w-[90%] px-8 py-8">
                {children}
            </div>
        </div>
    );
};

export default Layout;