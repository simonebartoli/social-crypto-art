import React, {ReactElement, useState} from 'react';
import RequireLogin from "@/components/library/require-login";
import Navbar from "@/components/settings/navbar";
import {SettingsEnum} from "@/enums/local/settings-enum";
import Personal from "@/components/settings/tabs/personal";

const Settings = () => {
    const [tabToShow, setTabToShow] = useState<SettingsEnum>(SettingsEnum.PERSONAL)
    const changeTab = (selected: SettingsEnum) => {
        setTabToShow(selected)
    }

    return (
        <div className="w-full min-h-screen bg-custom-grey font-main">
            <Navbar changeTab={changeTab}/>
            {
                tabToShow === SettingsEnum.PERSONAL &&
                <Personal/>
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