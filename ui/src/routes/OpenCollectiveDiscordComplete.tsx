import React from "react";
import { useLocation } from "react-router-dom";

export default function OpenCollectiveDiscordComplete() {
    const { search } = useLocation();
    const query = React.useMemo(() => new URLSearchParams(search), [search]);
    if (!query.has('oc-code') && !query.has('dsc-code')) document.location.href = '../oc'

    const websocket = new WebSocket(`wss://automatadev.srizan.dev/oc/ws?oc-code=${query.get('oc-code')}&dsc-code=${query.get('dsc-code')}`)
    websocket.onmessage = (event) => {
        console.log(event.data)
    }
    
    return (
        <p>hey</p>
    )
}