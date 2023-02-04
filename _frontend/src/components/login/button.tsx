import React from 'react';
import {NextPage} from "next";

type Props = {
    text: string
    icon: JSX.Element
    disabled?: boolean
    onClick?: () => void
}

const Button: NextPage<Props> = ({text, icon, disabled = false, onClick}) => {
    return (
        <button disabled={disabled}
                onClick={onClick}
                className="disabled:text-black disabled:bg-custom-light-grey disabled:pointer-events-none disabled:cursor-not-allowed hover:bg-white hover:text-black transition border-2 border-black w-full p-4 bg-black text-white rounded-lg text-center w-full flex items-center justify-center gap-4">
            {icon}
            {text}
        </button>
    );
};

export default Button;