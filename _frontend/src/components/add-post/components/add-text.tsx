import React, {useEffect, useRef, useState} from 'react';
import CloseIcon from "@mui/icons-material/Close";
import ReactQuill from "react-quill";
import dynamic from "next/dynamic";
import {NextPage} from "next";
import IsNft from "@/components/add-post/components/is-nft";
import {PostInfoType} from "@/components/add-post/add-post.type";
import {PostContentTypeEnum} from "@/enums/global/post-enum";

let Quill: React.ComponentType<ReactQuill.ReactQuillProps>

type Props = {
    id: number
    nftEnabled?: boolean

    onClose: () => void
    onDrop: () => void
    onDragStart: (id: number) => void
    onDragEnter: (id: number) => void
    onModifyContent: (value: PostInfoType, type: "ADD" | "EDIT") => void
}

const AddText: NextPage<Props> = ({id, nftEnabled, onClose, onDrop, onDragEnter, onDragStart, onModifyContent}) => {
    const nft = useRef<boolean>(false)
    const [value, setValue] = useState("")

    const containerRef = useRef<HTMLDivElement>(null)
    const [ready, setReady] = useState(false)

    const onTextChange = (e: ReactQuill.UnprivilegedEditor) => {
        setValue(e.getHTML())
        onModifyContent({
            type: PostContentTypeEnum.TEXT,
            id: id,
            data: e.getHTML(),
            nft: nft.current
        }, "EDIT")
    }
    const onNftStatusChange = (e: boolean) => {
        nft.current = e
        onModifyContent({
            type: PostContentTypeEnum.TEXT,
            id: id,
            data: value,
            nft: e
        }, "EDIT")
    }

    useEffect(() => {
        Quill = dynamic(() => import("react-quill"), {ssr: false})
        setReady(true)
        onModifyContent({
            type: PostContentTypeEnum.TEXT,
            id: id,
            nft: nft.current
        }, "ADD")
    }, [])

    return (
        <div className="relative flex flex-col items-center justify-center gap-6 w-full bg-black p-8 pt-12 rounded-lg border-dashed border-2 border-white">
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop} ref={containerRef}
                onDragStart={() => onDragStart(id)}
                onDragEnter={() => onDragEnter(id)}
                draggable={true}
                className="w-full h-full absolute top-0 left-0 z-10 cursor-grab"/>
            <CloseIcon onClick={onClose} className="z-30 hover:text-custom-red transition cursor-pointer !text-3xl absolute right-[1%] top-[2.5%]"/>
            {ready &&
                <div onDragEnter={() => onDragEnter(id)} className="w-full z-30">
                    <Quill
                        onChange={(value, delta, source, editor) => onTextChange(editor)}
                        value={value}
                        className="w-full" theme={"snow"}
                    />
                </div>
            }
            <IsNft nftEnabled={nftEnabled} callback={onNftStatusChange}/>
        </div>
    );
};

export default AddText;