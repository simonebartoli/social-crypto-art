import React from 'react';
import CSS from 'csstype';
import {NextPage} from "next";

type Props = {
    text: string
    icon?: JSX.Element
    disabled?: boolean
    onClick?: () => void
    style?: CSS.Properties
}

const Button: NextPage<Props> = ({text, icon, disabled = false, onClick, style}) => {
    return (
        <button style={style} disabled={disabled}
                onClick={onClick}
                className="disabled:text-black disabled:bg-custom-light-grey disabled:cursor-not-allowed disabled:pointer-events-none hover:bg-white hover:text-black transition border-2 border-black w-full p-4 bg-black text-white rounded-lg text-center w-full flex items-center justify-center gap-4">
            {icon && icon}
            {text}
        </button>
    );
};

export default Button;