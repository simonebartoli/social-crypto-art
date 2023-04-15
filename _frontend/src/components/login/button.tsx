import React, {useEffect, useRef} from 'react';
import CSS from 'csstype';
import {NextPage} from "next";

type Props = {
    text: string
    trigger?: boolean
    icon?: JSX.Element
    disabled?: boolean
    onClick?: () => void
    style?: CSS.Properties
}

const Button: NextPage<Props> = ({text, trigger, icon, disabled = false, onClick, style}) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if(trigger){
            window.addEventListener("keydown", (e) => {
                if(e.key === "Enter"){
                    if(buttonRef.current){
                        buttonRef.current.click()
                    }
                }
            })
        }
    }, [])

    return (
        <button
            ref={buttonRef}
            style={style}
            disabled={disabled}
            onClick={onClick}
            className="disabled:text-black disabled:bg-custom-light-grey disabled:cursor-not-allowed disabled:pointer-events-none hover:bg-white hover:text-black transition border-2 border-black w-full p-4 bg-black text-white rounded-lg text-center w-full flex items-center justify-center gap-4">
            {icon && icon}
            {text}
        </button>
    );
};

export default Button;