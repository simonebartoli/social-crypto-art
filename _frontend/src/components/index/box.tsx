import React from 'react';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import Man2OutlinedIcon from '@mui/icons-material/Man2Outlined';
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined';

import {NextPage} from "next";

type Props = {
    title: string
    type: "NOT_EXPERT" | "EXPERT"
    reasons: string[]
}

const Box: NextPage<Props> = ({title, type, reasons}) => {
    return (
        <div className="w-[30%] self-stretch shadow-lg shadow-custom-grey bg-custom-grey flex flex-col items-center justify-start border-2 rounded-lg border-white shadow-lg font-main">
            <div className={`${type === "EXPERT" ? "bg-yellow-400" : "bg-green-500"} w-full flex items-center justify-center rounded-t-lg py-2`}>
                {
                    type === "EXPERT" ?
                    <SchoolOutlinedIcon className="!text-5xl"/> :
                    <Man2OutlinedIcon className="!text-5xl"/>
                }
            </div>
            <div className="flex flex-col items-center justify-center w-full">
                <span className="font-bold w-full text-center rounded-b-lg py-4 border-b-[1px] border-custom-light-grey text-2xl">
                    {title}
                </span>
                <div className="grid grid-cols-4 items-center justify-center p-6 gap-4">
                    {
                        reasons.map((_, index) =>
                            <React.Fragment key={index}>
                                <CropSquareOutlinedIcon className="!text-3xl col-span-1 justify-self-end"/>
                                <li className="list-none col-span-3 text-lg">{_}</li>
                            </React.Fragment>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default Box;