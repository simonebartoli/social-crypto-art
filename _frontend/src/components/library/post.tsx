import React from 'react';
import Image from "next/image";
import TEST from "../../../public/test.webp";
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';

const Post = () => {
    return (
        <div className="flex flex-col w-1/2 p-8 bg-white text-black rounded-lg gap-6">
            <div className="flex flex-col gap-3 items-center justify-center w-full"> {/*HEADER*/}
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row gap-6 items-center justify-center"> {/*HEADER USER INFO*/}
                        <div className="relative h-[50px] w-[50px] rounded-xl overflow-hidden">
                            <Image
                                src={TEST}
                                fill={true}
                                style={{objectFit: "contain"}}
                                alt={""}
                            />
                        </div>
                        <span className="text-2xl bg-black py-2 px-4 text-white rounded-lg">simo2001</span>
                    </div>
                    <div className="flex flex-row gap-6 items-center justify-center">
                        <span className="bg-custom-blue py-2 px-4 text-lg rounded-lg">POST</span>
                    </div>
                </div>
                <div className="w-full">
                    <span className="text-custom-grey">20 December 2023 at 15:15</span>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-6">
                <div>
                    <p>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                    </p>
                </div>
            </div>
            <div className="mt-8 text-white w-full bg-black flex flex-row items-center justify-around p-3 rounded-lg">
                <div className="flex flex-row items-center justify-center gap-2">
                    <span>1510</span>
                    <KeyboardDoubleArrowUpOutlinedIcon className="cursor-pointer hover:text-custom-blue transition !text-3xl"/>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                    <span>80</span>
                    <KeyboardDoubleArrowDownOutlinedIcon className="cursor-pointer hover:text-custom-blue transition !text-3xl"/>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                    <span>20</span>
                    <QuestionAnswerOutlinedIcon className="cursor-pointer hover:text-custom-blue transition !text-3xl"/>
                </div>
            </div>
        </div>
    );
};

export default Post;