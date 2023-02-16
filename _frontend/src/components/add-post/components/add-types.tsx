import React from 'react';
import {NextPage} from "next";

type Props = {
    onClick: () => void
    icon: JSX.Element
    type: string
}

const AddTypes: NextPage<Props> = ({type, icon, onClick}) => {
    return (
        <button onClick={onClick} className="hover:bg-black hover:text-white transition border-2 border-black w-full text-3xl p-4 text-black w-full flex flex-row items-center justify-center bg-white rounded-lg shadow-lg">
            {icon}
            <span className="w-1/3">{type}</span>
        </button>
    );
};

export default AddTypes;