import React from 'react';
import Link from "next/link";

const LoginModal = () => {
    return (
        <div className="w-full h-full flex flex-col gap-8 items-center justify-center">
            <h2 className="text-4xl font-bold">This Action Requires Login</h2>
            <p className="text-lg">If you want to use this action you need to login / signup</p>
            <Link
                href={"/login"}
                className="w-1/2 text-xl hover:bg-white hover:text-black transition border-[1px] shadow-lg border-black rounded-lg p-4 bg-black text-white text-center"
            >
                Login / Signup
            </Link>
        </div>
    );
};

export default LoginModal;