import React, {ChangeEvent, useRef, useState} from 'react';
import CloseIcon from "@mui/icons-material/Close";
import ImageSearchOutlinedIcon from "@mui/icons-material/ImageSearchOutlined";
import {NextPage} from "next";
import {AddPostEnum} from "@/enums/local/add-post-enum";
import IsNft from "@/components/add-post/components/is-nft";

type Props = {
    type: AddPostEnum.PHOTO | AddPostEnum.GIF
    onClose: () => void
    id: number
    onDrop: () => void
    onDragStart: (id: number) => void
    onDragEnter: (id: number) => void
}

const AddImage: NextPage<Props> = ({type, onClose, id, onDrop, onDragEnter, onDragStart}) => {
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
            setFile(file)
        }
    }

    return (
        <div onDragOver={(e) => e.preventDefault()} draggable={true} onDrop={onDrop} onDragStart={() => onDragStart(id)} onDragEnter={() => onDragEnter(id)} className="relative w-full flex flex-col items-center gap-4 justify-center bg-black p-8 pt-12 rounded-lg border-dashed border-2 border-white">
            <CloseIcon onClick={onClose} className="hover:text-custom-red transition cursor-pointer !text-3xl absolute right-[1%] top-[2.5%]"/>
            <div onClick={onInputFile} className="cursor-pointer flex flex-row justify-center items-center gap-4">
                <ImageSearchOutlinedIcon className="!text-4xl"/>
                <span className="text-2xl">
                    {
                        file === null ?
                            `Select your ${type === AddPostEnum.PHOTO ? "Image" : "Gif"}...` :
                            "Click Here to Change your Image"
                    }
                </span>
                <input onChange={onFileSelected} ref={inputRef} type="file" className="hidden"/>
            </div>
            {
                file !== null &&
                <span>{file.name}</span>
            }
            <IsNft/>
        </div>
    );
};

export default AddImage;