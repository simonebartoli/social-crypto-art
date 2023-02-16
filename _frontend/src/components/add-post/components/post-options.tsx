import React from 'react';
import KeyboardDoubleArrowDownOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowDownOutlined";

const PostOptions = () => {
    return (
        <div className="text-black text-lg w-full rounded-lg bg-white p-4 flex flex-row justify-between items-center">
            <div className="flex flex-row gap-4 items-center justify-center">
                <span>This Post is </span>
                <select className="p-3 font-main">
                    <option>just a post</option>
                    <option>an NFT</option>
                    <option>an NFT and a post</option>
                </select>
            </div>
            <KeyboardDoubleArrowDownOutlinedIcon className="!text-3xl"/>
        </div>
    );
};

export default PostOptions;