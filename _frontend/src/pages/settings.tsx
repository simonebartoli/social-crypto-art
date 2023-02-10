import React, {ReactElement, useState} from 'react';
import RequireLogin from "@/components/library/require-login";
import Navbar from "@/components/settings/navbar";
import {SettingsEnum} from "@/enums/local/settings-enum";
import Personal from "@/components/settings/tabs/personal";
import Web3 from "@/components/settings/tabs/web3";
import {useLayout} from "@/contexts/layout";

const Settings = () => {
    const {widthPage} = useLayout()
    const [navWidth, setNavWidth] = useState<number | null>(null)
    const [tabToShow, setTabToShow] = useState<SettingsEnum>(SettingsEnum.PERSONAL)

    const updateNavWidth = (x: number) => {
        setNavWidth(x)
    }
    const changeTab = (selected: SettingsEnum) => {
        setTabToShow(selected)
    }

    return (
        <div className="w-full flex flex-row min-h-screen bg-custom-grey font-main">
            <Navbar tabToShow={tabToShow} updateNavWidth={updateNavWidth} changeTab={changeTab}/>
            {
                navWidth !== null &&
                <div style={{left: `${navWidth}px`, width: `${widthPage - navWidth}px`}} className="relative top-0 p-8 bg-custom-grey">
                    {
                        tabToShow === SettingsEnum.PERSONAL ?
                            <Personal/>:
                            tabToShow === SettingsEnum.WEB3 &&
                            <Web3/>
                    }
                </div>
            }
        </div>
    );
};

Settings.getLayout = function getLayout(page: ReactElement) {
    return (
        <RequireLogin>
            {page}
        </RequireLogin>
    )
}

export default Settings;