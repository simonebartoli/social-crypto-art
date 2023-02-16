import React, {useState} from 'react';
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';

const NftInfo = () => {
    const [showInfo, setShowInfo] = useState(false)

    return (
        <div className="p-4 flex flex-col items-center justify-center w-full bg-custom-light-grey rounded-lg gap-6">
            <div className="w-full flex flex-row justify-between items-center">
                <span className="text-xl font-bold">SELLING - FIXED PRICE</span>
                {
                    showInfo ?
                    <ArrowDropUpOutlinedIcon onClick={() => setShowInfo(false)} className="!text-2xl cursor-pointer"/>:
                    <ArrowDropDownOutlinedIcon onClick={() => setShowInfo(true)} className="!text-2xl cursor-pointer"/>
                }
            </div>
            {
                showInfo &&
                <div className="flex flex-col items-start justify-center gap-4 w-full text-lg">
                    <div className="flex flex-row gap-3 w-full items-center">
                        <span>Seller: </span>
                        <span className="font-bold">seller001</span>
                    </div>
                    <div className="flex flex-row gap-3 w-full items-center">
                        <span>Original Creator: </span>
                        <span className="font-bold">i_am_the_best</span>
                    </div>
                    <div className="flex flex-row gap-3 w-full items-center">
                        <span>Status: </span>
                        <span className="p-2 bg-custom-red rounded-lg font-bold">NOT VERIFIED</span>
                    </div>
                    <span className="italic text-base">
                            All the contents of this post are NFTs.
                    </span>
                </div>
            }
        </div>
    );
};

export default NftInfo;