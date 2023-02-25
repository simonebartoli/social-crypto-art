import React, {useEffect, useRef, useState} from 'react';
import Image from "next/image";
import {NextPage} from "next";
import {PostContentType} from "@/components/library/post/post.type";

type Props = {
    post: PostContentType[]
    allNft: boolean
}

const PostContent: NextPage<Props> = ({post, allNft}) => {
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
    }, [post])
    return (
        <>
            <div ref={contentDiv}
                 className={`${openContent ? "max-h-auto": "max-h-[250px]"} flex flex-col items-center py-3 justify-start gap-6 overflow-hidden`}>
                {
                    post.map((_, index) => {
                        if(_.data){
                            if(_.nft && !allNft){
                                return (
                                    <div key={index} className="p-2 mt-8 border-2 border-custom-green rounded-lg relative w-full">
                                        <span className="-top-[1.5rem] right-0 absolute italic">Nft Content</span>
                                        <div dangerouslySetInnerHTML={{__html: _.data}}/>
                                    </div>
                                )
                            }else{
                                return (
                                    <div className="w-full" key={index}>
                                        <div dangerouslySetInnerHTML={{__html: _.data}}/>
                                    </div>
                                )
                            }
                        }else if(_.file){
                            if(_.nft && !allNft){
                                return (
                                    <div key={index} className="p-2 mt-8 border-2 border-custom-green rounded-lg relative w-full">
                                        <span className="-top-[1.5rem] right-0 absolute italic">Nft Content</span>
                                        <div className="w-full min-h-[200px] relative">
                                            <Image
                                                src={(URL.createObjectURL(_.file))}
                                                alt={""}
                                                fill={true}
                                                style={{objectFit: "contain"}}
                                            />
                                        </div>
                                    </div>
                                )
                            }else{
                                return (
                                    <div key={index} className="w-full min-h-[200px] relative">
                                        <Image
                                            src={(URL.createObjectURL(_.file))}
                                            alt={""}
                                            fill={true}
                                            style={{objectFit: "contain"}}
                                        />
                                    </div>
                                )
                            }
                        }
                    })
                }
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