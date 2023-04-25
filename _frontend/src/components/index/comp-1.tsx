import React from 'react';
import Link from "next/link";

const Comp1 = () => {
    return (
        <div className="comp1 relative text-white flex items-center justify-center flex-col gap-20 h-screen font-main">
            <div className="w-screen h-screen bg-black absolute top-0 left-0 opacity-20"/>
            <h1 className="z-10 font-title text-6xl tracking-[1rem]">Social Crypto Art</h1>
            <h2 className="z-10 text-4xl tracking-[0.5rem]">“Value what you are”</h2>
            <Link href={"/home"} className="z-10 hover:bg-white hover:text-black transition duration-300 px-8 py-4 bg-black rounded-full text-3xl">
                Launch the App
            </Link>
        </div>
    );
};

export default Comp1;