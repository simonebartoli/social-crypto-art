import React, {useEffect, useRef, useState} from 'react';
import KeyboardDoubleArrowUpOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowUpOutlined";
import KeyboardDoubleArrowDownOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowDownOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import {NextPage} from "next";
import {useModal} from "@/contexts/modal";
import ActionRequireLogin from "@/components/library/auth/action-require-login";

type Props = {
    nft: boolean
    comment: {
        value: boolean
        set: React.Dispatch<React.SetStateAction<boolean>>
    }
}

const PostInteractions: NextPage<Props> = ({comment, nft}) => {
    const {showModal, open} = useModal()
    const opened = useRef<boolean>(false)

    const [showSections, setShowSections] = useState({
        nft: false
    })

    useEffect(() => {
        if(showSections.nft){
            if(open){
                opened.current = true
            }else if(!open && opened.current){
                opened.current = false
                setShowSections({...showSections, nft: false})
            }
        }
    }, [showSections, open])

    return (
        <div className="mt-8 text-white w-full flex flex-col gap-3">
            {
                nft &&
                <div onClick={() => setShowSections({...showSections, nft: true})}
                     className="cursor-pointer hover:bg-white hover:text-black transition border-black border-[1px] shadow-lg p-4 text-xl bg-black rounded-lg w-full flex flex-col items-center justify-center">
                    {
                        showSections.nft &&
                        <ActionRequireLogin callback={() => showModal(
                            <></>
                        )}/>
                    }
                    <span>Check Further Info / Make Offer</span>
                </div>
            }
            <div className="flex flex-row items-center justify-around p-3 rounded-lg w-full bg-black">
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
                    <QuestionAnswerOutlinedIcon onClick={() => comment.set(!comment.value)}
                                                className={`${comment.value && "text-custom-blue"} cursor-pointer hover:text-custom-blue transition !text-3xl`}/>
                </div>
            </div>
        </div>
    );
};

export default PostInteractions;