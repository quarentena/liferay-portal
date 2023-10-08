import React, {useState} from 'react';

import {IoSettingsOutline,
        IoPodiumOutline,
        IoAppsOutline,
        IoAlarmOutline,
        IoAlbumsOutline,
        IoArrowBackCircleOutline} from "react-icons/io5/index.esm.js";

import {Liferay} from '../../common/services/liferay/liferay.js'

const navItemClass ='navitem';
const groupId = Liferay.ThemeDisplay.getSiteGroupId();

export const navbarData = [
    {
        title:'Back',
        path: 'Back',
        icon:<IoArrowBackCircleOutline size='25'/>,
        iconSelected: <IoArrowBackCircleOutline size='25'color='white'/>,
        cName: navItemClass,
        subItems:[
        ]
    },
    {
        title:'Summary',
        path:'/summary',
        icon:<IoAppsOutline size='25'/>,
        iconSelected: <IoAppsOutline size='25'color='white'/>,
        cName: navItemClass,
        subItems:[]
    },
    {
        title:'Settings',
        path:'/settings',
        icon:<IoSettingsOutline size='25'/>,
        iconSelected: <IoSettingsOutline size='25'color='white'/>,
        cName: navItemClass,
        subItems:[
            {title:'Workflow', path:'/workflow'},
            {title:'Backlog', path:'/backlog'}            
        ]
    },
    {
        title:'Performance',
        path:'/ctreport',
        icon:<IoPodiumOutline size='25'/>,
        iconSelected: <IoPodiumOutline size='25'color='white'/>,
        cName: navItemClass,
        subItems:[
            {title:'CFD', path:'/cfd'},
            {title:'Cycle Time', path:'/cycletime'}            
        ]
    },
    {
        title:'Backlog',
        path:'/backlog',
        icon:<IoAlbumsOutline size='25'/>,
        iconSelected: <IoAlbumsOutline size='25'color='white'/>,
        cName: navItemClass,
        subItems:[]
    },
    {
        title:'Predictability',
        path:'/predictability',
        icon:<IoAlarmOutline size='25'/>,
        iconSelected: <IoAlarmOutline size='25'color='white'/>,
        cName: navItemClass,
        subItems:[]
    }
]

