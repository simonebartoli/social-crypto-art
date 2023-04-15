import React, {createContext, ReactNode, useState} from 'react';
import {NextPage} from "next";
import {PostInfoType} from "@/components/add-post/add-post.type";
import {AddPostTypeEnum} from "@/enums/local/add-post-enum";
import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";
import {DateTime} from "luxon";
import {Visibility} from "@/__generated__/graphql";

export type ContextType = {
    postInfo: {
        value: PostInfoType[],
        set: React.Dispatch<React.SetStateAction<PostInfoType[]>>
    }
    postType: {
        value: AddPostTypeEnum,
        set: React.Dispatch<React.SetStateAction<AddPostTypeEnum>>
    }
    visibility: {
        value: string,
        set: React.Dispatch<React.SetStateAction<string>>
    }
    selling: {
        value: string,
        set: React.Dispatch<React.SetStateAction<string>>
    }
    minIncrement: {
        value: string,
        set: React.Dispatch<React.SetStateAction<string>>
    }
    deadline: {
        value: Date,
        set: React.Dispatch<React.SetStateAction<Date>>
    }
    currency: {
        value: string,
        set: React.Dispatch<React.SetStateAction<string>>
    }
    amount: {
        value: string,
        set: React.Dispatch<React.SetStateAction<string>>
    }
    royalties: {
        value: string,
        set: React.Dispatch<React.SetStateAction<string>>
    }
    disabled: {
        value: boolean,
        set: React.Dispatch<React.SetStateAction<boolean>>
    }
}

const loginContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const AddPostInfo: NextPage<Props> = ({children}) => {
    const [postInfo, setPostInfo] = useState<PostInfoType[]>([])
    const [postType, setPostType] = useState(AddPostTypeEnum.POST)
    const [visibility, setVisibility] = useState<string>(Visibility.Public)
    const [selling, setSelling] = useState<string>(NftSellingStatusEnum[NftSellingStatusEnum.NO_SELLING])
    const [minIncrement, setMinIncrement] = useState("10")
    const [deadline, setDeadline] = useState<Date>(DateTime.now().plus({day: 10}).toJSDate())
    const [disabled, setDisabled] = useState<boolean>(true)

    const [currency, setCurrency] = useState<string>(CurrencyEnum[CurrencyEnum.ETH])
    const [amount, setAmount] = useState<string>("")
    const [royalties, setRoyalties] = useState<string>("0")

    const value = {
        postInfo: {
            value: postInfo,
            set: setPostInfo
        },
        postType: {
            value: postType,
            set: setPostType
        },
        visibility: {
            value: visibility,
            set: setVisibility
        },
        selling: {
            value: selling,
            set: setSelling
        },
        minIncrement: {
            value: minIncrement,
            set: setMinIncrement
        },
        deadline: {
            value: deadline,
            set: setDeadline
        },
        currency: {
            value: currency,
            set: setCurrency
        },
        amount: {
            value: amount,
            set: setAmount
        },
        royalties: {
            value: royalties,
            set: setRoyalties
        },
        disabled: {
            value: disabled,
            set: setDisabled
        }
    }
    return (
        <loginContext.Provider value={value}>
            {children}
        </loginContext.Provider>
    );
};

export const useAddPostInfo = () => {
    const context = React.useContext(loginContext)
    if (context === undefined) {
        throw new Error('useAddPostInfo must be used within a AddPostInfoProvider')
    }
    return context
}
