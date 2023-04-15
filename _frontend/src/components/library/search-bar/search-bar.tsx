import React, {useEffect, useState} from 'react';
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EntryTab from "@/components/library/search-bar/entry-tab";
import {useLazyQuery} from "@apollo/client";
import {GET_LIST_OF_USERS} from "@/graphql/account-info";
import {useSearchBar} from "@/contexts/search-bar";
import {useLogin} from "@/contexts/login";

type ListUserType = {
    nickname: string
}

const SearchBar = () => {
    const {personalInfo} = useLogin()
    const {setOpen} = useSearchBar()
    const [query, setQuery] = useState("")
    const [listUsers, setListUsers] = useState<ListUserType[]>([])

    useEffect(() => {
        if(window){
            const onKeyDown = (evt: KeyboardEvent) => {
                if(evt.key === "Escape"){
                    setOpen(false)
                }
            }
            window.addEventListener("keydown", onKeyDown)
            return () => window.removeEventListener("keypress", onKeyDown)
        }
    }, [])

    const [getListOfUsers] = useLazyQuery(GET_LIST_OF_USERS, {
        onCompleted: (data) => {
            setListUsers(data.getListOfUsers.filter(_ => _.nickname !== personalInfo?.nickname))
        },
        onError: (error) => {
            console.log(error.message)
        }
    })
    useEffect(() => {
        if(query.length >= 3){
            getListOfUsers({
                variables: {
                    data: {
                        query: query
                    }
                }
            })
        }else{
            setListUsers([])
        }
    }, [query])

    return (
        <div className="flex flex-col gap-12 items-center justify-start w-[calc(100%-1.5rem)] absolute top-[10%] left-[0.75rem] p-4">
            <div className="flex flex-row items-center justify-between w-full bg-white p-6 rounded-lg">
                <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" className="text-4xl text-black w-full !outline-none tracking-wider" placeholder="Search for a user here..."/>
                <SearchOutlinedIcon className="!text-4xl "/>
            </div>
            <div className="flex flex-col w-full rounded-lg bg-white max-h-[300px] overflow-y-auto">
                {
                    listUsers.map((_, index) =>
                        <EntryTab nickname={_.nickname} key={index}/>
                    )
                }
            </div>
        </div>
    );
};

export default SearchBar;