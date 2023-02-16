import React, {useState} from 'react';
import AddTypes from "@/components/add-post/components/add-types";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import {AddPostEnum} from "@/enums/local/add-post-enum";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import GifBoxOutlinedIcon from "@mui/icons-material/GifBoxOutlined";
import AddText from "@/components/add-post/components/add-text";
import AddImage from "@/components/add-post/components/add-image";
import PostOptions from "@/components/add-post/components/post-options";

type ContentType = {
    id: number
    type: AddPostEnum
}

const AddContent = () => {
    const [contents, setContents] = useState<ContentType[]>([])
    const [dragDrop, setDragDrop] = useState({
        start: 1,
        end: 1
    })
    const onAddTypeClick = (e: AddPostEnum) => {
        if(e === AddPostEnum.TEXT) {
            setContents([
                ...contents,
                {
                    type: AddPostEnum.TEXT,
                    id: contents.length > 0 ? Math.max(...contents.map(_ => _.id)) + 1 : 1
                }
            ])
        }else if(e === AddPostEnum.PHOTO){
            setContents([
                ...contents,
                {
                    type: AddPostEnum.PHOTO,
                    id: contents.length > 0 ? Math.max(...contents.map(_ => _.id)) + 1 : 1
                }
            ])
        }else if(e === AddPostEnum.GIF){
            setContents([
                ...contents,
                {
                    type: AddPostEnum.GIF,
                    id: contents.length > 0 ? Math.max(...contents.map(_ => _.id)) + 1 : 1
                }
            ])
        }
    }
    const onContentDelete = (id: number) => {
        setContents(contents.filter(_ => _.id !== id))
    }

    const onDrop = () => {
        const copy = [...contents]
        console.log(dragDrop)
        const startIndex = copy.findIndex(_ => _.id === dragDrop.start)
        const endIndex = copy.findIndex(_ => _.id === dragDrop.end)

        const R = copy[startIndex]
        copy[startIndex] = copy[endIndex]
        copy[endIndex] = R
        console.log(copy)
        setContents(copy)
        setDragDrop({start: 0, end: 0})
    }
    const onDragStart = (id: number) => {
        console.log("START " + id)
        setDragDrop({
            ...dragDrop,
            start: id
        })
    }
    const onDragEnter = (id: number) => {
        console.log("END " + id)
        setDragDrop({
            ...dragDrop,
            end: id
        })
    }

    return (
        <div className="w-[calc(50%-1.5rem)] flex flex-col items-center justify-center gap-12">
           <PostOptions/>
            <div className="w-full flex flex-col gap-8 items-center justify-center">
                {
                    contents.length === 0 ?
                    <span className="text-3xl tracking-widest opacity-50">
                        You can add text, images, gif and videos to your post.
                        Click below to choose what to insert first.
                    </span> :
                    contents.map((_) => {
                        if(_.type === AddPostEnum.TEXT){
                            return (
                                <AddText onDragStart={onDragStart}
                                         onDragEnter={onDragEnter}
                                         onDrop={onDrop}
                                         id={_.id}
                                         onClose={() => onContentDelete(_.id)}
                                         key={_.id}/>
                            )
                        }else if(_.type === AddPostEnum.PHOTO){
                            return (
                                <AddImage onDragStart={onDragStart}
                                          onDragEnter={onDragEnter}
                                          onDrop={onDrop}
                                          id={_.id}
                                          onClose={() => onContentDelete(_.id)}
                                          type={AddPostEnum.PHOTO} key={_.id}/>
                            )
                        }else if(_.type === AddPostEnum.GIF){
                            return (
                                <AddImage onDragStart={onDragStart}
                                          onDragEnter={onDragEnter}
                                          onDrop={onDrop}
                                          id={_.id}
                                          onClose={() => onContentDelete(_.id)}
                                          type={AddPostEnum.GIF} key={_.id}/>
                            )
                        }
                    })
                }
            </div>
            <div className="flex flex-col items-center justify-center gap-4 w-1/2">
                <AddTypes type={"Text"}
                          icon={<StickyNote2OutlinedIcon className="!text-5xl !w-1/5"/>}
                          onClick={() => onAddTypeClick(AddPostEnum.TEXT)}
                />
                <AddTypes type={"Photo"}
                          icon={<AddPhotoAlternateOutlinedIcon className="!text-5xl !w-1/5"/>}
                          onClick={() => onAddTypeClick(AddPostEnum.PHOTO)}
                />
                <AddTypes type={"Gif"}
                          icon={<GifBoxOutlinedIcon className="!text-5xl !w-1/5"/>}
                          onClick={() => onAddTypeClick(AddPostEnum.GIF)}
                />
            </div>
        </div>
    );
};

export default AddContent;