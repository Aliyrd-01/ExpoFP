import React from 'react'
import './Booth.scss'
import { useObserver } from 'mobx-react-lite';
import { uiState } from '../store';
import { BoothBase } from '../store/BoothStore';

function Booth(){
    return <div>Booth</div>;
}


export default () => useObserver(() => <>{!uiState.menu && uiState.details && uiState.details instanceof BoothBase ? <Booth /> : null}</>);
