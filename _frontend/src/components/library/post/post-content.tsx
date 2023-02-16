import React, {useEffect, useRef, useState} from 'react';
import Image from "next/image";
import TEST from "../../../../public/test.webp";
import {NextPage} from "next";

type Props = {
    nft: boolean
}

const PostContent: NextPage<Props> = ({nft}) => {
    const contentDiv = useRef<HTMLDivElement>(null)
    const [overflowing, setOverflowing] = useState(false)
    const [openContent, setOpenContent] = useState(false)

    useEffect(() => {
        if(contentDiv.current !== null){
            if(contentDiv.current.scrollHeight > contentDiv.current.clientHeight){
                setOverflowing(true)
            }else{
                setOverflowing(false)
            }
        }
    }, [])
    return (
        <>
            <div ref={contentDiv}
                 className={`${openContent ? "max-h-auto": "max-h-[250px]"} flex flex-col items-center py-3 justify-start gap-6 overflow-hidden`}>
                {
                    nft ?
                    <div className="p-2 mt-8 border-2 border-custom-green rounded-lg relative">
                        <span className="-top-[1.5rem] right-0 absolute italic">Nft Content</span>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                        </p>
                    </div> :

                    <div>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                        </p>
                    </div>
                }
                <div className="w-full min-h-[200px] relative">
                    <Image
                        src={TEST}
                        alt={""}
                        fill={true}
                        style={{objectFit: "contain"}}
                    />
                </div>
            </div>
            {
                (overflowing && !openContent) ?
                    <span onClick={() => setOpenContent(!openContent)} className="w-full text-right underline text-custom-blue cursor-pointer">Explore more...</span> :
                    (overflowing && openContent) &&
                    <span onClick={() => setOpenContent(!openContent)} className="w-full text-right underline text-custom-blue cursor-pointer">Explore less...</span>
            }
        </>
    );
};

export default PostContent;