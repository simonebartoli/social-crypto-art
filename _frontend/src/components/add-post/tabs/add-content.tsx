import React, {useEffect, useState} from 'react';
import AddTypes from "@/components/add-post/components/add-types";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import {PostContentTypeEnum} from "@/enums/global/post-enum";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import GifBoxOutlinedIcon from "@mui/icons-material/GifBoxOutlined";
import AddText from "@/components/add-post/components/add-text";
import AddFile from "@/components/add-post/components/add-file";
import PostOptions from "@/components/add-post/components/post-options";
import {PostInfoType} from "@/components/add-post/add-post.type";
import {NextPage} from "next";
import {htmlRegex} from "@/filters";
import {AddPostTypeEnum} from "@/enums/local/add-post-enum";
import {useAddPostInfo} from "@/contexts/add-post-info";
import {NftSellingStatusEnum} from "@/enums/global/nft-enum";

type ContentType = {
    id: number
    type: PostContentTypeEnum
}

type Props = {
    onFormSubmit: () => void
}

const AddContent: NextPage<Props> = ({onFormSubmit}) => {
    const {postType, postInfo, disabled, selling, amount} = useAddPostInfo()

    const [contents, setContents] = useState<ContentType[]>([])
    const [dragDrop, setDragDrop] = useState({
        start: 1,
        end: 1
    })

    const onAddTypeClick = (e: PostContentTypeEnum) => {
        if(e === PostContentTypeEnum.TEXT) {
            setContents([
                ...contents,
                {
                    type: PostContentTypeEnum.TEXT,
                    id: contents.length > 0 ? Math.max(...contents.map(_ => _.id)) + 1 : 1
                }
            ])
        }else if(e === PostContentTypeEnum.PHOTO){
            setContents([
                ...contents,
                {
                    type: PostContentTypeEnum.PHOTO,
                    id: contents.length > 0 ? Math.max(...contents.map(_ => _.id)) + 1 : 1
                }
            ])
        }else if(e === PostContentTypeEnum.GIF){
            setContents([
                ...contents,
                {
                    type: PostContentTypeEnum.GIF,
                    id: contents.length > 0 ? Math.max(...contents.map(_ => _.id)) + 1 : 1
                }
            ])
        }
    }
    const onContentDelete = (id: number) => {
        postInfo.set(postInfo.value.filter(_ => _.id !== id))
        setContents(contents.filter(_ => _.id !== id))
    }

    const onDrop = () => {
        const copy = [...contents]
        const dataCopy = [...postInfo.value]

        const startIndex = copy.findIndex(_ => _.id === dragDrop.start)
        const endIndex = copy.findIndex(_ => _.id === dragDrop.end)

        const R = copy[startIndex]
        copy[startIndex] = copy[endIndex]
        copy[endIndex] = R

        const Z = dataCopy[startIndex]
        dataCopy[startIndex] = dataCopy[endIndex]
        dataCopy[endIndex] = Z

        setContents(copy)
        postInfo.set(dataCopy)
        setDragDrop({start: 0, end: 0})
    }
    const onDragStart = (id: number) => {
        setDragDrop({
            ...dragDrop,
            start: id
        })
    }
    const onDragEnter = (id: number) => {
        setDragDrop({
            ...dragDrop,
            end: id
        })
    }

    const modifyContent = (value: PostInfoType, type: "ADD" | "EDIT") => {
        if(type === "ADD"){
            postInfo.set([...postInfo.value, {
                type: value.type,
                data: value.data,
                file: value.file,
                id: value.id,
                nft: value.nft
            }])
        }else{
            const copy = postInfo.value.map(_ => {
                if(_.id === value.id){
                    return {
                        ..._,
                        nft: value.nft,
                        data: value.data,
                        file: value.file
                    }
                }
                return _
            })
            postInfo.set(copy)
        }
    }

    useEffect(() => {
        const copy = postInfo.value.map(_ => {
            if(postType.value === AddPostTypeEnum.POST){
                return {
                    ..._,
                    nft: false
                }
            }else if(postType.value === AddPostTypeEnum.NFT){
                return {
                    ..._,
                    nft: true
                }
            }
            return _
        })
        postInfo.set(copy)
    }, [postType.value])
    useEffect(() => {
        let OK = true
        if(OK){if(postInfo.value.length > 0){
            for(const _ of postInfo.value){
                if(_.data){
                    const copy = _.data
                    if(copy.replaceAll(htmlRegex, "") === ""){
                        OK = false
                    }
                }else if(_.file){
                    continue
                }else{
                    OK = false
                }
                if(!OK) break
            }
        }else{
            OK = false
        }}
        if(OK){
            if(selling.value !== NftSellingStatusEnum[NftSellingStatusEnum.NO_SELLING]){
                if(amount.value === ""){
                    OK = false
                }
            }
        }
        disabled.set(!OK)
    }, [postInfo.value, selling.value, amount.value])

    return (
        <div className="w-[calc(50%-1.5rem)] flex flex-col items-center justify-center gap-12">
            <div className="flex flex-col w-full gap-4">
                <PostOptions/>
                <button onClick={onFormSubmit} disabled={disabled.value} className="disabled:text-black disabled:bg-custom-light-grey disabled:cursor-not-allowed border-2 border-white hover:bg-white hover:text-black transition p-6 w-full text-2xl rounded-lg bg-black text-white">Submit Post</button>
            </div>
            <div className="w-full flex flex-col gap-8 items-center justify-center">
                {
                    contents.length === 0 ?
                    <span className="text-3xl tracking-widest opacity-50">
                        You can add text, images, gif and videos to your post.
                        Click below to choose what to insert first.
                    </span> :
                    contents.map((_) => {
                        if(_.type === PostContentTypeEnum.TEXT){
                            return (
                                <AddText onDragStart={onDragStart}
                                         onDragEnter={onDragEnter}
                                         onDrop={onDrop}
                                         onModifyContent={modifyContent}
                                         id={_.id}
                                         nftEnabled={
                                            postType.value === AddPostTypeEnum.NFT ? true :
                                            postType.value === AddPostTypeEnum.POST ? false : undefined
                                         }
                                         onClose={() => onContentDelete(_.id)}
                                         key={_.id}
                                />
                            )
                        }else if(_.type === PostContentTypeEnum.PHOTO){
                            return (
                                <AddFile onDragStart={onDragStart}
                                         onDragEnter={onDragEnter}
                                         onDrop={onDrop}
                                         id={_.id}
                                         nftEnabled={
                                              postType.value === AddPostTypeEnum.NFT ? true :
                                              postType.value === AddPostTypeEnum.POST ? false : undefined
                                          }
                                         onClose={() => onContentDelete(_.id)}
                                         type={PostContentTypeEnum.PHOTO} key={_.id}
                                         onModifyContent={modifyContent}
                                />
                            )
                        }else if(_.type === PostContentTypeEnum.GIF){
                            return (
                                <AddFile onDragStart={onDragStart}
                                         onDragEnter={onDragEnter}
                                         onDrop={onDrop}
                                         id={_.id}
                                         nftEnabled={
                                              postType.value === AddPostTypeEnum.NFT ? true :
                                              postType.value === AddPostTypeEnum.POST ? false : undefined
                                          }
                                         onClose={() => onContentDelete(_.id)}
                                         type={PostContentTypeEnum.GIF} key={_.id}
                                         onModifyContent={modifyContent}
                                />
                            )
                        }
                    })
                }
            </div>
            <div className="flex flex-col items-center justify-center gap-4 w-1/2">
                <AddTypes type={"Text"}
                          icon={<StickyNote2OutlinedIcon className="!text-5xl !w-1/5"/>}
                          onClick={() => onAddTypeClick(PostContentTypeEnum.TEXT)}
                />
                <AddTypes type={"Photo"}
                          icon={<AddPhotoAlternateOutlinedIcon className="!text-5xl !w-1/5"/>}
                          onClick={() => onAddTypeClick(PostContentTypeEnum.PHOTO)}
                />
                <AddTypes type={"Gif"}
                          icon={<GifBoxOutlinedIcon className="!text-5xl !w-1/5"/>}
                          onClick={() => onAddTypeClick(PostContentTypeEnum.GIF)}
                />
            </div>
        </div>
    );
};

export default AddContent;