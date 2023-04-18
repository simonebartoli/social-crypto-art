import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import CloseIcon from "@mui/icons-material/Close";
import ImageSearchOutlinedIcon from "@mui/icons-material/ImageSearchOutlined";
import {NextPage} from "next";
import {PostContentTypeEnum} from "@/enums/global/post-enum";
import IsNft from "@/components/add-post/components/is-nft";
import {PostInfoType} from "@/components/add-post/add-post.type";
import {toast} from "react-toastify";

type Props = {
    id: number
    type: PostContentTypeEnum.PHOTO | PostContentTypeEnum.GIF
    nftEnabled?: boolean

    onClose: () => void
    onDrop: () => void
    onDragStart: (id: number) => void
    onDragEnter: (id: number) => void
    onModifyContent: (value: PostInfoType, type: "ADD" | "EDIT") => void
}

const AddFile: NextPage<Props> = ({type, onClose, id, nftEnabled, onDrop, onDragEnter, onDragStart, onModifyContent}) => {
    const nft = useRef<boolean>(false)
    const imageTypeAllowed = useRef(["image/jpg", "image/jpeg", "image/png"])
    const gifTypeAllowed = useRef(["image/gif"])

    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)

    const onInputFile = () => {
        if(inputRef.current !== null){
            inputRef.current.click()
        }
    }
    const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        if(file !== null){
            if(type === PostContentTypeEnum.PHOTO){
                if(imageTypeAllowed.current.includes(file.type)){
                    setFile(file)
                }else{
                    toast.error("This file is not accepted")
                }
            }else if(type === PostContentTypeEnum.GIF){
                if(gifTypeAllowed.current.includes(file.type)){
                    setFile(file)
                }else{
                    toast.error("This file is not accepted")
                }
            }
        }
    }
    const onNftStatusChange = (e: boolean) => {
        nft.current = e
        onModifyContent({
            type: PostContentTypeEnum.TEXT,
            id: id,
            file: file ?? undefined,
            nft: e
        }, "EDIT")
    }

    useEffect(() => {
        if(file !== null){
            onModifyContent({
                type: type,
                id: id,
                file: file,
                nft: nft.current
            }, "EDIT")
        }
    }, [file])
    useEffect(() => {
        onModifyContent({
            type: type,
            id: id,
            nft: nft.current
        }, "ADD")
    }, [])

    return (
        <div onDragOver={(e) => e.preventDefault()} draggable={true} onDrop={onDrop} onDragStart={() => onDragStart(id)} onDragEnter={() => onDragEnter(id)} className="cursor-grab relative w-full flex flex-col items-center gap-4 justify-center bg-black p-8 pt-12 rounded-lg border-dashed border-2 border-white">
            <CloseIcon onClick={onClose} className="hover:text-custom-red transition cursor-pointer !text-3xl absolute right-[1%] top-[2.5%]"/>
            <div onClick={onInputFile} className="cursor-pointer flex flex-row justify-center items-center gap-4">
                <ImageSearchOutlinedIcon className="!text-4xl"/>
                <span className="text-2xl">
                    {
                        file === null ?
                            `Select your ${type === PostContentTypeEnum.PHOTO ? "Image" : "Gif"}...` :
                            "Click Here to Change your Image"
                    }
                </span>
                <input accept={`${type === PostContentTypeEnum.GIF ? "image/gif" : "image/jpeg,image/png "}`} onChange={onFileSelected} ref={inputRef} type="file" className="hidden"/>
            </div>
            {
                file !== null &&
                <span>{file.name}</span>
            }
            <IsNft nftEnabled={nftEnabled} callback={onNftStatusChange}/>
        </div>
    );
};

export default AddFile;