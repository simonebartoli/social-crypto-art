import React, {useEffect, useRef, useState} from 'react';
import CloseIcon from "@mui/icons-material/Close";
import ReactQuill from "react-quill";
import dynamic from "next/dynamic";
import {NextPage} from "next";
import IsNft from "@/components/add-post/components/is-nft";
let Quill: React.ComponentType<ReactQuill.ReactQuillProps>

type Props = {
    onClose: () => void
    id: number
    onDrop: () => void
    onDragStart: (id: number) => void
    onDragEnter: (id: number) => void
}

const AddText: NextPage<Props> = ({onClose, id, onDrop, onDragEnter, onDragStart}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [ready, setReady] = useState(false)
    useEffect(() => {
        Quill = dynamic(() => import("react-quill"), {ssr: false})
        setReady(true)
    }, [])

    return (
        <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} ref={containerRef} onDragStart={() => onDragStart(id)} onDragEnter={() => onDragEnter(id)} draggable={true} className="relative flex flex-col items-center justify-center gap-6 w-full bg-black p-8 pt-12 rounded-lg border-dashed border-2 border-white">
            <CloseIcon onClick={onClose} className="hover:text-custom-red transition cursor-pointer !text-3xl absolute right-[1%] top-[2.5%]"/>
            {ready && <Quill className="w-full" theme={"snow"}/>}
            <IsNft/>
        </div>
    );
};

export default AddText;